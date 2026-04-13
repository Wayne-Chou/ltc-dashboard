// src/js/common/charts/balanceChart.js
import { t } from "../locale.js";

let balanceChartInstance = null;

/**
 * 繪製平均平衡得分趨勢圖
 * @param {Array} assessments
 */
export function drawBalanceChartChartJS(assessments) {
  const canvas = document.getElementById("balanceChartCanvas");
  if (!canvas) return;

  // 統一釋放舊 Chart 實例（只在此處 destroy，避免重複與殘留參考）
  if (balanceChartInstance) {
    balanceChartInstance.destroy();
    balanceChartInstance = null;
  }

  // 1. 處理無資料狀態
  if (!assessments || assessments.length === 0) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  // 2. 資料準備與排序
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.Date) - new Date(b.Date),
  );

  let labels = sorted.map((d) => {
    const date = new Date(d.Date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  let dataValues = sorted.map((d) => d.BalanceScore);

  // 3. 補點邏輯 (防止單點時線條不顯示)
  let offset = 0;
  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
    offset = 1;
  }

  // 4. 建立新圖表 (藍色系) — 全函式僅此處 new Chart 一次
  balanceChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("balanceScore"),
          data: dataValues,
          borderColor: "#3b82f6", // 經典藍色
          backgroundColor: "rgba(59,130,246,0.15)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          spanGaps: true,
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
              if (value === null) return "";

              const item = sorted[context.dataIndex - offset];
              if (!item) return "";

              const d = new Date(item.Date);
              const fullDate = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
              return `${fullDate}：${value.toFixed(1)} ${t("points")}`;
            },
          },
        },
      },
      scales: {
        x: {
          offset: true,
          title: { display: true, text: t("dates"), font: { weight: "bold" } },
          ticks: { autoSkip: true, maxTicksLimit: 7 },
        },
        y: {
          title: { display: true, text: t("points"), font: { weight: "bold" } },
          beginAtZero: true,
          min: 0,
          max: 4, // 平衡分滿分為 4
          ticks: {
            stepSize: 1, // 因為是 0~4 分，間隔設為 1 較清楚
          },
        },
      },
    },
  });
}
