// src/js/common/charts/riskChart.js
import { t } from "../locale.js";

let riskChartInstance = null;

/**
 * 繪製平均 AI 跌倒風險趨勢圖
 * @param {Array} assessments
 */
export function drawRiskChartChartJS(assessments) {
  const canvas = document.getElementById("riskChartCanvas");
  if (!canvas) return;

  if (riskChartInstance) {
    riskChartInstance.destroy();
    riskChartInstance = null;
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
  let dataValues = sorted.map((d) => d.RiskRate);

  // 3. 補點邏輯 (防止只有單點時圖表太擠)
  let offset = 0;
  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
    offset = 1;
  }

  // 4. 建立新圖表 (紅色系代表風險警告)
  riskChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("fallRisk"),
          data: dataValues,
          borderColor: "#ef4444", // 紅色警示
          backgroundColor: "rgba(239,68,68,0.15)",
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

              // 修正單點補位後的索引對齊
              const item = sorted[context.dataIndex - offset];
              if (!item) return "";

              const d = new Date(item.Date);
              const fullDate = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
              return `${fullDate}：${value.toFixed(1)} %`;
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
          title: {
            display: true,
            text: t("fallRisk") + " (%)",
            font: { weight: "bold" },
          },
          beginAtZero: true, // 風險機率通常從 0 開始看比較有感覺
          suggestedMax: 100, // 建議最大值設為 100%
          ticks: {
            callback: (value) => value + "%",
          },
        },
      },
    },
  });
}
