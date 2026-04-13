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
  document.body.classList.add("is-loading");
  try {
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

    if (dashboardState.selectedSites.length) {
      tagContainer.dataset.recommendedCodes = "";
      renderSelectedSites();
      await renderCompareCharts();
      return;
    }

    const defaults = await autoSelectDefaultSites(2);

    if (defaults.length) {
      dashboardState.selectedSites = defaults;
      tagContainer.dataset.recommendedCodes = defaults.join(",");
      renderSiteSelector();
      renderSelectedSites();
      await renderCompareCharts();
      return;
    }

    tagContainer.dataset.recommendedCodes = "";
    renderSelectedSites();
    clearAllCharts();
    drawNoDataChart();
  } finally {
    document.body.classList.remove("is-loading");
  }
}

function renderCompareSummary(groupedData) {
  const basisEl = document.getElementById("compareSummaryBasis");
  const winnerEl = document.getElementById("compareSummaryWinner");
  const rankingEl = document.getElementById("compareRanking");
  const contentEl = document.getElementById("compareSummaryContent");
  if (!basisEl || !winnerEl || !rankingEl || !contentEl) return;

  const emptyCardHtml = `
    <div class="metric-card empty">
      <div class="metric-empty-icon">
        <i class="fa-solid fa-chart-line"></i>
      </div>
      <div class="metric-empty-title">尚無比較資料</div>
      <div class="metric-empty-desc">請選擇更多據點以產生比較分析</div>
    </div>
  `;

  if (groupedData.length === 0) {
    basisEl.innerHTML = `
      <i class="fa-solid fa-circle-info"></i>
      尚未選擇據點
    `;
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
    return;
  }

  const rows = groupedData
    .map((group) => {
      const latest = Array.isArray(group.data)
        ? group.data[group.data.length - 1]
        : null;
      if (!latest) return null;

      const chair = Number(latest.ChairSecond);
      const balance = Number(latest.BalanceScore);
      const gait = Number(latest.GaitSpeed);
      const risk = Number(latest.RiskRate);

      return {
        site: group.site,
        chair: Number.isFinite(chair) ? chair : null,
        balance: Number.isFinite(balance) ? balance : null,
        gait: Number.isFinite(gait) ? gait : null,
        risk: Number.isFinite(risk) ? risk : null,
      };
    })
    .filter(Boolean);

  const siteLatestEntries = groupedData
    .map((group) => {
      if (!Array.isArray(group.data) || !group.data.length) return null;
      const latestTs = Math.max(
        ...group.data
          .map((item) => new Date(item.Date).getTime())
          .filter(Number.isFinite),
      );
      if (!Number.isFinite(latestTs)) return null;
      return { site: group.site, ts: latestTs };
    })
    .filter(Boolean);
  const siteLatestTimestamps = siteLatestEntries.map((entry) => entry.ts);
  const compareBaseTs = siteLatestTimestamps.length
    ? Math.min(...siteLatestTimestamps)
    : null;

  if (rows.length < 2) {
    basisEl.innerHTML = `
      <i class="fa-solid fa-circle-info"></i>
      無法進行比較（至少需2個據點）
    `;
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
    return;
  }

  const maxLatestTs = siteLatestTimestamps.length
    ? Math.max(...siteLatestTimestamps)
    : null;
  const hasNewerData =
    compareBaseTs != null && maxLatestTs != null && maxLatestTs !== compareBaseTs;
  const basisTooltip = siteLatestEntries
    .map(
      (entry) =>
        `${entry.site}：${new Date(entry.ts).toLocaleDateString("zh-TW")}`,
    )
    .join("\n");
  if (basisTooltip) {
    basisEl.setAttribute("title", basisTooltip);
  } else {
    basisEl.removeAttribute("title");
  }

  basisEl.innerHTML = `
    <i class="fa-solid fa-calendar-check"></i>
    ${
      compareBaseTs != null
        ? `${new Date(compareBaseTs).toLocaleDateString("zh-TW")}（最近共同資料）`
        : "無可用比較基準"
    }
    ${
      hasNewerData
        ? '<span class="ms-2"><i class="fa-solid fa-triangle-exclamation"></i> 部分據點有更新資料，但目前以共同時間比較</span>'
        : ""
    }
  `;

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
  let winnerText = "各據點表現接近，無明顯差異";
  if (winnerEntries.length) {
    const [topSite, score] = winnerEntries[0];
    winnerText = `${topSite} 在 ${METRICS.length} 項指標中，有 ${score} 項表現最佳`;
    if (score === 1) {
      winnerText = `${topSite} 在 ${METRICS.length} 項指標中，有 1 項表現領先`;
    }
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
            <span class="rank">#${index + 1}</span>
            <span class="name">${site}</span>
            <span class="score">${score}</span>
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

          <div class="metric-value">
            ${best[metric.key].toFixed(1)}${unitText}
          </div>

          ${
            !isTie
              ? `<div class="metric-compare">vs ${worst.site}</div>`
              : `<div class="metric-compare">兩者相同</div>`
          }
        </div>

        <div class="metric-footer">
          差距 <strong>${diff.toFixed(1)}${unitText}</strong>
        </div>
      </div>
    `;
  }).join("");

  contentEl.innerHTML =
    metricCards || '<div class="metric-card"><div class="metric-main">需要至少2個據點比較</div></div>';
}

