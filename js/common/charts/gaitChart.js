// js/common/charts/gaitChart.js
function drawGaitChartChartJS(assessments) {
  const canvas = document.getElementById("gaitChartCanvas");
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
  let dataValues = sorted.map((d) => d.GaitSpeed);

  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
  }

  const baseline1 = 100;
  const baseline2 = 80;
  const vals = dataValues.filter((v) => v !== null);
  const minValue = Math.min(...vals, baseline1, baseline2);
  const maxValue = Math.max(...vals, baseline1, baseline2);
  let yMin = minValue - (maxValue - minValue) * 0.2;
  let yMax = maxValue + (maxValue - minValue) * 0.2;
  if (yMin < 0) yMin = 0;
  if (yMax - yMin < 10) yMax = yMin + 10;

  if (window.gaitChartInstance) window.gaitChartInstance.destroy();

  window.gaitChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("gaitSpeed"),
          data: dataValues,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,0.3)",
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
              return `${fullDate}：${value.toFixed(1)} ${t("gaitSpeed")}`;
            },
          },
        },
        annotation: {
          annotations: {
            baseline100: {
              type: "line",
              yMin: 100,
              yMax: 100,
              borderColor: "#6b7280",
              borderWidth: 2,
              borderDash: [6, 6],
              label: { display: true, content: "" },
            },
            baseline80: {
              type: "line",
              yMin: 80,
              yMax: 80,
              borderColor: "#6b7280",
              borderWidth: 2,
              borderDash: [6, 6],
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
          title: { display: true, text: t("gaitSpeed") },
          beginAtZero: false,
          min: yMin,
          max: yMax,
        },
      },
    },
  });
}
