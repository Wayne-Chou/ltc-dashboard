// --- 1. 引入必要零件 ---
import { dashboardState } from "./state.js";
import { applyI18n } from "./i18n.js";
import { initCookieConsent } from "./cookie.js";
import { initLogoutButton } from "./logout.js";
import { initLocationPage } from "./location.js";
import { initTable } from "./table.js";
import { initSidebarToggle } from "./initSidebar.js";
import { initDownloadPdf } from "./downloadPdf.js";
import { initDateFilter } from "./dateFilter.js";

import { initPersonCardRisk } from "./personCardRisk.js";
import { initPersonCardLevel } from "./personCardLevel.js";
import { initRiskModeUI } from "./riskStats.js";
import { initDownloadChart } from "./downloadChart.js";
import { initDetailModal } from "./modal/detailModal.js";
import { initViewAllModal } from "./modal/viewAllModal.js";
import { initSortModeSwitch } from "./sortModeSwitch.js";
import {
  initCompareMode,
  toggleCompareMode,
  initCompareModeClickDelegation,
} from "./charts/renderCharts.js";
import { registerRenderView, renderView } from "./viewBridge.js";
import { getTemplate } from "./template.js";
// 如果有需要從其他檔案引入的比較模式函數，請在此 import
// import { renderSelectedSites, renderSiteSelector, initEmptyCharts, drawNoDataChart } from './compareUtils.js';

// --- 2. 視圖渲染函數 ---

function renderCompareView() {
    return getTemplate("compare-view");

}

function renderDefaultView() {
    return getTemplate("default-view");

}
// --- 3. 初始化視圖函數 ---

function renderDashboardView() {
  const container = document.getElementById("appView");
  if (!container) return;

  if (dashboardState.view === "compare") {
    container.innerHTML = renderCompareView();
    void initCompareMode();
  } else {
    container.innerHTML = renderDefaultView();
    initDefaultView();
  }
  applyI18n();
}

registerRenderView(renderDashboardView);

function initDefaultView() {
  initLogoutButton();
  initLocationPage();
  initTable();
  initSidebarToggle();
  initDownloadPdf();
  initDateFilter();
 
  initPersonCardRisk();
  initPersonCardLevel();
  initRiskModeUI();
  initDownloadChart();
  initDetailModal();
  initViewAllModal();
  initSortModeSwitch();
}

// --- 4. 監聽 DOM 載入 ---
document.addEventListener("DOMContentLoaded", () => {
  initCookieConsent();
  initCompareModeClickDelegation();
  renderView();

  const btn = document.getElementById("compareBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      toggleCompareMode();
    });
  }
});
