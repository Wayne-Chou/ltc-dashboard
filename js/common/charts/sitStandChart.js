// js/common/charts/sitStandChart.js
Chart.register(window["chartjs-plugin-annotation"]);

function drawSitStandChartChartJS(assessments) {
  const canvas = document.getElementById("sitStandChartCanvas");
  if (!canvas) return;

  if (!assessments || assessments.length === 0) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

  let labels = sorted.map((d) => {
    const date = new Date(d.Date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  let dataValues = sorted.map((d) => d.ChairSecond);

  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
  }

  const baselineY = 12;
  const minValue = Math.min(...dataValues.filter((v) => v !== null), baselineY);
  const maxValue = Math.max(...dataValues.filter((v) => v !== null), baselineY);
  let yMin = minValue - (maxValue - minValue) * 0.2;
  let yMax = maxValue + (maxValue - minValue) * 0.2;
  if (yMin < 0) yMin = 0;
  if (yMax - yMin < 5) yMax = yMin + 5;

  if (window.sitStandChartInstance) window.sitStandChartInstance.destroy();

  window.sitStandChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("sitStand"),
          data: dataValues,
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.3)",
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              const dateObj = sorted[context.dataIndex]
                ? new Date(sorted[context.dataIndex].Date)
                : null;
              const fullDate = dateObj
                ? `${dateObj.getFullYear()}/${
                    dateObj.getMonth() + 1
                  }/${dateObj.getDate()}`
                : labels[context.dataIndex];
              return `${fullDate}：${value.toFixed(1)} ${t("seconds")}`;
            },
          },
        },
        annotation: {
          annotations: {
            baseline: {
              type: "line",
              yMin: baselineY,
              yMax: baselineY,
              borderColor: "#6b7280",
              borderWidth: 2,
              borderDash: [6, 4],
              label: { display: true, content: "" },
            },
          },
        },
      },
      scales: {
        x: {
          offset: true,
          title: { display: true, text: t("dates") },
          ticks: { autoSkip: true, maxTicksLimit: 7 },
        },
        y: {
          title: { display: true, text: t("sitStand") },
          beginAtZero: false,
          min: yMin,
          max: yMax,
        },
      },
    },
  });
}
