// src/js/common/charts/compareMode.js
import { getCookie } from "../cookie.js";
import { dashboardState, currentAssessments } from "../state.js";
import { fetchSiteData, getLocationMap, getTimeRange } from "../location.js";
import { drawNoDataChart, removeNoDataOverlay } from "./noDataChart.js";
import { renderView } from "../viewBridge.js";

/** @type {boolean} 事件委派是否已註冊；true 時 `initCompareModeClickDelegation` 直接 return，避免重複綁定。 */
let compareClickDelegationBound = false;

/** 比較模式允許同時選取的據點上限（A/B 兩筆）。 */
const COMPARE_SELECTED_SITES_MAX = 2;
const dateRangeCache = new Map();

/**
 * 將 `dashboardState.selectedSites` 截成至多 {@link COMPARE_SELECTED_SITES_MAX} 筆。
 */
function trimCompareSelectedSitesToMax() {
  if (dashboardState.selectedSites.length > COMPARE_SELECTED_SITES_MAX) {
    dashboardState.selectedSites = dashboardState.selectedSites.slice(
      0,
      COMPARE_SELECTED_SITES_MAX,
    );
  }
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
    const clearBtn = e.target.closest("#compareControls [data-clear]");
    if (clearBtn) {
      const idx = Number(clearBtn.dataset.compareIndex);
      if (!Number.isFinite(idx) || !dashboardState.selectedSites[idx]) return;
      dashboardState.selectedSites[idx].start = "";
      dashboardState.selectedSites[idx].end = "";
      const site = dashboardState.selectedSites[idx];
      site.selectedDates = [];
      renderCompareControls();
      void renderCompareCharts();
      return;
    }

    const quickBtn = e.target.closest("#compareControls [data-quick]");
    if (quickBtn) {
      const idx = Number(quickBtn.dataset.compareIndex);
      const type = quickBtn.dataset.quick;

      const site = dashboardState.selectedSites[idx];
      if (!site) return;

     

      const today = new Date();
      let start;
      let end;

      if (type === "30d") {
        end = today;
        start = new Date();
        start.setDate(today.getDate() - 29);
      }

      if (type === "6m") {
        end = today;
        start = new Date();
        start.setMonth(today.getMonth() - 6);
        start.setDate(1);
      }

      if (type === "year") {
        const year = today.getFullYear();
        start = new Date(year, 0, 1); // 1/1
        end = today;
      }

      site.timeMode = "range";
      site.start = formatDateForCompare(start);
      site.end = formatDateForCompare(end);
      site.selectedDates = [];

    

      renderCompareControls();
      

      void renderCompareCharts();
      

      return;
    }

  });
  document.addEventListener("change", async (e) => {
    const siteSelect = e.target.closest("[data-compare-site]");
    if (siteSelect) {
      const idx = Number(siteSelect.dataset.compareIndex);
      if (!Number.isFinite(idx)) return;

      const code = siteSelect.value;
      const newSite = await makeSelectedSite(code);

      dashboardState.selectedSites[idx] = newSite;

      renderCompareControls();
      await renderCompareCharts();
      return;
    }

    const control = e.target.closest("#compareControls [data-compare-index]");
    if (!control) return;
    const idx = Number(control.dataset.compareIndex);
    if (!Number.isFinite(idx) || !dashboardState.selectedSites[idx]) return;

    const field = e.target.dataset.compareField;
    if (!field) return;
    const next = { ...dashboardState.selectedSites[idx] };

    if (field === "timeMode") {
      if (next.__forceRange) {
        next.__forceRange = false;
      } else {
        next.timeMode = e.target.value;
      }
    }

    if (next.timeMode === "single") {
      next.start = next.end || next.start;
      next.end = next.end || next.start;
    }

    dashboardState.selectedSites[idx] = next;
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

function filterByDates(data, selectedDates) {
  if (!Array.isArray(data)) return [];
  if (!Array.isArray(selectedDates) || selectedDates.length === 0) return data;

  const set = new Set(selectedDates);

  return data.filter((d) => {
    const date = new Date(d.Date);
    if (!Number.isFinite(date.getTime())) return false;

    const key = formatDateForCompare(date);
    return set.has(key);
  });
}

function toTimestampRange(start, end, mode) {
  const s = new Date(start);
  const e = new Date(end || start);
  void mode;

  // 用 UTC，避免 local time 轉 timestamp 被後端當 UTC 解讀
  const startUTC = Date.UTC(
    s.getFullYear(),
    s.getMonth(),
    s.getDate(),
    0, 0, 0,
  );

  const endUTC = Date.UTC(
    e.getFullYear(),
    e.getMonth(),
    e.getDate() + 1,
    0, 0, 0,
  );

 

  return {
    start: startUTC,
    end: endUTC,
  };
}

function destroyCompareFlatpickr(container) {
  if (!container) return;
  container
    .querySelectorAll("[data-flatpickr-range], [data-flatpickr-single], [data-flatpickr-multiple]")
    .forEach((el) => {
      if (el._flatpickr) el._flatpickr.destroy();
    });
}

async function getAvailableDateRange(siteCode) {
  const token = getCookie("fongai_token");
  const { startTime, endTime } = getTimeRange();
  const data = await fetchSiteData(siteCode, startTime, endTime, token);
  const enabledDates = (data || [])
    .map((d) => formatDateForCompare(new Date(d.Date)))
    .filter(Boolean);
  const sortedDates = [...enabledDates].sort(
    (a, b) => new Date(a) - new Date(b),
  );
  const minDate = sortedDates.length ? sortedDates[0] : null;
  const maxDate = sortedDates.length ? sortedDates[sortedDates.length - 1] : null;

  return {
    minDate,
    maxDate,
  };
}

async function getCachedDateRange(siteCode) {
  if (dateRangeCache.has(siteCode)) {
    return dateRangeCache.get(siteCode);
  }
  const result = await getAvailableDateRange(siteCode);
  dateRangeCache.set(siteCode, result);
  return result;
}

async function initFlatpickr(el, site, mode) {
  const fp = typeof window !== "undefined" ? window.flatpickr : null;
  if (typeof fp !== "function") return;

  const locale = fp.l10ns?.zh_tw || fp.l10ns?.zh;
  const { minDate, maxDate } = await getCachedDateRange(site.code);

  let config = {
    dateFormat: "Y-m-d",
    locale,
    minDate,
    maxDate,
    rangeSeparator: " ~ ",
  };

  if (mode === "range") {
    config.mode = "range";

    config.onChange = (dates) => {
      // 防止初始化或錯誤觸發（只選到一個日期時不處理）
      if (!Array.isArray(dates) || dates.length !== 2) return;

      site.start = formatDateForCompare(dates[0]);
      site.end = formatDateForCompare(dates[1]);

     

      void renderCompareCharts();
    };
  }

  if (mode === "single") {
    config.mode = "single";
    config.defaultDate = site.end || site.start || null;

    config.onChange = (dates) => {
      if (dates[0]) {
        const d = formatDateForCompare(dates[0]);
        site.start = d;
        site.end = d;
        void renderCompareCharts();
      }
    };
  }

  if (mode === "multiple") {
    config.mode = "multiple";
    config.defaultDate = Array.isArray(site.selectedDates)
      ? site.selectedDates
      : null;

    config.onChange = (dates) => {
      site.selectedDates = dates.map((d) => formatDateForCompare(d));
      void renderCompareCharts();
    };
  }

  const instance = fp(el, config);

  if (mode === "range" && site.start && site.end) {
    

   
    instance.setDate([site.start, site.end], false);

    
    const display = `${site.start} ~ ${site.end}`;
    instance.input.value = display;

    setTimeout(() => {
      if (instance && site.start && site.end) {
        instance.input.value = `${site.start} ~ ${site.end}`;
      }
    }, 0);
  }
}

function initCompareFlatpickr() {
  const root = document.getElementById("compareControls");
  if (!root) return;

  root.querySelectorAll("[data-flatpickr-range]").forEach((el) => {
    const idx = Number(el.dataset.compareIndex);
    const site = dashboardState.selectedSites[idx];
    if (!site) return;
    void initFlatpickr(el, site, "range");
  });

  root.querySelectorAll("[data-flatpickr-single]").forEach((el) => {
    const idx = Number(el.dataset.compareIndex);
    const site = dashboardState.selectedSites[idx];
    if (!site) return;
    void initFlatpickr(el, site, "single");
  });

  root.querySelectorAll("[data-flatpickr-multiple]").forEach((el) => {
    const idx = Number(el.dataset.compareIndex);
    const site = dashboardState.selectedSites[idx];
    if (!site) return;
    void initFlatpickr(el, site, "multiple");
  });
}


async function makeSelectedSite(code) {
  const token = getCookie("fongai_token");
  const { startTime, endTime } = getTimeRange();

 

  const data = await fetchSiteData(code, startTime, endTime, token);

 

  if (!Array.isArray(data) || data.length === 0) {
   
    return { code, timeMode: "range", start: "", end: "" };
  }

  const dates = data
    .map((d) => new Date(d.Date))
    .filter((d) => Number.isFinite(d.getTime()))
    .sort((a, b) => a - b);


  return {
    code,
    timeMode: "range",
    start: formatDateForCompare(dates[0]),
    end: formatDateForCompare(dates[dates.length - 1]),
  };
}


function renderCompareControls() {
  const container = document.getElementById("compareControls");
  if (!container) return;
  const formatDisplayDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  destroyCompareFlatpickr(container);

  container.innerHTML = dashboardState.selectedSites
    .slice(0, COMPARE_SELECTED_SITES_MAX)
    .map((item, idx) => {
      const siteName = getLocationMap()?.[item.code]?.name || item.code;
      const siteOptions = Object.entries(getLocationMap() || {})
        .map(
          ([code, site]) => `
            <option value="${code}" ${code === item.code ? "selected" : ""}>
              ${site.name}
            </option>
          `,
        )
        .join("");
      const rangeValue =
        item.start && item.end
          ? `${formatDisplayDate(item.start)} ~ ${formatDisplayDate(item.end)}`
          : "";
      const singleValue =
        item.end || item.start
          ? formatDisplayDate(item.end || item.start)
          : "";
      const multipleValue = Array.isArray(item.selectedDates)
        ? item.selectedDates.join(", ")
        : "";
      const rangeHidden = item.timeMode === "range" ? "" : "d-none";
      const singleHidden = item.timeMode === "single" ? "" : "d-none";
      const multipleHidden = item.timeMode === "multiple" ? "" : "d-none";
      return `
        <div class="compare-control" data-compare-index="${idx}">
          <div class="compare-control-label"><i class="fa-solid fa-circle"></i> ${siteName}</div>
          <select
            class="form-select form-select-sm"
            data-compare-site
            data-compare-index="${idx}"
          >
            ${siteOptions}
          </select>
          <select class="form-select form-select-sm" data-compare-field="timeMode">
            <option value="range">區間</option>
            <option value="single">單日</option>
            <option value="multiple">多日期</option>
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
            <div class="compare-date-multiple-wrap ${multipleHidden}">
              <input
                type="text"
                class="form-control form-control-sm compare-flatpickr-input"
                data-flatpickr-multiple
                data-compare-index="${idx}"
                value="${multipleValue}"
                placeholder="選擇多個日期"
                readonly
              />
            </div>
            <div class="compare-quick-actions">
              <button 
                type="button" 
                class="compare-quick-btn" 
                data-quick="year" 
                data-compare-index="${idx}"
              >
                <i class="fa-solid fa-calendar"></i> 今年
              </button>
              <button 
                type="button" 
                class="compare-quick-btn" 
                data-quick="6m" 
                data-compare-index="${idx}"
              >
                <i class="fa-solid fa-calendar-week"></i> 最近半年
              </button>
              <button 
                type="button" 
                class="compare-quick-btn" 
                data-quick="30d" 
                data-compare-index="${idx}"
              >
                <i class="fa-solid fa-calendar-days"></i> 最近1個月
              </button>
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
    const modeEl = row.querySelector('[data-compare-field="timeMode"]');
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
 * 核心：繪製多線比較圖
 */
function drawMultiLineChart(canvasId, groupedData, key, options = {}) {
  const { unit = "", format = (v) => v.toFixed(1) } = options;
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
            label: (ctx) => {
              const value = ctx.parsed.y;
              if (value == null) return "";
              return `${ctx.dataset.label}: ${format(value)} ${unit}`;
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: unit,
            font: { weight: "bold" },
          },
          ticks: {
            callback: (value) => `${format(value)}${unit}`,
          },
        },
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
        let start = site.start;
        let end = site.end;

        if (site.timeMode === "multiple" && site.selectedDates?.length) {
          const sorted = [...site.selectedDates].sort();
          start = sorted[0];
          end = sorted[sorted.length - 1];
        }

        const { start: tsStart, end: tsEnd } = toTimestampRange(
          start,
          end,
          site.timeMode,
        );
      
        
        // console.log("API送出時間 👉", new Date(start), new Date(end));
        let data = await fetchSiteData(site.code, tsStart, tsEnd, token);
        if (site.timeMode === "multiple") {
          data = filterByDates(data, site.selectedDates);
        }
       
       
        return {
          code: site.code,
          site: getLocationMap()?.[site.code]?.name || site.code,
          data: data || [],
          timeMode: site.timeMode,
          selectedDates: site.selectedDates,
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

    drawMultiLineChart("sitStandChartCanvas", grouped, "ChairSecond", {
      unit: "秒",
    });

    drawMultiLineChart("balanceChartCanvas", grouped, "BalanceScore", {
      unit: "分",
    });

    drawMultiLineChart("gaitChartCanvas", grouped, "GaitSpeed", {
      unit: "cm/s",
    });

    drawMultiLineChart("riskChartCanvas", grouped, "RiskRate", {
      unit: "%",
    });
    renderCompareSummary(grouped);
  } finally {
    document.body.classList.remove("is-loading");
  }
}


export async function initCompareMode() {
  document.body.classList.add("is-loading");
  try {
    {
      const defaultCodes = await autoSelectDefaultSites(2);

      // ✅ 如果只有一個據點 → 自動自己比自己
      if (defaultCodes.length === 1) {
        const site = await makeSelectedSite(defaultCodes[0]);

        dashboardState.selectedSites = [
          { ...site },
          { ...site },
        ];
      } else {
        dashboardState.selectedSites = await Promise.all(
          defaultCodes.map((code) => makeSelectedSite(code)),
        );
      }
    }

    trimCompareSelectedSitesToMax();

   
    renderCompareControls();

    if (dashboardState.selectedSites.length >= 2) {
      await renderCompareCharts();
    } else {
      clearAllCharts();
      drawNoDataChart();
    }
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

  if (timeMode === "multiple") {
    const values = data
      .map((d) => Number(d[key]))
      .filter((v) => Number.isFinite(v));

    if (!values.length) return null;

    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  return null;
}

function getTimeDisplay(row) {
  if (row.timeMode === "single") {
    return {
      label: "單日資料",
      text: new Date(row.end).toLocaleDateString("zh-TW"),
    };
  }

  if (row.timeMode === "multiple") {
    return {
      label: "多日平均",
      text: row.selectedDates
        ?.map((d) => new Date(d).toLocaleDateString("zh-TW"))
        .join("、") || "",
    };
  }

  return {
    label: "區間平均",
    text: `${new Date(row.start).toLocaleDateString("zh-TW")}～${new Date(row.end).toLocaleDateString("zh-TW")}`,
  };
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

  const emptyRangeCardHtml = `
    <div class="metric-card empty">
      <div class="metric-empty-icon">
        <i class="fa-solid fa-calendar-xmark"></i>
      </div>
      <div class="metric-empty-title">所選日期區間無資料</div>
      <div class="metric-empty-desc">請調整日期</div>
    </div>
  `;

  if (!groupedData) {
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
    .map((group, index) => {
      const chair = getMetricValue(group.data, "ChairSecond", group.timeMode);
      const balance = getMetricValue(group.data, "BalanceScore", group.timeMode);
      const gait = getMetricValue(group.data, "GaitSpeed", group.timeMode);
      const risk = getMetricValue(group.data, "RiskRate", group.timeMode);

      return {
        site: group.site,
        id: `${group.code}-${index}`,
        timeMode: group.timeMode,
        selectedDates: group.selectedDates,
        start: group.start,
        end: group.end,
        chair,
        balance,
        gait,
        risk,
      };
    })
    .filter(Boolean);

  const isDifferentTime = groupedData.some(
    (g, _, arr) => g.start !== arr[0].start || g.end !== arr[0].end,
  );
  const isSameSite =
    groupedData.length === 2 && groupedData[0].code === groupedData[1].code;
  const siteLabel0 = rows[0]?.site || "A";
  const siteLabel1 = rows[1]?.site || "B";
  if (compareResultTitleEl) {
    compareResultTitleEl.textContent = isSameSite
      ? "同據點不同時間區間比較結果"
      : `${siteLabel0} vs ${siteLabel1} 比較結果`;
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
      label: "AI風險機率",
      unit: "%",
      better: "min",
    },
  ];

  if (isSameSite) {
    rankingEl.innerHTML = "";

    const ADisplayInfo = getTimeDisplay(rows[0]);
    const BDisplayInfo = getTimeDisplay(rows[1]);

    winnerEl.innerHTML = `
      <div class="winner-inner">
        <div class="winner-icon">
          <i class="fa-solid fa-code-compare"></i>
        </div>
        <div class="winner-text">
          <div class="main">${rows[0].site} 同據點時間比較</div>
          <div class="sub">
            ${ADisplayInfo.label}A：${ADisplayInfo.text} ｜ ${BDisplayInfo.label}B：${BDisplayInfo.text}
          </div>
        </div>
      </div>
    `;
  } else {
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
      // scoreMap[best.site] = (scoreMap[best.site] || 0) + 1;
      scoreMap[best.id] = (scoreMap[best.id] || 0) + 1;
    });

    const winnerEntries = Object.entries(scoreMap)
      .map(([id, score]) => {
        const row = rows.find((r) => r.id === id);
        return {
          id,
          site: row?.site,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);
    let winnerText = "各據點表現接近，目前沒有明確表現最佳者";
    if (winnerEntries.length) {
      const topSite = winnerEntries[0].site;
      const score = winnerEntries[0].score;
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
          ({ site, score }, index) =>
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
  }

  const ICON_MAP = {
    chair: '<i class="fa-solid fa-chair"></i>',
    balance: '<i class="fa-solid fa-scale-balanced"></i>',
    gait: '<i class="fa-solid fa-person-walking"></i>',
    risk: '<i class="fa-solid fa-shield-heart"></i>',
  };

  const metricCards = METRICS.map((metric) => {
    const A = rows[0];
    const B = rows[1];

    const AValue = A[metric.key];
    const BValue = B[metric.key];

    if (AValue == null || BValue == null) return "";

    const round = (v) => Math.round(v * 10) / 10;
    const ADisplay = round(AValue);
    const BDisplay = round(BValue);

    const isABetter =
      metric.better === "min"
        ? AValue < BValue
        : AValue > BValue;

    const best = isABetter ? A : B;
    const worst = isABetter ? B : A;
    const diff = Math.abs(ADisplay - BDisplay);
    const worstValue = Math.abs(worst[metric.key]);
    const percent = worstValue === 0 ? 0 : (diff / worstValue) * 100;
    const isTie = diff === 0;
    const AClass = isTie ? "" : isABetter ? "is-better" : "is-worse";
    const BClass = isTie ? "" : isABetter ? "is-worse" : "is-better";
    const ADisplayInfo = getTimeDisplay(A);
    const BDisplayInfo = getTimeDisplay(B);
    const unitText = metric.unit ? ` ${metric.unit}` : "";

    return `
      <div class="metric-card ${isTie ? "is-tie" : "is-active"}">
        <div class="metric-header">
          <div class="icon">${ICON_MAP[metric.key]}</div>
          <div class="label">${metric.label}</div>
        </div>

        <div class="metric-body">
          <div class="metric-top">
            <div class="metric-site">
              ${isTie
                ? "表現相同"
                : isSameSite
                ? (isABetter
                ? `${ADisplayInfo.label}A 較佳`
                : `${BDisplayInfo.label}B 較佳`)
                : (isABetter
                ? `${A.site} 較佳`
                : `${B.site} 較佳`)
              }
            </div>
            ${
              isSameSite
                ? `<div class="metric-badge neutral">${ADisplayInfo.label} vs ${BDisplayInfo.label}</div>`
                : !isTie
                ? `<div class="metric-badge">最佳</div>`
                : `<div class="metric-badge neutral">平手</div>`
            }
          </div>

          <div class="metric-values-list">
            <div class="metric-value-row ${AClass}">
              <span>${isSameSite ? `${ADisplayInfo.label}A` : A.site}</span>
              <strong>${AValue.toFixed(1)}${unitText}</strong>
              <em>${ADisplayInfo.label}</em>
            </div>
            <div class="metric-value-row ${BClass}">
              <span>${isSameSite ? `${BDisplayInfo.label}B` : B.site}</span>
              <strong>${BValue.toFixed(1)}${unitText}</strong>
              <em>${BDisplayInfo.label}</em>
            </div>
          </div>

          <div class="metric-time">
            <i class="fa-solid fa-calendar-days"></i>
            ${isSameSite ? `${getTimeDisplay(best).label}A` : best.site}：${getTimeDisplay(best).text}
          </div>
          <div class="metric-time">
            <i class="fa-solid fa-calendar-days"></i>
            ${isSameSite ? `${getTimeDisplay(worst).label}B` : worst.site}：${getTimeDisplay(worst).text}
          </div>
          <div class="metric-compare">${
            isTie
              ? "雙方數值相同"
              : isSameSite
              ? (isABetter
              ? `${ADisplayInfo.label}A 表現優於 ${BDisplayInfo.label}B`
              : `${BDisplayInfo.label}B 表現優於 ${ADisplayInfo.label}A`)
              : (isABetter
              ? `${A.site} 表現優於 ${B.site}`
              : `${B.site} 表現優於 ${A.site}`)
          }</div>
        </div>

        <div class="metric-footer">
          <div class="metric-diff">
            <span class="diff-value">
              ${isTie ? "無差異" : `差距 ${diff.toFixed(1)}${unitText}`}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  contentEl.innerHTML =
    metricCards ||
    '<div class="metric-card empty"><div class="metric-empty-title">尚無足夠指標可比較</div><div class="metric-empty-desc">請確認各據點於所選區間皆有資料</div></div>';
}
