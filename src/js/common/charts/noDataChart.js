// src/js/common/charts/noDataChart.js
import { t } from "../lang.js";

/**
 * 初始化空白畫布 (清空所有現有繪圖)
 */
export function initEmptyCharts() {
  const chartIds = [
    "sitStandChartCanvas",
    "balanceChartCanvas",
    "gaitChartCanvas",
    "riskChartCanvas",
  ];

  chartIds.forEach((id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // 重新校準畫布尺寸
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

/**
 * 在圖表容器上覆蓋「查無資料」的提示遮罩
 */
export function drawNoDataChart() {
  const chartIds = [
    "sitStandChartCanvas",
    "balanceChartCanvas",
    "gaitChartCanvas",
    "riskChartCanvas",
  ];

  chartIds.forEach((id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // 避免重複添加遮罩
    if (parent.querySelector(".no-data-overlay")) return;

    // 確保父容器是 relative，遮罩才能正確絕對定位
    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }

    const overlay = document.createElement("div");
    overlay.className = "no-data-overlay";

    // 樣式建議寫在 CSS 檔案中，若需動態設定可在此補充
    // 例如：display: flex; align-items: center; justify-content: center;
    // position: absolute; top: 0; left: 0; width: 100%; height: 100%; ...

    overlay.innerHTML = `
      <div class="text-center">
        <i class="bi bi-database-exclamation d-block mb-2 h4"></i>
        <span>${t("alertNoData")}</span>
      </div>
    `;

    parent.appendChild(overlay);
  });
}

/**
 * 移除所有圖表上的「查無資料」遮罩
 */
export function removeNoDataOverlay() {
  document.querySelectorAll(".no-data-overlay").forEach((overlay) => {
    overlay.remove();
  });
}

// 導出至 window 以相容其他模組的舊式呼叫
window.initEmptyCharts = initEmptyCharts;
window.drawNoDataChart = drawNoDataChart;
window.removeNoDataOverlay = removeNoDataOverlay;
