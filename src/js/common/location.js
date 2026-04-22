// src/js/common/location.js
import { t } from "./locale.js";
import { getCookie } from "./cookie.js";
import { renderAssessmentTable } from "./table.js";
import { BASE_URL } from "./config.js";
import { setCurrentAssessments } from "./state.js";


import { drawSitStandChartChartJS } from "./charts/sitStandChart.js";
import { drawBalanceChartChartJS } from "./charts/balanceChart.js";
import { drawRiskChartChartJS } from "./charts/riskChart.js";
import { drawGaitChartChartJS } from "./charts/gaitChart.js";

// 如果你有用 noData
import { drawNoDataChart, removeNoDataOverlay } from "./charts/noDataChart.js";

/* ========================
   私有變數
   ======================== */
let locationMap = {};
/** 僅在場域總表載入完成後 getLocationMap() 才回傳資料 */
let locationMapReady = false;
let siteStatsMap = {};

export function getLocationMap() {
  return locationMapReady ? locationMap : undefined;
}

/* ========================
   工具函數
   ======================== */
export function getTimeRange() {
  return {
    startTime: new Date("2024-01-01").getTime(),
    endTime: new Date().getTime(),
  };
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

/* ========================
   核心功能
   ======================== */

export async function initLocationPage() {
  showGlobalLoading();

  const token = getCookie("fongai_token");
  if (!token) {
    const currentUrl = globalThis.location.pathname + globalThis.location.search;
    globalThis.location.replace(
      `login.html?redirect=${encodeURIComponent(currentUrl)}`,
    );
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/dashboard/sites`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!response.ok) throw new Error("無法取得場域總表");

    const result = await response.json();
    
    const sites = result.Data || [];

    // 建立快取
    locationMapReady = false;
    locationMap = {};
    siteStatsMap = {};
    sites.forEach((site) => {
      const data = {
        name: site.Name,
        code: site.Code,
        lat: parseFloat(site.LatLngCoordinate?.Latitude) || 25.038,
        lng: parseFloat(site.LatLngCoordinate?.Longitude) || 121.564,
        Count: site.Count || 0,
        Times: site.Times || 0,
      };
      locationMap[site.Code] = data;
      siteStatsMap[site.Code] = { Count: site.Count, Times: site.Times };
    });

    locationMapReady = true;

    renderDropdownUI();

    // 更新 UI
    const locationCount = document.getElementById("locationCount");
    const locationList = document.getElementById("locationList");
    if (locationCount) locationCount.textContent = sites.length;
    if (locationList)
      locationList.textContent = sites.map((s) => s.Name).join("、");

    const { initMap } = await import("./map.js");
    initMap();

    const params = new URL(globalThis.location).searchParams;
    const regionParam = params.get("region");

    if (regionParam && regionParam !== "0" && locationMap[regionParam]) {
      await loadLocationDataByCode(locationMap[regionParam].code, regionParam);
    } else {
      await loadLocationDataById(0);
    }
  } catch (err) {
    console.error("初始化場域失敗:", err);
  } finally {
    hideGlobalLoading();
  }
}
export async function fetchSiteData(code, startTime, endTime, token) {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/site`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        startdate: startTime,
        enddate: endTime,
      }),
    });

    if (!response.ok) {
      console.error("fetchSiteData failed");
      return [];
    }

    const result = await response.json();
    return result.Data?.assessments || [];
  } catch (err) {
    console.error("fetchSiteData error:", err);
    return [];
  }
}
function renderDropdownUI() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (!dropdownMenu) return;
  dropdownMenu.innerHTML = "";

  const liAll = document.createElement("li");
  liAll.innerHTML = `<a class="dropdown-item" href="#">${t("overview")}</a>`;
  liAll.querySelector("a").onclick = async (e) => {
    e.preventDefault();
    updateUrlParam("0");
    await loadLocationDataById(0, true);
  };
  dropdownMenu.appendChild(liAll);

  Object.keys(locationMap).forEach((code) => {
    const loc = locationMap[code];
    const li = document.createElement("li");
    li.innerHTML = `<a class="dropdown-item" href="#">${loc.name}</a>`;
    li.querySelector("a").onclick = async (e) => {
      e.preventDefault();
      updateUrlParam(code);
      await loadLocationDataByCode(loc.code, code);
    };
    dropdownMenu.appendChild(li);
  });
}

export async function loadLocationDataById(regionId, forceFetch = false) {
  updateHideOnAll(regionId);
  showGlobalLoading();
  const dropdownButton = document.getElementById("dropdownMenuButton");
  if (dropdownButton) dropdownButton.textContent = t("overview");

  const startDateTextEl = document.getElementById("startDateText");
  const latestDateEl = document.getElementById("latestDate");

  if (startDateTextEl) startDateTextEl.style.opacity = "0";
  if (latestDateEl) latestDateEl.style.opacity = "0";

  if (forceFetch) {
    await initLocationPage();
    return;
  }

  let totalPeople = 0,
    totalTimes = 0;

  Object.values(siteStatsMap).forEach((s) => {
    totalPeople += s.Count;
    totalTimes += s.Times;
  });

  const totalCountEl = document.getElementById("totalCount");
  const latestCountEl = document.getElementById("latestCount");

  if (totalCountEl) totalCountEl.textContent = totalPeople;
  if (latestCountEl) latestCountEl.textContent = totalTimes;

  applyAssessments([]);
}

export async function loadLocationDataByCode(code, regionId) {
  updateHideOnAll(regionId);
  showGlobalLoading();
  const startDateTextEl = document.getElementById("startDateText");
  const latestDateEl = document.getElementById("latestDate");

  const token = getCookie("fongai_token");
  const { startTime, endTime } = getTimeRange();

  try {
    const dropdownButton = document.getElementById("dropdownMenuButton");
    if (dropdownButton)
      dropdownButton.textContent = locationMap[regionId]?.name || "";
    // 單一場域 → 顯示 startDateText / latestDate
    if (startDateTextEl) startDateTextEl.style.opacity = "1";
    if (latestDateEl) latestDateEl.style.opacity = "1";

    const stats = siteStatsMap[regionId];
    if (stats) {
      document.getElementById("totalCount").textContent = stats.Count;
      document.getElementById("latestCount").textContent = stats.Times;
    }

    const response = await fetch(`${BASE_URL}/dashboard/site`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, startdate: startTime, enddate: endTime }),
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    const result = await response.json();
    applyAssessments(result.Data?.assessments || []);
  } catch (err) {
    console.error("載入單一場域失敗:", err);
  } finally {
    hideGlobalLoading();
  }
}

function handleUnauthorized() {
  const currentUrl = globalThis.location.pathname + globalThis.location.search;
  deleteCookie("fongai_token");
  globalThis.location.replace(
    `login.html?reason=expired&redirect=${encodeURIComponent(currentUrl)}`,
  );
}

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


function applyAssessments(assessments) {
  const dataArray = Array.isArray(assessments) ? assessments : [];
  setCurrentAssessments(dataArray);

  removeNoDataOverlay?.();

  if (dataArray.length === 0) {
    drawNoDataChart?.();
    renderAssessmentTable([]);
    return;
  }

  renderAssessmentTable(dataArray);

 
  drawSitStandChartChartJS(dataArray);
  drawBalanceChartChartJS(dataArray);
  drawRiskChartChartJS(dataArray);
  drawGaitChartChartJS(dataArray);
}

/* ======================== */

function showGlobalLoading() {
  document.body.classList.add("is-loading");
}
function hideGlobalLoading() {
  document.body.classList.remove("is-loading");
}

function updateUrlParam(id) {
  const url = new URL(globalThis.location);
  url.searchParams.set("region", id);
  globalThis.history.replaceState({}, "", url);
}

