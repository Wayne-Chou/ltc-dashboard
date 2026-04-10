// src/js/common/dateFilter.js
import { renderAssessmentTable } from "./table.js";
import {
  renderRisk,
  resetDegenerateAndLevels,
  updateLatestCountDate,
  updateTotalCountAndStartDate,
} from "./riskStats.js";
import { refreshLevelUI } from "./personCardLevel.js";
import { renderLevelCards } from "./personCardLevel.js";
/**
 * 統一清除所有 Chart
 */
function resetAllCharts() {
  [
    "balanceChartCanvas",
    "gaitChartCanvas",
    "riskChartCanvas",
    "sitStandChartCanvas",
  ].forEach((id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const chart = Chart.getChart(canvas);
    if (chart) chart.destroy();

    canvas.width = canvas.width;
  });
}

/**
 * 取得 Flatpickr 語系
 */
export function getFlatpickrLocale(lang) {
  if (typeof flatpickr === "undefined") return "default";
  switch (lang) {
    case "zh":
      return flatpickr.l10ns["zh_tw"] || flatpickr.l10ns.default;
    case "ja":
      return flatpickr.l10ns.ja;
    case "ko":
      return flatpickr.l10ns.ko;
    default:
      return flatpickr.l10ns.default;
  }
}

/**
 * 初始化日期篩選
 */
export function initDateFilter() {
  const dateRangeEl = document.getElementById("dateRange");
  if (!dateRangeEl || typeof flatpickr === "undefined") return;

  const filterBtnsDesktop = document.querySelector(".filterBtnsDesktop");
  const filterDropdownMobile = document.querySelector(".filterDropdownMobile");
  const paginationContainer = document.getElementById(
    "tablePaginationContainer",
  );
  const viewAllBtn = document.getElementById("viewAllBtn");
  const checkAllBtn = document.getElementById("checkAllBtn");
  const uncheckAllBtn = document.getElementById("uncheckAllBtn");
  const sortModeSwitch = document.querySelector(".sortModeSwitch");

  const getBaseData = () => window.currentAssessments || [];
  uncheckAllBtn?.addEventListener("click", () => {
    resetAllCharts();
    window.removeNoDataOverlay?.();
    window.drawNoDataChart?.();
  });
  const fp = flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    locale: getFlatpickrLocale(window.currentLang || "zh"),
    onChange: function (selectedDates) {
      if (selectedDates.length === 2) {
        filterByDate(selectedDates[0], selectedDates[1]);
      }
    },
  });

  function toggleFiltersUI(show) {
    const action = show ? "remove" : "add";
    const elements = [
      filterBtnsDesktop,
      filterDropdownMobile,
      viewAllBtn,
      checkAllBtn,
      uncheckAllBtn,
      paginationContainer,
      sortModeSwitch,
    ];
    elements.forEach((el) => el?.classList[action]("hidden-by-filter"));
  }

  /**
   * 日期篩選
   */
  function filterByDate(startDate, endDate) {
    const source = getBaseData();

    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    const filtered = source.filter((item) => {
      const d = new Date(item.Date).getTime();
      return d >= start && d <= end;
    });

    window.currentPage = 1;
    window.selected = filtered.map((_, i) => i);
    window.checkAllAcrossPages = true;

    if (filtered.length === 0) {
      resetAllCharts();
      window.removeNoDataOverlay?.();
      window.drawNoDataChart?.();
      renderAssessmentTable([]);

      window.renderCards?.([], "all", {});

      resetDegenerateAndLevels?.();
      renderRisk?.([]);
      resetDegenerateAndLevels?.();
      refreshLevelUI?.([]);

      window.drawNoDataChart?.();

      updateLatestCountDate?.([]);
      updateTotalCountAndStartDate?.([]);

      toggleFiltersUI(false);
      return;
    }

    toggleFiltersUI(true);

    renderAssessmentTable(filtered);

    resetAllCharts(); // 🔥 一定要先清

    window.removeNoDataOverlay?.();

    window.drawSitStandChartChartJS?.(filtered);
    window.drawBalanceChartChartJS?.(filtered);
    window.drawGaitChartChartJS?.(filtered);
    window.drawRiskChartChartJS?.(filtered);
  }

  /**
   * 清除按鈕
   */
  const clearBtn = document.getElementById("clearBtn");

  clearBtn?.addEventListener("click", () => {
    if (!fp.selectedDates || fp.selectedDates.length === 0) return;

    fp.clear();
    const data = getBaseData();

    if (data.length > 0) {
      toggleFiltersUI(true);

      window.currentPage = 1;
      window.selected = data.map((_, i) => i);
      window.checkAllAcrossPages = true;

      renderAssessmentTable(data);
      updateLatestCountDate?.(data);
      updateTotalCountAndStartDate?.(data);

      resetAllCharts();

      window.removeNoDataOverlay?.();

      window.drawSitStandChartChartJS?.(data);
      window.drawBalanceChartChartJS?.(data);
      window.drawGaitChartChartJS?.(data);
      window.drawRiskChartChartJS?.(data);
    }
  });
}

// 保持相容
window.initDateFilter = initDateFilter;
