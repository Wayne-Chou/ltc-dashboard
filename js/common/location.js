// js/common/location.js
// 說明：
// - URL 使用數字 regionId（符合技術長要求）
// - 0 = overview
// - 非 0 = 單一場域
// - 未來可無痛改成 API

// ========================
// 場域設定（穩定數字 ID）
// ========================
const locationMap = {
  1: { name: "St Luke", file: "PageAPI-StLuke.json" },
};

// ========================
// overview / 單場域顯示切換
// ========================
function updateHideOnAll(regionId) {
  const showOnlyOnRegion = document.querySelectorAll(".hide-on-all");
  const mainCols = document.querySelectorAll(".main-col");
  const sechide = document.querySelectorAll(".sechide");

  if (regionId === 0) {
    showOnlyOnRegion.forEach((el) => (el.style.display = "none"));
    mainCols.forEach((el) => {
      el.classList.remove("col-md-6");
      el.classList.add("col-md-4");
    });
    sechide.forEach((el) => (el.style.display = "block"));
  } else {
    showOnlyOnRegion.forEach((el) => (el.style.display = "block"));
    mainCols.forEach((el) => {
      el.classList.remove("col-md-4");
      el.classList.add("col-md-6");
    });
    sechide.forEach((el) => (el.style.display = "none"));
  }
}

// ========================
// Loading（全域）
// ========================
function showGlobalLoading() {
  document.body.classList.add("is-loading");
}

function hideGlobalLoading() {
  document.body.classList.remove("is-loading");
}

// ========================
// 共用：套資料到畫面
// ========================
function applyAssessments(assessments) {
  window.currentAssessments = assessments || [];

  renderAssessmentTable(window.currentAssessments);
  updateLatestCountDate(window.currentAssessments);
  updateTotalCountAndStartDate(window.currentAssessments);

  if (!window.currentAssessments.length) {
    drawNoDataChart();
    return;
  }

  drawSitStandChartChartJS(window.currentAssessments);
  drawBalanceChartChartJS(window.currentAssessments);
  drawRiskChartChartJS(window.currentAssessments);
  drawGaitChartChartJS(window.currentAssessments);
}

// ========================
// 載入資料（用數字 ID）
// ========================
async function loadLocationDataById(regionId) {
  updateHideOnAll(regionId);
  showGlobalLoading();

  try {
    // === overview（0）===
    if (regionId === 0) {
      let allAssessments = [];

      for (const loc of Object.values(locationMap)) {
        const res = await fetch(loc.file);
        const data = await res.json();
        allAssessments = allAssessments.concat(data.assessments || []);
      }

      document.getElementById("dropdownMenuButton").textContent = t("overview");
      applyAssessments(allAssessments);
      return;
    }

    // === 單一場域 ===
    const loc = locationMap[regionId];
    if (!loc) {
      console.error("找不到 regionId:", regionId);
      return;
    }

    const res = await fetch(loc.file);
    const data = await res.json();

    document.getElementById("dropdownMenuButton").textContent = loc.name;
    applyAssessments(data.assessments || []);
  } catch (err) {
    console.error("載入場域資料失敗:", err);
  } finally {
    hideGlobalLoading();
  }
}

// ========================
// 初始化下拉選單
// ========================
function initLocationDropdown() {
  const dropdownButton = document.getElementById("dropdownMenuButton");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const locationCount = document.getElementById("locationCount");
  const locationList = document.getElementById("locationList");

  const ids = Object.keys(locationMap);
  locationCount.textContent = ids.length;
  locationList.textContent = ids.map((id) => locationMap[id].name).join("、");

  dropdownMenu.innerHTML = "";

  // === overview（0）===
  const liAll = document.createElement("li");
  const aAll = document.createElement("a");
  aAll.className = "dropdown-item";
  aAll.href = "#";
  aAll.textContent = t("overview");

  aAll.addEventListener("click", () => {
    dropdownButton.textContent = t("overview");
    loadLocationDataById(0);
    refreshLevelUI?.();

    const url = new URL(window.location);
    url.searchParams.set("region", "0");
    window.history.replaceState({}, "", url);
  });

  liAll.appendChild(aAll);
  dropdownMenu.appendChild(liAll);

  // === 各場域 ===
  ids.forEach((id) => {
    const loc = locationMap[id];
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.className = "dropdown-item";
    a.href = "#";
    a.textContent = loc.name;

    a.addEventListener("click", () => {
      dropdownButton.textContent = loc.name;
      loadLocationDataById(Number(id));
      refreshLevelUI?.();

      const url = new URL(window.location);
      url.searchParams.set("region", id);
      window.history.replaceState({}, "", url);
    });

    li.appendChild(a);
    dropdownMenu.appendChild(li);
  });

  // === URL 初始化 ===
  const params = new URL(window.location).searchParams;
  const regionId = Number(params.get("region"));

  if (regionId === 0 || locationMap[regionId]) {
    loadLocationDataById(regionId);
  } else {
    loadLocationDataById(0);
  }
}
