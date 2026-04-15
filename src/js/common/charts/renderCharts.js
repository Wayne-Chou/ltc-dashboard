// src/js/common/charts/compareMode.js
import { t } from "../locale.js";
import { getCookie } from "../cookie.js";
import { dashboardState, currentAssessments } from "../state.js";
import { fetchSiteData, getLocationMap, getTimeRange } from "../location.js";
import { drawNoDataChart, removeNoDataOverlay } from "./noDataChart.js";
import { renderView } from "../viewBridge.js";

/** @type {boolean} 事件委派是否已註冊；true 時 `initCompareModeClickDelegation` 直接 return，避免重複綁定。 */
let compareClickDelegationBound = false;

/** 比較模式允許同時選取的據點上限（A/B 兩筆）。 */
const COMPARE_SELECTED_SITES_MAX = 2;

/**
 * 將 `dashboardState.selectedSites` 截成至多 {@link COMPARE_SELECTED_SITES_MAX} 筆，並同步 `.site-card` 的 active 狀態。
 */
function trimCompareSelectedSitesToMax() {
  if (dashboardState.selectedSites.length > COMPARE_SELECTED_SITES_MAX) {
    dashboardState.selectedSites = dashboardState.selectedSites.slice(
      0,
      COMPARE_SELECTED_SITES_MAX,
    );
  }
  const codes = new Set(
    dashboardState.selectedSites.map((s) => s?.code).filter(Boolean),
  );
  document.querySelectorAll(".site-card").forEach((card) => {
    const code = card.dataset.code;
    if (code && !codes.has(code)) card.classList.remove("active");
  });
}

/**
 * 切換 比較/一般 模式
 */

export function toggleCompareMode() {
  const isCompare = dashboardState.view === "compare";
  const btn = document.getElementById("dropdownMenuButton");
  if (btn) {
    btn.style.display = !isCompare ? "none" : "flex";
  }
  // 切換狀態
  dashboardState.view = isCompare ? "default" : "compare";

  const compareBtn = document.getElementById("compareBtn");
  if (compareBtn) {
    const span = compareBtn.querySelector("span");
    if (span) {
      span.dataset.i18n = isCompare ? "compareMode" : "backToDefault";
    }
  }

  renderView();
}



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
      const code = removeEl.dataset.removeSite;
      if (code) void removeSiteByCode(code);
      return;
    }

    const quick = e.target.closest("#compareControls [data-quick]");
    if (quick) {
      const idx = Number(quick.dataset.compareIndex);
      if (!Number.isFinite(idx) || !dashboardState.selectedSites[idx]) return;
      const type = quick.dataset.quick;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let start;
      let end = new Date(today);

      if (type === "7") {
        start = new Date(today);
        start.setDate(today.getDate() - 7);
      } else if (type === "30") {
        start = new Date(today);
        start.setDate(today.getDate() - 30);
      } else if (type === "year") {
        start = new Date(today.getFullYear(), 0, 1);
      } else {
        return;
      }

      dashboardState.selectedSites[idx].timeMode = "range";
      dashboardState.selectedSites[idx].start = formatDateForCompare(start);
      dashboardState.selectedSites[idx].end = formatDateForCompare(end);
      renderSelectedSites();
      renderSiteSelector();
      renderCompareControls();
      void renderCompareCharts();
      return;
    }

    const clearBtn = e.target.closest("#compareControls [data-clear]");
    if (clearBtn) {
      const idx = Number(clearBtn.dataset.compareIndex);
      if (!Number.isFinite(idx) || !dashboardState.selectedSites[idx]) return;
      dashboardState.selectedSites[idx].start = "";
      dashboardState.selectedSites[idx].end = "";
      renderSelectedSites();
      renderSiteSelector();
      renderCompareControls();
      void renderCompareCharts();
      return;
    }
  });
  document.addEventListener("change", (e) => {
    const control = e.target.closest("#compareControls [data-compare-index]");
    if (!control) return;
    const idx = Number(control.dataset.compareIndex);
    if (!Number.isFinite(idx) || !dashboardState.selectedSites[idx]) return;

    const field = e.target.dataset.compareField;
    if (!field) return;
    const next = { ...dashboardState.selectedSites[idx] };

    if (field === "code") next.code = e.target.value;
    if (field === "timeMode") next.timeMode = e.target.value;

    if (next.timeMode === "single") {
      next.start = next.end || next.start;
      next.end = next.end || next.start;
    }

    dashboardState.selectedSites[idx] = next;
    renderSelectedSites();
    renderSiteSelector();
    renderCompareControls();
    void renderCompareCharts();
  });
}

function formatDateForCompare(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toTimestampRange(start, end, mode) {
  let s = new Date(start);
  let e = new Date(end);

  if (mode === "single") {
    s.setHours(0, 0, 0, 0);
    e.setHours(23, 59, 59, 999);
    s = new Date(s.getTime() - 12 * 60 * 60 * 1000);
    e = new Date(e.getTime() + 12 * 60 * 60 * 1000);
  } else {
    // range 模式也確保是整天
    s.setHours(0, 0, 0, 0);
    e.setHours(23, 59, 59, 999);
  }

  return {
    start: s.getTime(),
    end: e.getTime(),
  };
}

function destroyCompareFlatpickr(container) {
  if (!container) return;
  container
    .querySelectorAll("[data-flatpickr-range], [data-flatpickr-single]")
    .forEach((el) => {
      if (el._flatpickr) el._flatpickr.destroy();
    });
}

function initCompareFlatpickr() {
  const fp = typeof window !== "undefined" ? window.flatpickr : null;
  if (typeof fp !== "function") return;

  const root = document.getElementById("compareControls");
  if (!root) return;

  const locale = fp.l10ns?.zh_tw || fp.l10ns?.zh;

  root.querySelectorAll("[data-flatpickr-range]").forEach((el) => {
    const idx = Number(el.dataset.compareIndex);
    const site = dashboardState.selectedSites[idx];
    if (!site) return;

    let defaultDate = null;
    if (site.start && site.end) {
      defaultDate = [site.start, site.end];
    } else if (site.start || site.end) {
      const a = site.start || site.end;
      const b = site.end || site.start;
      defaultDate = [a, b];
    }

    fp(el, {
      mode: "range",
      dateFormat: "Y-m-d",
      locale,
      defaultDate,
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          dashboardState.selectedSites[idx].start = formatDateForCompare(
            selectedDates[0],
          );
          dashboardState.selectedSites[idx].end = formatDateForCompare(
            selectedDates[1],
          );
          renderSelectedSites();
          void renderCompareCharts();
        }
      },
    });
  });

  root.querySelectorAll("[data-flatpickr-single]").forEach((el) => {
    const idx = Number(el.dataset.compareIndex);
    const site = dashboardState.selectedSites[idx];
    if (!site) return;

    fp(el, {
      mode: "single",
      dateFormat: "Y-m-d",
      locale,
      defaultDate: site.end || site.start || null,
      onChange: (selectedDates) => {
        if (selectedDates[0]) {
          const date = formatDateForCompare(selectedDates[0]);
          dashboardState.selectedSites[idx].start = date;
          dashboardState.selectedSites[idx].end = date;
          renderSelectedSites();
          void renderCompareCharts();
        }
      },
    });
  });
}

function getDefaultSiteRange() {
  const { startTime, endTime } = getTimeRange();
  return { start: startTime, end: endTime };
}

function makeSelectedSite(code) {
  const { start, end } = getDefaultSiteRange();
  return {
    code,
    timeMode: "range",
    start,
    end,
  };
}


function renderCompareControls() {
  const container = document.getElementById("compareControls");
  if (!container) return;

  destroyCompareFlatpickr(container);

  const sites = Object.values(getLocationMap() || {});
  const siteOptions = sites
    .map((site) => `<option value="${site.code}">${site.name}</option>`)
    .join("");

  container.innerHTML = dashboardState.selectedSites
    .slice(0, COMPARE_SELECTED_SITES_MAX)
    .map((item, idx) => {
      const siteName = getLocationMap()?.[item.code]?.name || item.code;
      const rangeValue =
        item.start && item.end ? `${item.start} ~ ${item.end}` : "";
      const singleValue = item.end || item.start || "";
      const rangeHidden = item.timeMode === "range" ? "" : "d-none";
      const singleHidden = item.timeMode === "single" ? "" : "d-none";
      return `
        <div class="compare-control" data-compare-index="${idx}">
          <div class="compare-control-label"><i class="fa-solid fa-circle"></i> ${siteName}</div>
          <select class="form-select form-select-sm" data-compare-field="code">
            ${siteOptions}
          </select>
          <select class="form-select form-select-sm" data-compare-field="timeMode">
            <option value="range">區間</option>
            <option value="single">單日</option>
          </select>
          <div class="compare-date-group">
            <div class="compare-date-range-wrap ${rangeHidden}">
              <input
                type="text"
                class="form-control form-control-sm compare-flatpickr-input"
                data-flatpickr-range
                data-compare-index="${idx}"
                value="${rangeValue}"
                placeholder="選擇日期區間"
                readonly
              />
            </div>
            <div class="compare-date-single-wrap ${singleHidden}">
              <input
                type="text"
                class="form-control form-control-sm compare-flatpickr-input"
                data-flatpickr-single
                data-compare-index="${idx}"
                value="${singleValue}"
                placeholder="選擇單日"
                readonly
              />
            </div>
            <div class="compare-quick-actions">
              <button type="button" class="compare-quick-btn" data-quick="7" data-compare-index="${idx}">7天</button>
              <button type="button" class="compare-quick-btn" data-quick="30" data-compare-index="${idx}">30天</button>
              <button type="button" class="compare-quick-btn" data-quick="year" data-compare-index="${idx}">今年</button>
              <button type="button" class="compare-quick-btn compare-quick-btn-clear" data-clear data-compare-index="${idx}">清除</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  dashboardState.selectedSites.slice(0, COMPARE_SELECTED_SITES_MAX).forEach((item, idx) => {
    const row = container.querySelector(`[data-compare-index="${idx}"]`);
    if (!row) return;
    const codeEl = row.querySelector('[data-compare-field="code"]');
    const modeEl = row.querySelector('[data-compare-field="timeMode"]');
    if (codeEl) codeEl.value = item.code;
    if (modeEl) modeEl.value = item.timeMode;
  });

  initCompareFlatpickr();
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
      const isActive = dashboardState.selectedSites.some(
        (selectedSite) => selectedSite.code === site.code,
      )
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
 * 自動選出預設據點（依資料筆數排序）
 */
export async function autoSelectDefaultSites(limit = 2) {
  const token = getCookie("fongai_token");
  const { startTime, endTime } = getTimeRange();
  const sites = Object.values(getLocationMap() || {});

  if (!sites.length) return [];

  const rankedSites = await Promise.all(
    sites.map(async (site) => {
      try {
        const data = await fetchSiteData(site.code, startTime, endTime, token);
        return {
          code: site.code,
          count: Array.isArray(data) ? data.length : 0,
        };
      } catch (error) {
        return { code: site.code, count: 0 };
      }
    }),
  );

  return rankedSites
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .filter((s) => s.count > 0)
    .map((s) => s.code);
}

/**
 * 點擊/切換據點選取狀態
 */
export async function toggleSite(siteCode, el) {
  const list = dashboardState.selectedSites;
  const idx = list.findIndex((s) => s.code === siteCode);

  if (idx !== -1) {
    dashboardState.selectedSites = list.filter((s) => s.code !== siteCode);
    el.classList.remove("active");
  } else {
    if (list.length >= COMPARE_SELECTED_SITES_MAX) {
      alert(t("selectedSitesLimit") || "最多選擇2個據點");
      return;
    }
    dashboardState.selectedSites.push(makeSelectedSite(siteCode));
    el.classList.add("active");
  }

  trimCompareSelectedSitesToMax();

  renderSelectedSites();
  renderCompareControls();

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
    .slice(0, COMPARE_SELECTED_SITES_MAX)
    .map(
      (selectedSite) => `
      <div class="selected-tag">
        ${getLocationMap()?.[selectedSite.code]?.name || selectedSite.code}
        <span role="button" tabindex="0" data-remove-site="${selectedSite.code}">✕</span>
      </div>
    `,
    )
    .join("");
}

async function removeSiteByCode(code) {
  dashboardState.selectedSites = dashboardState.selectedSites.filter(
    (s) => s.code !== code,
  );

  renderSelectedSites();
  renderCompareControls();

  document.querySelectorAll(".site-card").forEach((card) => {
    if (card.dataset.code === code) {
      card.classList.remove("active");
    }
  });

  if (!dashboardState.selectedSites.length) {
    clearAllCharts();
    drawNoDataChart();
    return;
  }

  await renderCompareCharts();
}

/**
 * 移除單一據點
 */
export async function removeSite(index) {
  const removedCode = dashboardState.selectedSites[index]?.code;
  dashboardState.selectedSites = dashboardState.selectedSites.filter(
    (_, i) => i !== index,
  );
  renderSelectedSites();
  renderCompareControls();

  // 同步卡片樣式
  document.querySelectorAll(".site-card").forEach((card) => {
    if (card.dataset.code === removedCode) card.classList.remove("active");
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
  function formatLocalDate(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  }

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

  const labels = allDates.map(formatLocalDate);

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
      spanGaps: true, 
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
            title: (items) => {
              const ts = allDates[items[0].dataIndex];
              return formatLocalDate(ts);
            },
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
  if (dashboardState.selectedSites.length < 2) {
   
    clearAllCharts();
    drawNoDataChart();
    renderCompareSummary(null);
    return;
  }

  document.body.classList.add("is-loading");

  try {
    const token = getCookie("fongai_token");

    // 同步並行抓取資料
    const grouped = await Promise.all(
      dashboardState.selectedSites
        .slice(0, COMPARE_SELECTED_SITES_MAX)
        .filter((site) => site?.code)
        .map(async (site) => {
        const { start, end } = toTimestampRange(
          site.start,
          site.end,
          site.timeMode,
        );
        // console.log("API送出時間 👉", new Date(start), new Date(end));
        const data = await fetchSiteData(site.code, start, end, token);
      
        return {
          code: site.code,
          site: getLocationMap()?.[site.code]?.name || site.code,
          data: data || [],
          timeMode: site.timeMode,
          start: site.start,
          end: site.end,
        };
        }),
    );

    removeNoDataOverlay();

    const hasAnyData = grouped.some(
      (g) => Array.isArray(g.data) && g.data.length > 0,
    );
    if (!hasAnyData) {
      clearAllCharts();
      drawNoDataChart("此日期區間無資料");
      renderCompareSummary(grouped);
      return;
    }

    drawMultiLineChart("sitStandChartCanvas", grouped, "ChairSecond");
    drawMultiLineChart("balanceChartCanvas", grouped, "BalanceScore");
    drawMultiLineChart("gaitChartCanvas", grouped, "GaitSpeed");
    drawMultiLineChart("riskChartCanvas", grouped, "RiskRate");
    renderCompareSummary(grouped);
  } finally {
    document.body.classList.remove("is-loading");
  }
}

/**
 * Compare 模式初始化：先顯示據點，再確保有預設資料
 */
export async function initCompareMode() {
  document.body.classList.add("is-loading");
  try {
    renderSiteSelector();

    const tagContainer = document.getElementById("selectedSites");
    if (!tagContainer) return;

    trimCompareSelectedSitesToMax();

    if (dashboardState.selectedSites.length) {
      renderSelectedSites();
      renderCompareControls();

      if (dashboardState.selectedSites.length >= 2) {
        await renderCompareCharts();
      } else {
        clearAllCharts();
        drawNoDataChart();
      }

      return;
    }

    renderSelectedSites();
    renderCompareControls();
    clearAllCharts();
    drawNoDataChart();
  } finally {
    document.body.classList.remove("is-loading");
  }
}

function getMetricValue(data, key, timeMode) {
  if (!Array.isArray(data) || !data.length) return null;

  if (timeMode === "single") {
     // 單日模式：
    // 只取「最後一筆資料」作為結果
    //
    // 範例：
    // data = [
    //   { ChairSecond: 10 },
    //   { ChairSecond: 12 },
    //   { ChairSecond: 8 }
    // ]
    //
    // → 取最後一筆 = 8
    
    const value = Number(data[data.length - 1][key]);
    return Number.isFinite(value) ? value : null;
  }

  if (timeMode === "range") {
    // 區間平均模式：
    // 將時間區間內所有資料的數值取出後，計算「簡單平均」
    //
    // 計算公式：
    // 平均值 = (所有數值加總) / (資料筆數)
    //
    // 範例 ：
    // data = [
    //   { ChairSecond: 10 },
    //   { ChairSecond: 12 },
    //   { ChairSecond: 8 }
    // ]
    //
    // values = [10, 12, 8]
    // 平均 = (10 + 12 + 8) / 3 = 10
    //
   
    const values = data
      .map((d) => Number(d[key]))
      .filter((v) => Number.isFinite(v));
      // console.table(values);
    if (!values.length) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  return null;
}

function renderCompareSummary(groupedData) {
 
 
  const winnerEl = document.getElementById("compareSummaryWinner");
  const rankingEl = document.getElementById("compareRanking");
  const contentEl = document.getElementById("compareSummaryContent");
  const compareResultTitleEl = document.getElementById("compareModeResultTitle");
  if (!winnerEl || !rankingEl || !contentEl) return;

  const resetCompareResultTitle = () => {
    if (compareResultTitleEl) compareResultTitleEl.textContent = "A vs B 比較結果";
  };

  const emptyCardHtml = `
    <div class="metric-card empty">
      <div class="metric-empty-icon">
        <i class="fa-solid fa-chart-line"></i>
      </div>
      <div class="metric-empty-title">尚無比較資料</div>
      <div class="metric-empty-desc">請選擇更多據點以產生比較分析</div>
    </div>
  `;

  const emptyRangeCardHtml = `
    <div class="metric-card empty">
      <div class="metric-empty-icon">
        <i class="fa-solid fa-calendar-xmark"></i>
      </div>
      <div class="metric-empty-title">所選日期區間無資料</div>
      <div class="metric-empty-desc">請調整日期</div>
    </div>
  `;

  if (!groupedData || dashboardState.selectedSites.length === 0) {
   
    winnerEl.innerHTML = `
      <div class="winner-inner">
        <div class="winner-icon">
          <i class="fa-solid fa-circle-info"></i>
        </div>
        <div class="winner-text">
          <div class="main">尚未選擇據點</div>
          <div class="sub">請先選擇據點進行比較</div>
        </div>
      </div>
    `;
    rankingEl.innerHTML = "";
    contentEl.innerHTML = emptyCardHtml;
    resetCompareResultTitle();
    return;
  }

  const allSitesNoData =
    groupedData.length > 0 &&
    groupedData.every(
      (g) => !Array.isArray(g.data) || g.data.length === 0,
    );
  if (allSitesNoData) {
    
    winnerEl.innerHTML = `
      <div class="winner-inner">
        <div class="winner-icon">
          <i class="fa-solid fa-calendar-xmark"></i>
        </div>
        <div class="winner-text">
          <div class="main">所選日期區間無資料，請調整日期</div>
          <div class="sub">目前查無此區間的指標資料</div>
        </div>
      </div>
    `;
    rankingEl.innerHTML = "";
    contentEl.innerHTML = emptyRangeCardHtml;
    resetCompareResultTitle();
    return;
  }

  const rows = groupedData
    .map((group) => {
      const chair = getMetricValue(group.data, "ChairSecond", group.timeMode);
      const balance = getMetricValue(group.data, "BalanceScore", group.timeMode);
      const gait = getMetricValue(group.data, "GaitSpeed", group.timeMode);
      const risk = getMetricValue(group.data, "RiskRate", group.timeMode);

      return {
        site: group.site,
        timeMode: group.timeMode,
        start: group.start,
        end: group.end,
        chair,
        balance,
        gait,
        risk,
      };
    })
    .filter(Boolean);

  if (dashboardState.selectedSites.length === 0) {
  
    winnerEl.innerHTML = `
      <div class="winner-inner">
        <div class="winner-icon">
          <i class="fa-solid fa-circle-info"></i>
        </div>
        <div class="winner-text">
          <div class="main">尚未選擇據點</div>
          <div class="sub">請先選擇據點進行比較</div>
        </div>
      </div>
    `;
    rankingEl.innerHTML = "";
    contentEl.innerHTML = emptyCardHtml;
    resetCompareResultTitle();
    return;
  }

  if (dashboardState.selectedSites.length === 1) {
  
    winnerEl.innerHTML = `
      <div class="winner-inner">
        <div class="winner-icon">
          <i class="fa-solid fa-circle-info"></i>
        </div>
        <div class="winner-text">
          <div class="main">目前僅選擇 1 個據點</div>
          <div class="sub">請至少選擇 2 個據點進行比較</div>
        </div>
      </div>
    `;
    rankingEl.innerHTML = "";
    contentEl.innerHTML = emptyCardHtml;
    resetCompareResultTitle();
    return;
  }

  const isDifferentTime = groupedData.some(
    (g, _, arr) => g.start !== arr[0].start || g.end !== arr[0].end,
  );
  const siteLabel0 = rows[0]?.site || "A";
  const siteLabel1 = rows[1]?.site || "B";
  if (compareResultTitleEl) {
    compareResultTitleEl.textContent = `${siteLabel0} vs ${siteLabel1} 比較結果`;
  }


  const METRICS = [
    {
      key: "chair",
      label: "坐站",
      unit: "秒",
      better: "min",
      threshold: 12,
      alertText: "偏慢",
    },
    {
      key: "balance",
      label: "平衡",
      unit: "分",
      better: "max",
      threshold: 3.5,
      alertText: "偏低",
    },
    {
      key: "gait",
      label: "步行速度",
      unit: "cm/s",
      better: "max",
      threshold: 100,
      alertText: "偏慢",
    },
    {
      key: "risk",
      label: "AI風險",
      unit: "",
      better: "min",
    },
  ];

  const scoreMap = {};
  METRICS.forEach((metric) => {
    const valid = rows.filter((r) => r[metric.key] != null);
    if (valid.length < 2) return;

    const sorted = [...valid].sort((a, b) =>
      metric.better === "min"
        ? a[metric.key] - b[metric.key]
        : b[metric.key] - a[metric.key],
    );

    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const diff = Math.abs(best[metric.key] - worst[metric.key]);

    if (diff === 0) return;
    scoreMap[best.site] = (scoreMap[best.site] || 0) + 1;
  });

  const winnerEntries = Object.entries(scoreMap).sort((a, b) => b[1] - a[1]);
  let winnerText = "各據點表現接近，目前沒有明確表現最佳者";
  if (winnerEntries.length) {
    const [topSite, score] = winnerEntries[0];
    winnerText =
      score === 1 ? `${topSite} 目前在單一指標表現最佳` : `${topSite} 目前在多項指標領先`;
  }
  winnerEl.innerHTML = `
    <div class="winner-inner">
      <div class="winner-icon">
        <i class="fa-solid ${winnerEntries.length ? "fa-trophy" : "fa-handshake"}"></i>
      </div>
      <div class="winner-text">
        <div class="main">${winnerText}</div>
        <div class="sub">依據坐站、平衡、步行速度與風險指標分析</div>
      </div>
    </div>
  `;
  if (winnerEntries.length <= 1) {
    rankingEl.innerHTML = "";
  } else {
    rankingEl.innerHTML = winnerEntries
      .map(
        ([site, score], index) =>
          `<div class="ranking-badge">
            <span class="rank">
              <i class="fa-solid ${index === 0 ? "fa-trophy" : "fa-medal"}"></i>
              #${index + 1}
            </span>
            <span class="name">${site}</span>
            <span class="score"><i class="fa-solid fa-crown"></i> ${score} 項領先</span>
          </div>`,
      )
      .join("");
  }

  const ICON_MAP = {
    chair: '<i class="fa-solid fa-chair"></i>',
    balance: '<i class="fa-solid fa-scale-balanced"></i>',
    gait: '<i class="fa-solid fa-person-walking"></i>',
    risk: '<i class="fa-solid fa-shield-heart"></i>',
  };

  const metricCards = METRICS.map((metric) => {
    const valid = rows.filter((row) => row[metric.key] != null);
    if (valid.length < 2) return "";

    const sorted = [...valid].sort((a, b) =>
      metric.better === "min"
        ? a[metric.key] - b[metric.key]
        : b[metric.key] - a[metric.key],
    );

    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const diff = Math.abs(worst[metric.key] - best[metric.key]);
    const isTie = diff === 0;
    const unitText = metric.unit ? ` ${metric.unit}` : "";
    const formatTimeText = (row) =>
      row.timeMode === "single"
        ? new Date(row.end).toLocaleDateString("zh-TW")
        : `${new Date(row.start).toLocaleDateString("zh-TW")}～${new Date(row.end).toLocaleDateString("zh-TW")}`;
    const modeLabel = (row) => (row.timeMode === "range" ? "區間平均" : "單日資料");

    return `
      <div class="metric-card ${isTie ? "is-tie" : "is-active"}">
        <div class="metric-header">
          <div class="icon">${ICON_MAP[metric.key]}</div>
          <div class="label">${metric.label}</div>
        </div>

        <div class="metric-body">
          <div class="metric-top">
            <div class="metric-site">
              ${isTie ? "表現相同" : best.site}
            </div>
            ${
              !isTie
                ? `<div class="metric-badge">最佳</div>`
                : `<div class="metric-badge neutral">平手</div>`
            }
          </div>

          <div class="metric-values-list">
            <div class="metric-value-row">
              <span>${best.site}</span>
              <strong>${best[metric.key].toFixed(1)}${unitText}</strong>
              <em>${modeLabel(best)}</em>
            </div>
            <div class="metric-value-row">
              <span>${worst.site}</span>
              <strong>${worst[metric.key].toFixed(1)}${unitText}</strong>
              <em>${modeLabel(worst)}</em>
            </div>
          </div>

          <div class="metric-time">
            <i class="fa-solid fa-calendar-days"></i>
            ${best.site}：${formatTimeText(best)}
          </div>
          <div class="metric-time">
            <i class="fa-solid fa-calendar-days"></i>
            ${worst.site}：${formatTimeText(worst)}
          </div>
          <div class="metric-compare">${isTie ? "雙方數值相同" : `相較 ${worst.site} 更佳`}</div>
        </div>

        <div class="metric-footer">
          <i class="fa-solid fa-arrows-left-right"></i>
          差距 <strong>${diff.toFixed(1)}${unitText}</strong>
        </div>
      </div>
    `;
  }).join("");

  contentEl.innerHTML =
    metricCards ||
    '<div class="metric-card empty"><div class="metric-empty-title">尚無足夠指標可比較</div><div class="metric-empty-desc">請確認各據點於所選區間皆有資料</div></div>';
}
