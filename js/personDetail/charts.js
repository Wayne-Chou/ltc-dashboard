Chart.register(window["chartjs-plugin-annotation"]);
// 新曲線坐站秒數趨勢
function drawSitStandChartChartJS(assessments) {
  const ctx = document.getElementById("sitStandChartCanvas");
  if (!ctx) return;

  if (!assessments || assessments.length === 0) {
    ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
    return;
  }

  // 依日期排序
  const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

  // 完整資料
  let labels = sorted.map((d) => {
    const date = new Date(d.Date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  let dataValues = sorted.map((d) => d.ChairSecond);
  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
  }
  const baselineY = 12; // 基準線
  const minValue = Math.min(...dataValues, baselineY);
  const maxValue = Math.max(...dataValues, baselineY);
  let yMin = minValue - (maxValue - minValue) * 0.2;
  let yMax = maxValue + (maxValue - minValue) * 0.2;
  if (yMin < 0) yMin = 0;
  if (yMax - yMin < 5) yMax = yMin + 5;
  // 如果之前已有圖表，先銷毀
  if (window.sitStandChartInstance) {
    window.sitStandChartInstance.destroy();
  }

  // 建立圖表
  window.sitStandChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels, // 全部資料
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
      interaction: {
        mode: "nearest",
        intersect: false,
      },
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
              const unit = t("seconds");
              return `${fullDate}：${value.toFixed(1)} ${unit}`;
            },
          },
        },
        annotation: {
          annotations: {
            baseline: {
              type: "line",
              yMin: 12,
              yMax: 12,
              borderColor: "#6b7280",
              borderWidth: 2,
              borderDash: [6, 4], // 虛線樣式
              label: {
                display: true,
                content: "",
                position: "end",
                backgroundColor: "rgba(107,114,128,0.1)",
                color: "#374151",
                font: {
                  style: "italic",
                },
              },
            },
          },
        },
      },

      scales: {
        x: {
          offset: true,
          title: { display: true, text: t("dates") },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 7, // 最多顯示 7 個刻度
          },
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

// 新曲線圖平衡測驗得分
function drawBalanceChartChartJS(assessments) {
  const ctx = document.getElementById("balanceChartCanvas");
  if (!ctx) return;

  if (!assessments || assessments.length === 0) {
    ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
    return;
  }

  // 依日期排序
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
  const yMin = 0;
  const yMax = 4;

  // 如果之前已有圖表，先銷毀
  if (window.balanceChartInstance) {
    window.balanceChartInstance.destroy();
  }

  window.balanceChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels, // 全部資料
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
      interaction: {
        mode: "nearest",
        intersect: false,
      },
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
              const unit = t("points");
              return `${fullDate}：${value.toFixed(1)} ${unit}`;
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
              label: {
                display: true,
                content: "",
                position: "start",
                backgroundColor: "rgba(107,114,128,0.1)",
                color: "#374151",
                font: { weight: "bold" },
                padding: 4,
              },
            },
          },
        },
      },
      scales: {
        x: {
          offset: true,
          title: { display: true, text: t("dates") },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 7, // 最多顯示 7 個刻度
          },
        },
        y: {
          title: { display: true, text: t("balanceTrend") },
          beginAtZero: false,
          min: yMin,
          max: yMax,
        },
      },
    },
  });
}
// 新曲線圖步行速度趨勢
function drawGaitChartChartJS(assessments) {
  const ctx = document.getElementById("gaitChartCanvas");
  if (!ctx) return;

  if (!assessments || assessments.length === 0) {
    ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
    return;
  }

  // 依日期排序
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
  const minValue = Math.min(...dataValues, baseline1, baseline2);
  const maxValue = Math.max(...dataValues, baseline1, baseline2);
  let yMin = minValue - (maxValue - minValue) * 0.2;
  let yMax = maxValue + (maxValue - minValue) * 0.2;
  if (yMin < 0) yMin = 0;
  if (yMax - yMin < 10) yMax = yMin + 10;

  if (window.gaitChartInstance) {
    window.gaitChartInstance.destroy();
  }

  window.gaitChartInstance = new Chart(ctx, {
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
      interaction: {
        mode: "nearest",
        intersect: false,
      },
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
              const unit = t("gaitSpeed");
              return `${fullDate}：${value.toFixed(1)} ${unit}`;
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
              label: {
                display: true,
                content: "",
                position: "start",
                backgroundColor: "rgba(107,114,128,0.1)",
                color: "#374151",
                font: { weight: "bold" },
                padding: 4,
              },
            },
            baseline80: {
              type: "line",
              yMin: 80,
              yMax: 80,
              borderColor: "#6b7280",
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                display: true,
                content: "",
                position: "start",
                backgroundColor: "rgba(107,114,128,0.1)",
                color: "#374151",
                font: { weight: "bold" },
                padding: 4,
              },
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

// 新曲線圖平均AI跌倒風險機率
function drawRiskChartChartJS(assessments) {
  const ctx = document.getElementById("riskChartCanvas");
  if (!ctx) return;

  if (!assessments || assessments.length === 0) {
    ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
    return;
  }

  // 依日期排序
  const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

  let labels = sorted.map((d) => {
    const date = new Date(d.Date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  let dataValues = sorted.map((d) => d.RiskRate);
  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
  }
  // 如果之前已有圖表，先銷毀
  if (window.riskChartInstance) {
    window.riskChartInstance.destroy();
  }

  window.riskChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels, // 全部資料
      datasets: [
        {
          label: t("fallRisk"),
          data: dataValues,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.3)",
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
      interaction: {
        mode: "nearest",
        intersect: false,
      },
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
              const unit = t("fallRisk");
              return `${fullDate}：${value.toFixed(1)} ${unit}`;
            },
          },
        },
      },
      scales: {
        x: {
          offset: true,
          title: { display: true, text: t("dates") },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 7, // 最多顯示 7 個刻度
          },
        },
        y: {
          title: { display: true, text: t("fallRisk") },
          beginAtZero: false,
        },
      },
    },
  });
}
// 曲線圖查無資料
function drawNoDataChart() {
  const charts = [
    "sitStandChartCanvas",
    "balanceChartCanvas",
    "gaitChartCanvas",
    "riskChartCanvas",
  ];

  charts.forEach((id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#888";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 顯示文字
    ctx.fillText(t("alertNoData"), canvas.width / 2, canvas.height / 2);

    // 加上遮罩防止滑鼠觸碰折線圖顯示問題
    if (!canvas.parentElement.querySelector(".no-data-overlay")) {
      const overlay = document.createElement("div");
      overlay.classList.add("no-data-overlay");
      Object.assign(overlay.style, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        pointerEvents: "auto",
        zIndex: 10,
      });

      canvas.parentElement.style.position = "relative";
      canvas.parentElement.appendChild(overlay);
    }
  });
}
// 圖表下載功能
document.querySelectorAll(".download-chart").forEach((btn) => {
  // btn.addEventListener("click", () => {
  //   const targetId = btn.dataset.target;
  //   const canvas = document.getElementById(targetId);
  //   if (!canvas) return;
  //   // 添加白底
  //   const ctx = canvas.getContext("2d");
  //   ctx.save();
  //   ctx.globalCompositeOperation = "destination-over";
  //   ctx.fillStyle = "white";
  //   ctx.fillRect(0, 0, canvas.width, canvas.height);
  //   ctx.restore();
  //   //圖檔
  //   const image = canvas.toDataURL("image/png", 0.9);
  //   // a 標籤下載
  //   const link = document.createElement("a");
  //   link.href = image;
  //   link.download = `${targetId}.png`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // });
});
function applyLanguage() {
  document.querySelectorAll("[data-lang]").forEach((el) => {
    const key = el.getAttribute("data-lang");
    el.textContent = t(key);
  });
}
window.drawAllCharts = function (assessments) {
  // console.log("drawAllCharts called", assessments);

  if (!assessments || assessments.length === 0) {
    drawNoDataChart();
    return;
  }

  drawSitStandChartChartJS(assessments);
  drawBalanceChartChartJS(assessments);
  drawGaitChartChartJS(assessments);
  drawRiskChartChartJS(assessments);
  const trend = calculateTrend(assessments);
  renderTrendSummary(trend);
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.filteredAssessments) {
    drawSitStandChartChartJS(window.filteredAssessments);
    drawBalanceChartChartJS(window.filteredAssessments);
    drawGaitChartChartJS(window.filteredAssessments);
    drawRiskChartChartJS(window.filteredAssessments);
  }
});
