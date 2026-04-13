// src/js/common/dateFilter.js
import { renderAssessmentTable } from "./table.js";
import { currentLang } from "./locale.js";
import {
  currentAssessments,
  setCurrentPage,
  setSelected,
  setCheckAllAcrossPages,
} from "./state.js";
import {
  renderRisk,
  resetDegenerateAndLevels,
  updateLatestCountDate,
  updateTotalCountAndStartDate,
} from "./riskStats.js";
import { refreshLevelUI } from "./personCardLevel.js";
import { renderLevelCards } from "./personCardLevel.js";
import { drawNoDataChart, removeNoDataOverlay } from "./charts/noDataChart.js";
import { drawSitStandChartChartJS } from "./charts/sitStandChart.js";
import { drawBalanceChartChartJS } from "./charts/balanceChart.js";
import { drawGaitChartChartJS } from "./charts/gaitChart.js";
import { drawRiskChartChartJS } from "./charts/riskChart.js";
import { renderCards } from "./personCardRisk.js";
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

  const getBaseData = () => currentAssessments || [];
  uncheckAllBtn?.addEventListener("click", () => {
    resetAllCharts();
    removeNoDataOverlay();
    drawNoDataChart();
  });
  const fp = flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    locale: getFlatpickrLocale(currentLang || "zh"),
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

    setCurrentPage(1);
    setSelected(filtered.map((_, i) => i));
    setCheckAllAcrossPages(true);

    if (filtered.length === 0) {
      resetAllCharts();
      removeNoDataOverlay();
      drawNoDataChart();
      renderAssessmentTable([]);

      renderCards([], "all", {});

      resetDegenerateAndLevels?.();
      renderRisk?.([]);
      resetDegenerateAndLevels?.();
      refreshLevelUI?.([]);

      drawNoDataChart();

      updateLatestCountDate?.([]);
      updateTotalCountAndStartDate?.([]);

      toggleFiltersUI(false);
      return;
    }

    toggleFiltersUI(true);

    renderAssessmentTable(filtered);

    resetAllCharts(); // 🔥 一定要先清

    removeNoDataOverlay();

    drawSitStandChartChartJS(filtered);
    drawBalanceChartChartJS(filtered);
    drawGaitChartChartJS(filtered);
    drawRiskChartChartJS(filtered);
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

      setCurrentPage(1);
      setSelected(data.map((_, i) => i));
      setCheckAllAcrossPages(true);

      renderAssessmentTable(data);
      updateLatestCountDate?.(data);
      updateTotalCountAndStartDate?.(data);

      resetAllCharts();

      removeNoDataOverlay();

      drawSitStandChartChartJS(data);
      drawBalanceChartChartJS(data);
      drawGaitChartChartJS(data);
      drawRiskChartChartJS(data);
    }
  });
}

