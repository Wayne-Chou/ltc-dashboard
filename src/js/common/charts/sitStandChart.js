// src/js/common/charts/sitStandChart.js
import { t } from "../lang.js";

// 假設 Chart.js 是透過 CDN 引入，我們直接使用 window.Chart
// 如果你是用 npm install chart.js，則需要：import Chart from 'chart.js/auto';

/**
 * 註冊 Annotation 插件
 * 在 Vite 模式下，如果插件是透過 CDN 加載，通常已經在全域
 */
if (window.Chart && window["chartjs-plugin-annotation"]) {
  Chart.register(window["chartjs-plugin-annotation"]);
}

/**
 * 繪製坐站平均秒數趨勢圖
 * @param {Array} assessments
 */
export function drawSitStandChartChartJS(assessments) {
  const canvas = document.getElementById("sitStandChartCanvas");
  if (!canvas) return;

  // 1. 處理無資料狀態
  if (!assessments || assessments.length === 0) {
    if (window.sitStandChartInstance) {
      window.sitStandChartInstance.destroy();
      window.sitStandChartInstance = null;
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  // 2. 資料排序與準備
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.Date) - new Date(b.Date),
  );

  let labels = sorted.map((d) => {
    const date = new Date(d.Date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  let dataValues = sorted.map((d) => d.ChairSecond);

  // 3. 補點邏輯 (若只有一筆資料，頭尾補空以利線條呈現)
  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
  }

  // 4. 計算 Y 軸動態範圍
  const baselineY = 12;
  const validValues = dataValues.filter((v) => v !== null && !isNaN(v));
  const minValue = Math.min(...validValues, baselineY);
  const maxValue = Math.max(...validValues, baselineY);

  let yMin = minValue - (maxValue - minValue) * 0.2;
  let yMax = maxValue + (maxValue - minValue) * 0.2;
  if (yMin < 0) yMin = 0;
  if (yMax - yMin < 5) yMax = yMin + 5;

  // 5. 銷毀舊實例
  if (window.sitStandChartInstance) {
    window.sitStandChartInstance.destroy();
  }

  // 6. 建立新圖表
  window.sitStandChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("sitStand"),
          data: dataValues,
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.15)", // 稍微降低透明度，畫面更乾淨
          fill: true,
          tension: 0.3,
          pointRadius: 4, // 稍微加大點，方便點擊
          pointHoverRadius: 6,
          borderWidth: 3,
          spanGaps: true, // 允許跨過補點的 null
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

              const item =
                sorted[context.dataIndex - (labels[0] === "" ? 1 : 0)];
              if (!item) return "";

              const d = new Date(item.Date);
              const fullDate = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
              return `${fullDate}：${value.toFixed(1)} ${t("seconds")}`;
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
            text: t("seconds"),
            font: { weight: "bold" },
          },
          beginAtZero: false,
          min: Math.floor(yMin),
          max: Math.ceil(yMax),
        },
      },
    },
  });
}

// 掛載到 window 以供 location.js 調用
window.drawSitStandChartChartJS = drawSitStandChartChartJS;
