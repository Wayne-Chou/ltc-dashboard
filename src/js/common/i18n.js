// src/js/common/i18n.js

import { LANG } from "./lang.js";

// 1. 初始化語言狀態（不再掛在 window，除非 HTML onclick 需要）
export let currentLang =
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

// 翻譯函數
export function t(key) {
  // 注意：這裡的 LANG 必須確保能讀取到，建議從 config.js import
  const langDict = (typeof LANG !== "undefined" ? LANG[currentLang] : {}) || {};
  return getNestedValue(langDict, key) ?? key;
}

// 2. 導出 applyI18n
export function applyI18n() {
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

// 3. 導出 switchLanguage
export function switchLanguage(lang) {
  currentLang = lang;
  window.currentLang = lang;
  localStorage.setItem("lang", lang);

  // 刷靜態文字
  applyI18n();

  const allAssessments = window.lastRenderedAssessments;
  if (!allAssessments || allAssessments.length === 0) {
    if (typeof window.initMap === "function") window.initMap();
    return;
  }

  const selectedIndices = window.selected || [];
  const dataToUpdate = allAssessments.filter((_, i) =>
    selectedIndices.includes(i),
  );

  const modalEl = document.getElementById("detailsModal");

  if (modalEl && modalEl.classList.contains("show")) {
    const modalEl = document.getElementById("detailsModal");

    if (modalEl && modalEl.classList.contains("show")) {
      if (typeof window.renderDetailModalContent === "function") {
        window.renderDetailModalContent();
      }
    }
    // const selectedData = (window.selected || [])
    //   .map((i) => window.lastRenderedAssessments?.[i])
    //   .filter(Boolean);

    // const modalBody = modalEl.querySelector(".modal-body");

    // if (modalBody) {
    //   if (!selectedData.length) {
    //     modalBody.innerHTML = `<div class="p-5 text-center text-muted">${t("alertNoData")}</div>`;
    //   } else {
    //     modalBody.innerHTML = window.buildDegenerateBlock(selectedData);
    //     modalBody.innerHTML += `<hr><div class="mb-3 fw-bold">
    //       <i class="bi bi-people-fill me-2"></i>${t("highRiskGroup")}
    //     </div>`;

    //     const years = [
    //       ...new Set(
    //         selectedData.map((i) =>
    //           i.Date ? new Date(i.Date).getFullYear() : null,
    //         ),
    //       ),
    //     ]
    //       .filter(Boolean)
    //       .sort((a, b) => b - a);

    //     modalBody.innerHTML += `
    //       <div class="d-flex align-items-center gap-2 mb-3">
    //         <select id="yearSelect" class="form-select form-select-sm w-auto">
    //           ${years.map((y) => `<option value="${y}">${y}</option>`).join("")}
    //         </select>
    //         <div id="monthButtons" class="d-flex flex-wrap gap-1"></div>
    //       </div>
    //       <div id="monthContent" class="mt-2"></div>`;

    //     const yearSelect = modalBody.querySelector("#yearSelect");
    //     const monthButtons = modalBody.querySelector("#monthButtons");
    //     const monthContent = modalBody.querySelector("#monthContent");

    //     yearSelect.onchange = (e) =>
    //       window.renderMonthButtons(
    //         selectedData,
    //         parseInt(e.target.value),
    //         monthButtons,
    //         monthContent,
    //       );

    //     window.renderMonthButtons(
    //       selectedData,
    //       parseInt(yearSelect.value),
    //       monthButtons,
    //       monthContent,
    //     );
    //   }
    // }
  }

  // 呼叫其他模組的渲染函數 (暫時掛在 window 下)
  if (typeof window.renderAssessmentTable === "function")
    window.renderAssessmentTable(allAssessments);
  if (typeof window.initMap === "function") window.initMap();

  // 更新統計數字
  if (typeof window.updateTotalCountAndStartDate === "function")
    window.updateTotalCountAndStartDate(dataToUpdate);
  if (typeof window.updateLatestCountDate === "function")
    window.updateLatestCountDate(dataToUpdate);

  // 風險統計
  if (typeof window.renderRisk === "function") window.renderRisk(dataToUpdate);
  if (typeof window.updateDegenerateAndLevels === "function")
    window.updateDegenerateAndLevels(dataToUpdate);

  // 參與者狀態
  const levelContainer = document.getElementById("levelContainer");
  const isLevelVisible =
    levelContainer && !levelContainer.classList.contains("d-none");

  if (isLevelVisible) {
    if (typeof window.refreshLevelUI === "function")
      window.refreshLevelUI(dataToUpdate);
  } else {
    if (typeof window.handleRiskFilter === "function")
      window.handleRiskFilter("all", { scope: document });
  }

  // 圖表
  if (typeof window.updateChartsI18n === "function") window.updateChartsI18n();
}

window.switchLanguage = switchLanguage;
window.currentLang = currentLang;

// 初始化執行
document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
});
