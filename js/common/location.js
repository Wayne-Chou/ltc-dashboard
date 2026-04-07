// /js/common/location.js

/* ========================
   全域變數
   ======================== */
let locationMap = {}; // { siteCode: { name, code, lat, lng, Count, Times } }
let siteStatsMap = {}; // { siteCode: { Count, Times } }
const BASE_URL = window.APP_CONFIG.BASE_URL;

/* ========================
   工具：時間區間
   ======================== */
function getTimeRange() {
  return {
    startTime: new Date("2024-01-01").getTime(),
    endTime: new Date().getTime(),
  };
}

/* ========================
   1. 初始化場域頁面
   ======================== */
async function initLocationPage() {
  showGlobalLoading();

  const token =
    typeof getCookie === "function" ? getCookie("fongai_token") : null;
  if (!token) {
    const currentUrl = window.location.pathname + window.location.search;
    window.location.replace(
      `login.html?redirect=${encodeURIComponent(currentUrl)}`,
    );
    return;
  }

  try {
    // 只打一次 /dashboard/sites
    const response = await fetch(`${BASE_URL}/dashboard/sites`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      const currentUrl = window.location.pathname + window.location.search;
      deleteCookie("fongai_token");

      window.location.replace(
        `login.html?reason=expired&redirect=${encodeURIComponent(currentUrl)}`,
      );
      return;
    }

    if (!response.ok) throw new Error("無法取得場域總表");

    const result = await response.json();
    const sites = result.Data || [];

    // 建立快取
    locationMap = {};
    siteStatsMap = {};

    sites.forEach((site) => {
      locationMap[site.Code] = {
        name: site.Name,
        code: site.Code,
        lat: parseFloat(site.LatLngCoordinate?.Latitude) || 25.038,
        lng: parseFloat(site.LatLngCoordinate?.Longitude) || 121.564,
        Count: site.Count || 0,
        Times: site.Times || 0,
      };
      siteStatsMap[site.Code] = {
        Count: site.Count || 0,
        Times: site.Times || 0,
      };
    });

    // 更新下拉選單 & 數量
    renderDropdownUI();
    const locationCount = document.getElementById("locationCount");
    const locationList = document.getElementById("locationList");
    if (locationCount) locationCount.textContent = sites.length;
    if (locationList)
      locationList.textContent = sites.map((s) => s.Name).join("、");

    // 畫地圖
    if (typeof initMap === "function") initMap();

    // URL 參數切換 Overview / 單一場域
    const params = new URL(window.location).searchParams;
    const regionParam = params.get("region");
    if (regionParam && regionParam !== "0" && locationMap[regionParam]) {
      await loadLocationDataByCode(locationMap[regionParam].code, regionParam);
    } else {
      await loadLocationDataById(0); // 初始進入 Overview 不打 API
    }
  } catch (err) {
    console.error("初始化場域失敗:", err);
  } finally {
    hideGlobalLoading();
  }
}

/* ========================
   2. 下拉選單 UI
   ======================== */
function renderDropdownUI() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (!dropdownMenu) return;

  dropdownMenu.innerHTML = "";

  // Overview
  const liAll = document.createElement("li");
  const aAll = document.createElement("a");
  aAll.className = "dropdown-item";
  aAll.href = "#";
  aAll.textContent = t("overview");
  aAll.onclick = async (e) => {
    e.preventDefault();
    updateUrlParam("0");
    await loadLocationDataById(0, true);
  };
  liAll.appendChild(aAll);
  dropdownMenu.appendChild(liAll);

  // 個別場域
  Object.keys(locationMap).forEach((code) => {
    const loc = locationMap[code];
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "dropdown-item";
    a.href = "#";
    a.textContent = loc.name;
    a.onclick = async (e) => {
      e.preventDefault();
      updateUrlParam(code);
      await loadLocationDataByCode(loc.code, code);
    };
    li.appendChild(a);
    dropdownMenu.appendChild(li);
  });
}

/* ========================
   3. Overview (全域)
   ======================== */
async function loadLocationDataById(regionId, forceFetch = false) {
  updateHideOnAll(regionId);
  showGlobalLoading();

  const startDateTextEl = document.getElementById("startDateText");
  const latestDateEl = document.getElementById("latestDate");

  try {
    const dropdownButton = document.getElementById("dropdownMenuButton");
    if (dropdownButton) dropdownButton.textContent = t("overview");

    // 全域 → 隱藏 startDateText / latestDate
    if (startDateTextEl) startDateTextEl.style.opacity = "0";
    if (latestDateEl) latestDateEl.style.opacity = "0";

    if (forceFetch) {
      const token =
        typeof getCookie === "function" ? getCookie("fongai_token") : null;

      const response = await fetch(`${BASE_URL}/dashboard/sites`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 401) {
        const currentUrl = window.location.pathname + window.location.search;
        deleteCookie("fongai_token");
        window.location.replace(
          `login.html?reason=expired&redirect=${encodeURIComponent(currentUrl)}`,
        );
        return; // 中斷後續執行
      }
      if (!response.ok) throw new Error("無法取得場域總表");

      const result = await response.json();
      const sites = result.Data || [];

      // 更新快取
      locationMap = {};
      siteStatsMap = {};

      sites.forEach((site) => {
        locationMap[site.Code] = {
          name: site.Name,
          code: site.Code,
          lat: parseFloat(site.LatLngCoordinate?.Latitude) || 25.038,
          lng: parseFloat(site.LatLngCoordinate?.Longitude) || 121.564,
          Count: site.Count || 0,
          Times: site.Times || 0,
        };
        siteStatsMap[site.Code] = {
          Count: site.Count || 0,
          Times: site.Times || 0,
        };
      });

      // 更新下拉選單
      renderDropdownUI();
    }

    // 顯示總人數 / 總人次（使用快取）
    let totalPeople = 0;
    let totalTimes = 0;
    Object.values(siteStatsMap).forEach((s) => {
      totalPeople += s.Count;
      totalTimes += s.Times;
    });

    const totalCountEl = document.getElementById("totalCount");
    const latestCountEl = document.getElementById("latestCount");

    if (totalCountEl) totalCountEl.textContent = totalPeople;
    if (latestCountEl) latestCountEl.textContent = totalTimes;

    // Overview 不顯示表格 / 圖表
    applyAssessments([]);
  } catch (err) {
    console.error("載入概覽數據失敗:", err);
  } finally {
    hideGlobalLoading();
  }
}

/* ========================
   4. 單一場域
   ======================== */
async function loadLocationDataByCode(code, regionId) {
  updateHideOnAll(regionId);
  showGlobalLoading();

  const startDateTextEl = document.getElementById("startDateText");
  const latestDateEl = document.getElementById("latestDate");

  const token =
    typeof getCookie === "function" ? getCookie("fongai_token") : null;
  const { startTime, endTime } = getTimeRange();

  try {
    const dropdownButton = document.getElementById("dropdownMenuButton");
    if (dropdownButton)
      dropdownButton.textContent = locationMap[regionId]?.name || "";

    // 單一場域 → 顯示 startDateText / latestDate
    if (startDateTextEl) startDateTextEl.style.opacity = "1";
    if (latestDateEl) latestDateEl.style.opacity = "1";

    // 人數 / 人次來自快取
    const stats = siteStatsMap[regionId];
    if (stats) {
      document.getElementById("totalCount").textContent = stats.Count;
      document.getElementById("latestCount").textContent = stats.Times;
    }

    // 單一場域才呼叫 API
    const siteData = await fetchSiteData(code, startTime, endTime, token);
    applyAssessments(siteData || []);
  } catch (err) {
    console.error("載入單一場域數據失敗:", err);
  } finally {
    hideGlobalLoading();
  }
}

/* ========================
   5. API 單一場域
   ======================== */
async function fetchSiteData(code, start, end, token) {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/site`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, startdate: start, enddate: end }),
    });

    if (response.status === 401) {
      const currentUrl = window.location.pathname + window.location.search;
      deleteCookie("fongai_token");
      window.location.replace(
        `login.html?reason=expired&redirect=${encodeURIComponent(currentUrl)}`,
      );
      return [];
    }

    if (!response.ok) return [];

    const result = await response.json();
    return result.Data?.assessments || [];
  } catch (e) {
    console.error(`Fetch 錯誤 (${code}):`, e);
    return [];
  }
}

/* ========================
   6. UI 輔助
   ======================== */
function updateHideOnAll(regionId) {
  const showOnlyOnRegion = document.querySelectorAll(".hide-on-all");
  const mainCols = document.querySelectorAll(".main-col");
  const sechide = document.querySelectorAll(".sechide");

  if (regionId === 0 || regionId === "0") {
    showOnlyOnRegion.forEach((el) => (el.style.display = "none"));
    mainCols.forEach((el) => el.classList.replace("col-md-6", "col-md-4"));
    sechide.forEach((el) => (el.style.display = "block"));
  } else {
    showOnlyOnRegion.forEach((el) => (el.style.display = "block"));
    mainCols.forEach((el) => el.classList.replace("col-md-4", "col-md-6"));
    sechide.forEach((el) => (el.style.display = "none"));
  }
}

function showGlobalLoading() {
  document.body.classList.add("is-loading");
}

function hideGlobalLoading() {
  document.body.classList.remove("is-loading");
}

function updateUrlParam(id) {
  const url = new URL(window.location);
  url.searchParams.set("region", id);
  window.history.replaceState({}, "", url);
}

/* ========================
   7. 套用資料（只做 UI）
   ======================== */
function applyAssessments(assessments) {
  const dataArray = Array.isArray(assessments) ? assessments : [];
  window.currentAssessments = dataArray;

  if (dataArray.length === 0) {
    if (typeof drawNoDataChart === "function") drawNoDataChart();
    if (typeof renderAssessmentTable === "function") renderAssessmentTable([]);
    return;
  }

  if (typeof renderAssessmentTable === "function")
    renderAssessmentTable(dataArray);
  if (typeof drawSitStandChartChartJS === "function")
    drawSitStandChartChartJS(dataArray);
  if (typeof drawBalanceChartChartJS === "function")
    drawBalanceChartChartJS(dataArray);
  if (typeof drawRiskChartChartJS === "function")
    drawRiskChartChartJS(dataArray);
  if (typeof drawGaitChartChartJS === "function")
    drawGaitChartChartJS(dataArray);
}

window.initLocationPage = initLocationPage;
window.loadLocationDataById = loadLocationDataById;
window.loadLocationDataByCode = loadLocationDataByCode;
// 刪除cookie

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
