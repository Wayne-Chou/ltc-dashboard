// src/js/common/charts/compareMode.js
import { t } from "../locale.js";
import { getCookie } from "../cookie.js";
import { dashboardState, currentAssessments } from "../state.js";
import { fetchSiteData, getLocationMap, getTimeRange } from "../location.js";
import { drawNoDataChart, removeNoDataOverlay } from "./noDataChart.js";
import { renderView } from "../viewBridge.js";

let compareClickDelegationBound = false;

/**
 * 切換 比較/一般 模式
 */
export function toggleCompareMode() {
  const isCompare = dashboardState.view === "compare";

  // 切換狀態
  dashboardState.view = isCompare ? "default" : "compare";

  const btn = document.getElementById("compareBtn");
  if (btn) {
    const span = btn.querySelector("span");
    if (span) {
      // 切換翻譯 Key
      span.dataset.i18n = isCompare ? "compareMode" : "backToDefault";
    }
  }

  renderView();
}

/** 比較模式：取代 HTML onclick，僅綁定一次 */
export function initCompareModeClickDelegation() {
  if (compareClickDelegationBound) return;
  compareClickDelegationBound = true;
  document.addEventListener("click", (e) => {
    const siteCard = e.target.closest("#siteSelector .site-card[data-code]");
    if (siteCard) {
      void toggleSite(siteCard.dataset.code, siteCard);
      return;
    }
    const removeEl = e.target.closest("#selectedSites [data-remove-site]");
    if (removeEl?.dataset.removeSite != null) {
      void removeSite(removeEl.dataset.removeSite);
    }
  });
}

/**
 * 清除所有 Chart.js 實例
 */
export function clearAllCharts() {
  const canvasIds = [
    "sitStandChartCanvas",
    "balanceChartCanvas",
    "gaitChartCanvas",
    "riskChartCanvas",
  ];

  canvasIds.forEach((id) => {
    const chart = Chart.getChart(id);
    if (chart) chart.destroy();
  });
}

/**
 * 渲染據點選擇器卡片 (比較模式專用)
 */
export function renderSiteSelector() {
  const container = document.getElementById("siteSelector");
  if (!container) return;

  const sites = Object.values(getLocationMap() || {});

  if (!sites.length) {
    container.innerHTML = `<div class="text-muted p-3">${t("alertNoData")}</div>`;
    return;
  }

  container.innerHTML = sites
    .map((site) => {
      const isActive = dashboardState.selectedSites.includes(site.code)
        ? "active"
        : "";
      return `
        <div class="col-6 col-md-3">
          <div class="site-card ${isActive}" 
               data-code="${site.code}">
            <div class="site-name">${site.name}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * 點擊/切換據點選取狀態
 */
export async function toggleSite(siteCode, el) {
  const list = dashboardState.selectedSites;

  if (list.includes(siteCode)) {
    dashboardState.selectedSites = list.filter((s) => s !== siteCode);
    el.classList.remove("active");
  } else {
    if (list.length >= 3) {
      alert(t("selectedSitesLimit") || "最多選擇3個據點");
      return;
    }
    dashboardState.selectedSites.push(siteCode);
    el.classList.add("active");
  }

  renderSelectedSites();

  if (!dashboardState.selectedSites.length) {
    clearAllCharts();
    drawNoDataChart();
    return;
  }

  await renderCompareCharts();
}

/**
 * 渲染已選擇的據點標籤 (Tags)
 */
function renderSelectedSites() {
  const container = document.getElementById("selectedSites");
  if (!container) return;

  if (!dashboardState.selectedSites.length) {
    container.innerHTML = `<span class="text-muted small">${t("clickSiteToCompare")}</span>`;
    return;
  }

  container.innerHTML = dashboardState.selectedSites
    .map(
      (code) => `
      <div class="selected-tag">
        ${getLocationMap()?.[code]?.name || code}
        <span role="button" tabindex="0" data-remove-site="${code}">✕</span>
      </div>
    `,
    )
    .join("");
}

/**
 * 移除單一據點
 */
export async function removeSite(code) {
  dashboardState.selectedSites = dashboardState.selectedSites.filter(
    (s) => s !== code,
  );
  renderSelectedSites();

  // 同步卡片樣式
  document.querySelectorAll(".site-card").forEach((card) => {
    if (card.dataset.code === code) card.classList.remove("active");
  });

  if (!dashboardState.selectedSites.length) {
    clearAllCharts();
    drawNoDataChart();
    return;
  }

  await renderCompareCharts();
}

/**
 * 核心：繪製多線比較圖
 */
function drawMultiLineChart(canvasId, groupedData, key) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // 銷毀舊圖
  const existingChart = Chart.getChart(canvasId);
  if (existingChart) existingChart.destroy();

  // 據點顏色映射 (可擴充)
  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

  // 收集所有數據點的日期並排序，作為 X 軸
  const allDatesSet = new Set();
  groupedData.forEach((group) => {
    group.data.forEach((d) => allDatesSet.add(d.Date));
  });
  const allDates = [...allDatesSet].sort((a, b) => new Date(a) - new Date(b));

  const labels = allDates.map((d) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const datasets = groupedData.map((group, index) => {
    const dataMap = new Map();
    group.data.forEach((d) => dataMap.set(d.Date, d[key]));

    return {
      label: group.site,
      data: allDates.map((date) => dataMap.get(date) ?? null),
      borderColor: COLORS[index % COLORS.length],
      backgroundColor: COLORS[index % COLORS.length] + "20",
      tension: 0.3,
      fill: false,
      spanGaps: true, // 重要：允許跨越缺失數據點
      pointRadius: 4,
      borderWidth: 3,
    };
  });

  new Chart(canvas, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true, position: "top" },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: false },
      },
    },
  });
}

/**
 * 異步抓取多個場域資料並重繪圖表
 */
async function renderCompareCharts() {
  const token = getCookie("fongai_token");
  const { startTime, endTime } = getTimeRange();

  // 同步並行抓取資料
  const grouped = await Promise.all(
    dashboardState.selectedSites.map(async (code) => {
      const data = await fetchSiteData(code, startTime, endTime, token);
      return {
        code,
        site: getLocationMap()?.[code]?.name || code,
        data: data || [],
      };
    }),
  );

  removeNoDataOverlay();
  drawMultiLineChart("sitStandChartCanvas", grouped, "ChairSecond");
  drawMultiLineChart("balanceChartCanvas", grouped, "BalanceScore");
  drawMultiLineChart("gaitChartCanvas", grouped, "GaitSpeed");
  drawMultiLineChart("riskChartCanvas", grouped, "RiskRate");
}

