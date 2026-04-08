window.currentLang =
  localStorage.getItem("lang") ||
  (navigator.language.startsWith("en")
    ? "en"
    : navigator.language.startsWith("ja")
      ? "ja"
      : "zh");

function getNestedValue(obj, path) {
  if (!obj || !path) return null;
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
}

function t(key) {
  const langDict = LANG[window.currentLang] || LANG["zh"];
  return getNestedValue(langDict, key) ?? key;
}

function applyI18n() {
  // 文字內容
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
    el.removeAttribute("data-original-text");
  });

  // Placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Aria Label
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.setAttribute("alt", t(el.dataset.i18nAlt));
  });
}

function switchLanguage(lang) {
  window.currentLang = lang;
  localStorage.setItem("lang", lang);

  // 1. 刷靜態文字 (data-i18n)
  applyI18n();

  // 檢查是否有快取的原始資料
  const allAssessments = window.lastRenderedAssessments;
  if (!allAssessments || allAssessments.length === 0) {
    if (typeof initMap === "function") initMap(); // 即使沒資料也重繪空地圖
    return;
  }

  // --- 關鍵步驟：取得「當前被選取的資料」 ---

  const selectedIndices = window.selected || [];
  const selectedAssessments = allAssessments.filter((_, i) =>
    selectedIndices.includes(i),
  );
  // 如果一個都沒勾，通常邏輯是顯示全部或是顯示0，這裡照你 syncUIBySelection 的邏輯走
  const dataToUpdate =
    selectedAssessments.length > 0 ? selectedAssessments : [];

  // 2. 重新渲染「檢測紀錄卡片」(Assessment Table) - 這裡要用全量資料跑分頁
  if (typeof renderAssessmentTable === "function") {
    renderAssessmentTable(allAssessments);
  }

  // 3. 重新渲染地圖
  if (typeof initMap === "function") {
    initMap();
  }

  // 4. 更新頂部統計數字與日期 (這就是你說會變回 0 的地方)
  // 傳入「被選取的資料」重新計算數字
  updateTotalCountAndStartDate(dataToUpdate);
  updateLatestCountDate(dataToUpdate);

  // 5. 更新風險統計進度條與衰退名單
  if (typeof renderRisk === "function") {
    renderRisk(dataToUpdate);
  }
  if (typeof updateDegenerateAndLevels === "function") {
    updateDegenerateAndLevels(dataToUpdate);
  }

  // 6. 刷參與者狀態卡片 (Risk 或 Level 模式)
  const isLevelVisible = !document
    .getElementById("levelContainer")
    .classList.contains("d-none");
  if (isLevelVisible) {
    if (typeof refreshLevelUI === "function") {
      refreshLevelUI(dataToUpdate);
    }
  } else {
    if (typeof handleRiskFilter === "function") {
      // 這裡傳 all 代表重刷目前的過濾結果
      handleRiskFilter("all", { scope: document });
    }
  }

  // 7. 刷圖表 (Chart.js)
  if (typeof updateChartsI18n === "function") {
    updateChartsI18n();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
});
