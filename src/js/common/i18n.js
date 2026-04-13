// src/js/common/i18n.js
export {
  currentLang,
  t,
  tLocation,
  applyI18n,
  setCurrentLang,
} from "./locale.js";

import { applyI18n, setCurrentLang } from "./locale.js";
import {
  lastRenderedAssessments,
  selected,
  setCurrentPage,
} from "./state.js";
import {
  renderRisk,
  updateDegenerateAndLevels,
  updateLatestCountDate,
  updateTotalCountAndStartDate,
} from "./riskStats.js";
import { refreshLevelUI } from "./personCardLevel.js";
import { handleRiskFilter } from "./personCardRisk.js";
import { renderAssessmentTable } from "./table.js";
import { renderDetailModalContent } from "./modal/detailModal.js";

function runInitMap() {
  import("./map.js")
    .then((m) => m.initMap())
    .catch(() => {});
}

export function switchLanguage(lang) {
  setCurrentLang(lang);
  localStorage.setItem("lang", lang);

  applyI18n();

  setCurrentPage(1);

  const allAssessments = lastRenderedAssessments;
  if (!allAssessments || allAssessments.length === 0) {
    runInitMap();
    return;
  }

  const selectedIndices = selected || [];
  const dataToUpdate = allAssessments.filter((_, i) =>
    selectedIndices.includes(i),
  );

  const modalEl = document.getElementById("detailsModal");
  if (modalEl && modalEl.classList.contains("show")) {
    renderDetailModalContent();
  }

  renderAssessmentTable(allAssessments);
  runInitMap();

  updateTotalCountAndStartDate(dataToUpdate);
  updateLatestCountDate(dataToUpdate);

  renderRisk(dataToUpdate);
  updateDegenerateAndLevels(dataToUpdate);

  const levelContainer = document.getElementById("levelContainer");
  const isLevelVisible =
    levelContainer && !levelContainer.classList.contains("d-none");

  if (isLevelVisible) {
    refreshLevelUI(dataToUpdate);
  } else {
    handleRiskFilter("all", { scope: document });
  }
}

let languageMenuBound = false;

export function initLanguageMenu() {
  if (languageMenuBound) return;
  languageMenuBound = true;
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-switch-lang]");
    if (!btn) return;
    const lang = btn.getAttribute("data-switch-lang");
    if (lang) switchLanguage(lang);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  initLanguageMenu();
});
