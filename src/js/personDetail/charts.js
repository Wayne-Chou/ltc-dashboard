// src/js/personDetail/charts.js
import { t } from "./lang.js";

// 註冊插件 (確保 Chart.js 已在 HTML 載入)
if (window.Chart) {
  Chart.register(window["chartjs-plugin-annotation"]);
}

// ===== 1. 坐站秒數趨勢圖 =====
export function drawSitStandChartChartJS(assessments) {
  const canvas = document.getElementById("sitStandChartCanvas");
  if (!canvas) return;

  if (!assessments || assessments.length === 0) {
    resetCanvas(canvas);
    return;
  }

  const sorted = [...assessments].sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
  );

  let labels = sorted.map((d) => {
    const date = new Date(d.Date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  let dataValues = sorted.map((d) => d.ChairSecond);

  // 處理單一數據點的顯示
  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
  }

  const baselineY = 12;
  const validValues = dataValues.filter((v) => v !== null);
  const minValue = Math.min(...validValues, baselineY);
  const maxValue = Math.max(...validValues, baselineY);
  let yMin = Math.max(0, minValue - (maxValue - minValue) * 0.2);
  let yMax = maxValue + (maxValue - minValue) * 0.2;
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
          pointRadius: 4,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${t("sitStand")}：${ctx.parsed.y.toFixed(1)} ${t("seconds")}`,
          },
        },
      },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: { display: true, text: t("seconds") },
        },
      },
    },
  });
}

// ===== 2. 平衡測驗得分圖 =====
export function drawBalanceChartChartJS(assessments) {
  const canvas = document.getElementById("balanceChartCanvas");
  if (!canvas) return;

  if (!assessments || assessments.length === 0) {
    resetCanvas(canvas);
    return;
  }

  const sorted = [...assessments].sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
  );
  let labels = sorted.map(
    (d) => `${new Date(d.Date).getMonth() + 1}/${new Date(d.Date).getDate()}`,
  );
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
          label: t("balanceTrend"),
          data: dataValues,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.3)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: { y: { min: 0, max: 4 } },
    },
  });
}

// ===== 3. 步行速度趨勢圖 =====
export function drawGaitChartChartJS(assessments) {
  const canvas = document.getElementById("gaitChartCanvas");
  if (!canvas) return;

  if (!assessments || assessments.length === 0) {
    resetCanvas(canvas);
    return;
  }

  const sorted = [...assessments].sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
  );
  let labels = sorted.map(
    (d) => `${new Date(d.Date).getMonth() + 1}/${new Date(d.Date).getDate()}`,
  );
  let dataValues = sorted.map((d) => d.GaitSpeed);

  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
  }

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
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
    },
  });
}

// ===== 4. AI 跌倒風險圖 =====
export function drawRiskChartChartJS(assessments) {
  const canvas = document.getElementById("riskChartCanvas");
  if (!canvas) return;

  if (!assessments || assessments.length === 0) {
    resetCanvas(canvas);
    return;
  }

  const sorted = [...assessments].sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
  );
  let labels = sorted.map(
    (d) => `${new Date(d.Date).getMonth() + 1}/${new Date(d.Date).getDate()}`,
  );
  let dataValues = sorted.map((d) => d.RiskRate);

  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
  }

  if (window.riskChartInstance) window.riskChartInstance.destroy();

  window.riskChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("fallRisk"),
          data: dataValues,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.3)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    },
  });
}

// ===== 輔助功能：查無資料顯示 =====
export function drawNoDataChart() {
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#888";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t("alertNoData"), canvas.width / 2, canvas.height / 2);
  });
}

// ===== 輔助功能：重置畫布 =====
function resetCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = canvas.width; // 強制重置
}

// ===== 5. 全域掛載與事件 =====
window.drawSitStandChartChartJS = drawSitStandChartChartJS;
window.drawBalanceChartChartJS = drawBalanceChartChartJS;
window.drawGaitChartChartJS = drawGaitChartChartJS;
window.drawRiskChartChartJS = drawRiskChartChartJS;
window.drawNoDataChart = drawNoDataChart;

window.drawAllCharts = function (assessments) {
  if (!assessments || assessments.length === 0) {
    drawNoDataChart();
    return;
  }
  drawSitStandChartChartJS(assessments);
  drawBalanceChartChartJS(assessments);
  drawGaitChartChartJS(assessments);
  drawRiskChartChartJS(assessments);

  // 呼叫趨勢摘要
  if (window.calculateTrend && window.renderTrendSummary) {
    const trend = window.calculateTrend(assessments);
    window.renderTrendSummary(trend);
  }
};

// 處理下載按鈕 (事件代理)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".download-chart");
  if (!btn) return;

  const targetId = btn.dataset.target;
  const canvas = document.getElementById(targetId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${targetId}.png`;
  link.click();
});

// 初始載入
document.addEventListener("DOMContentLoaded", () => {
  if (window.filteredAssessments) {
    window.drawAllCharts(window.filteredAssessments);
  }
});
