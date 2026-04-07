// js/common/charts/balanceChart.js
function drawBalanceChartChartJS(assessments) {
  const canvas = document.getElementById("balanceChartCanvas");
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

  let dataValues = sorted.map((d) => d.BalanceScore);

  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
  }

  if (window.balanceChartInstance) window.balanceChartInstance.destroy();

  window.balanceChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("balanceScore"),
          data: dataValues,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.3)",
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
              return `${fullDate}：${value.toFixed(1)} ${t("points")}`;
            },
          },
        },
        annotation: {
          annotations: {
            baseline: {
              type: "line",
              yMin: 3.5,
              yMax: 3.5,
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
          title: { display: true, text: t("balanceScore") },
          beginAtZero: false,
          min: 0,
          max: 4,
        },
      },
    },
  });
}
