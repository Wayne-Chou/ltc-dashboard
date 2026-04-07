/* ========================
   比較模式（進入）
   ======================== */

function enterCompareMode() {
  //  切換狀態
  dashboardState.view = "compare";

  //  清掉目前畫面所有 chart
  clearAllCharts();

  // 初始化讓他能維持垂直水平至中（延遲一幀，避免 Chart 衝突）
  requestAnimationFrame(() => {
    initEmptyCharts();
    drawNoDataChart();
  });

  //  隱藏原本單一模式 UI
  document.querySelectorAll(".compare-hide").forEach((el) => {
    el.classList.add("hidden");
  });

  //  顯示比較 UI 區塊
  document.getElementById("compareView").classList.remove("hidden");

  //  重置已選據點
  dashboardState.selectedSites = [];

  //  更新 UI
  renderSelectedSites();
  renderSiteSelector();

  // 按鈕文字切換（UX）
  document.getElementById("compareBtn").innerHTML =
    '<i class="bi bi-x-lg me-1"></i> 返回一般模式';
}

/* ========================
   比較模式(離開)
   ======================== */
function exitCompareMode() {
  dashboardState.view = "default";
  removeNoDataOverlay();
  // 顯示原本 UI
  document.querySelectorAll(".compare-hide").forEach((el) => {
    el.classList.remove("hidden");
  });

  //  隱藏比較 UI
  document.getElementById("compareView").classList.add("hidden");

  //  清空選擇
  dashboardState.selectedSites = [];
  renderSelectedSites();

  //  重新畫單一圖
  renderAllCharts();

  document.getElementById("compareBtn").innerHTML =
    '<i class="bi bi-intersect me-1"></i> 群體比較模式';
}

/* ========================
   模式切換
   ======================== */
window.toggleCompareMode = function () {
  if (dashboardState.view === "compare") {
    exitCompareMode();
  } else {
    enterCompareMode();
  }
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

    if (chart) {
      chart.destroy();
    }
  });
}

/* ========================
   渲染據點列表（卡片）
   ======================== */
window.renderSiteSelector = function () {
  const container = document.getElementById("siteSelector");
  if (!container) return;

  const sites = Object.values(locationMap);

  if (!sites.length) {
    container.innerHTML = `<div class="text-muted">尚無據點資料</div>`;
    return;
  }

  //  每個據點一張卡片
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
    //  取消選擇
    dashboardState.selectedSites = list.filter((s) => s !== siteCode);
    el.classList.remove("active");
  } else {
    //  最多3個
    if (list.length >= 3) {
      alert("最多選擇3個據點");
      return;
    }

    dashboardState.selectedSites.push(siteCode);
    el.classList.add("active");
  }

  //  更新上方 tag UI
  renderSelectedSites();

  //  如果全部取消 → 清圖
  if (dashboardState.selectedSites.length === 0) {
    clearAllCharts();

    requestAnimationFrame(() => {
      initEmptyCharts();
      drawNoDataChart();
    });

    return;
  }

  //  重新抓資料 + 畫圖
  await renderCompareCharts();
};

/* ========================
   已選據點（tag UI）
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
   移除據點（點 tag）
   ======================== */
window.removeSite = async function (code) {
  dashboardState.selectedSites = dashboardState.selectedSites.filter(
    (s) => s !== code,
  );

  renderSelectedSites();

  // 同步卡片 UI（取消 active）
  document.querySelectorAll(".site-card").forEach((card) => {
    const cardCode = card.dataset.code;
    if (!dashboardState.selectedSites.includes(cardCode)) {
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
  const colorMap = SITE_COLOR_MAP;

  const allDatesSet = new Set();
  groupedData.forEach((group) => {
    group.data.forEach((d) => {
      allDatesSet.add(d.Date);
    });
  });

  const allDates = [...allDatesSet].sort((a, b) => new Date(a) - new Date(b));

  const labels = allDates.map((d) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const datasets = groupedData.map((group) => {
    const map = new Map();

    group.data.forEach((d) => {
      map.set(d.Date, d[key]);
    });

    return {
      label: group.site,
      data: allDates.map((date) => map.get(date) ?? null),
      borderColor: colorMap[group.code],
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
   比較模式畫圖入口
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
   單一模式（保留）
   ======================== */
window.renderAllCharts = function () {
  if (!window.dashboardState) return;
  if (!window.currentAssessments) return;
  removeNoDataOverlay();

  if (dashboardState.view === "default") {
    drawSitStandChartChartJS(currentAssessments);
    drawBalanceChartChartJS(currentAssessments);
    drawGaitChartChartJS(currentAssessments);
    drawRiskChartChartJS(currentAssessments);
  }
};
