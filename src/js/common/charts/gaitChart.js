// src/js/common/charts/gaitChart.js
import { t } from "../lang.js";

/**
 * 繪製平均步行速度趨勢圖 (Gait Speed)
 * @param {Array} assessments
 */
export function drawGaitChartChartJS(assessments) {
  const canvas = document.getElementById("gaitChartCanvas");
  if (!canvas) return;

  // 1. 處理無資料
  if (!assessments || assessments.length === 0) {
    if (window.gaitChartInstance) {
      window.gaitChartInstance.destroy();
      window.gaitChartInstance = null;
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  // 2. 排序與資料準備
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.Date) - new Date(b.Date),
  );

  let labels = sorted.map((d) => {
    const date = new Date(d.Date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  let dataValues = sorted.map((d) => d.GaitSpeed);

  // 3. 只有一筆資料時的補點邏輯
  let offset = 0;
  if (labels.length === 1) {
    labels = ["", ...labels, ""];
    dataValues = [null, ...dataValues, null];
    offset = 1;
  }

  // 4. 計算 Y 軸範圍與基準線
  const baseline1 = 100;
  const baseline2 = 80;
  const validVals = dataValues.filter((v) => v !== null && !isNaN(v));

  const minValue = Math.min(...validVals, baseline1, baseline2);
  const maxValue = Math.max(...validVals, baseline1, baseline2);

  let yMin = minValue - (maxValue - minValue) * 0.2;
  let yMax = maxValue + (maxValue - minValue) * 0.2;
  if (yMin < 0) yMin = 0;
  if (yMax - yMin < 10) yMax = yMin + 10;

  // 5. 銷毀舊圖表實例
  if (window.gaitChartInstance) {
    window.gaitChartInstance.destroy();
  }

  // 6. 建立圖表 (黃/橘色系)
  window.gaitChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("gaitSpeed"),
          data: dataValues,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,0.15)",
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
      interaction: { mode: "nearest", intersect: false },
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
              return `${fullDate}：${value.toFixed(1)} cm/s`;
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
          title: { display: true, text: "cm/s", font: { weight: "bold" } },
          beginAtZero: false,
          min: Math.floor(yMin),
          max: Math.ceil(yMax),
        },
      },
    },
  });
}

// 掛載到 window 供其他組件呼叫
window.drawGaitChartChartJS = drawGaitChartChartJS;
