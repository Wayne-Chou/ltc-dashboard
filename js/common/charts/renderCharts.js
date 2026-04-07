/* ========================
   模式切換
   ======================== */
window.toggleCompareMode = function () {
  const isCompare = dashboardState.view === "compare";

  dashboardState.view = isCompare ? "default" : "compare";

  const btn = document.getElementById("compareBtn");
  if (btn) {
    const span = btn.querySelector("span");

    if (span) {
      span.dataset.i18n = isCompare ? "compareMode" : "backToDefault";
    }
  }

  renderView(); // render 裡面會 applyI18n
};

/* ========================
   清除所有 Chart
   ======================== */
function clearAllCharts() {
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

/* ========================
   渲染據點列表
   ======================== */
window.renderSiteSelector = function () {
  const container = document.getElementById("siteSelector");
  if (!container) return;

  const sites = Object.values(locationMap);

  if (!sites.length) {
    container.innerHTML = `<div class="text-muted">尚無據點資料</div>`;
    return;
  }

  container.innerHTML = sites
    .map(
      (site) => `
    <div class="col-6 col-md-3">
      <div class="site-card"
           data-code="${site.code}"
           onclick="toggleSite('${site.code}', this)">
        <div class="site-name">${site.name}</div>
      </div>
    </div>
  `,
    )
    .join("");
};

/* ========================
   點擊據點
   ======================== */
window.toggleSite = async function (siteCode, el) {
  const list = dashboardState.selectedSites;

  if (list.includes(siteCode)) {
    dashboardState.selectedSites = list.filter((s) => s !== siteCode);
    el.classList.remove("active");
  } else {
    if (list.length >= 3) {
      alert("最多選擇3個據點");
      return;
    }
    dashboardState.selectedSites.push(siteCode);
    el.classList.add("active");
  }

  renderSelectedSites();

  if (!dashboardState.selectedSites.length) {
    clearAllCharts();

    requestAnimationFrame(() => {
      initEmptyCharts();
      drawNoDataChart();
    });

    return;
  }

  await renderCompareCharts();
};

/* ========================
   已選據點（tag）
   ======================== */
function renderSelectedSites() {
  const container = document.getElementById("selectedSites");
  if (!container) return;

  if (!dashboardState.selectedSites.length) {
    container.innerHTML = '<span class="text-muted small">尚未選擇據點</span>';
    return;
  }

  container.innerHTML = dashboardState.selectedSites
    .map(
      (code) => `
    <div class="selected-tag">
      ${locationMap[code]?.name || code}
      <span onclick="removeSite('${code}')">✕</span>
    </div>
  `,
    )
    .join("");
}

/* ========================
   移除據點
   ======================== */
window.removeSite = async function (code) {
  dashboardState.selectedSites = dashboardState.selectedSites.filter(
    (s) => s !== code,
  );

  renderSelectedSites();

  document.querySelectorAll(".site-card").forEach((card) => {
    if (!dashboardState.selectedSites.includes(card.dataset.code)) {
      card.classList.remove("active");
    }
  });

  if (!dashboardState.selectedSites.length) {
    clearAllCharts();

    requestAnimationFrame(() => {
      initEmptyCharts();
      drawNoDataChart();
    });

    return;
  }

  await renderCompareCharts();
};

/* ========================
   抓資料
   ======================== */
async function renderCompareCharts() {
  const token = getCookie("fongai_token");
  const { startTime, endTime } = getTimeRange();

  const grouped = await Promise.all(
    dashboardState.selectedSites.map(async (code) => {
      const data = await fetchSiteData(code, startTime, endTime, token);

      return {
        code,
        site: locationMap[code]?.name || code,
        data: data || [],
      };
    }),
  );

  drawCompareCharts(grouped);
}

/* ========================
   多線圖
   ======================== */
function drawMultiLineChart(canvasId, groupedData, key) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const existingChart = Chart.getChart(canvasId);
  if (existingChart) existingChart.destroy();

  const SITE_COLOR_MAP = {
    A: "#3b82f6",
    B: "#ef4444",
    C: "#10b981",
  };

  const allDatesSet = new Set();
  groupedData.forEach((group) => {
    group.data.forEach((d) => allDatesSet.add(d.Date));
  });

  const allDates = [...allDatesSet].sort((a, b) => new Date(a) - new Date(b));

  const labels = allDates.map((d) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const datasets = groupedData.map((group) => {
    const map = new Map();
    group.data.forEach((d) => map.set(d.Date, d[key]));

    return {
      label: group.site,
      data: allDates.map((date) => map.get(date) ?? null),
      borderColor: SITE_COLOR_MAP[group.code],
      tension: 0.3,
      fill: false,
      spanGaps: true,
      pointRadius: 3,
      borderWidth: 3,
    };
  });

  new Chart(canvas, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: false },
      plugins: {
        legend: { display: true },
      },
    },
  });
}

/* ========================
   比較模式畫圖
   ======================== */
window.drawCompareCharts = function (groupedData) {
  clearAllCharts();

  requestAnimationFrame(() => {
    removeNoDataOverlay();

    drawMultiLineChart("sitStandChartCanvas", groupedData, "ChairSecond");
    drawMultiLineChart("balanceChartCanvas", groupedData, "BalanceScore");
    drawMultiLineChart("gaitChartCanvas", groupedData, "GaitSpeed");
    drawMultiLineChart("riskChartCanvas", groupedData, "RiskRate");
  });
};

/* ========================
   單一模式
   ======================== */
window.renderAllCharts = function () {
  if (!window.dashboardState || !window.currentAssessments) return;

  removeNoDataOverlay();

  drawSitStandChartChartJS(currentAssessments);
  drawBalanceChartChartJS(currentAssessments);
  drawGaitChartChartJS(currentAssessments);
  drawRiskChartChartJS(currentAssessments);
};
