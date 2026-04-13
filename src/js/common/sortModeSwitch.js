// src/js/common/sortModeSwitch.js
import { lastRenderedAssessments, selected } from "./state.js";
import { refreshLevelUI } from "./personCardLevel.js";

/**
 * 從目前的表格選取狀態中取得資料
 */
function getSelectedAssessmentsFromTable() {
  const all = lastRenderedAssessments || [];
  const selectedIdx = selected || [];
  return all.filter((_, i) => selectedIdx.includes(i));
}

/**
 * 初始化排序模式切換 (風險 vs 等級)
 */
export function initSortModeSwitch() {
  const riskModeBtn = document.getElementById("riskModeBtn");
  const levelModeBtn = document.getElementById("levelModeBtn");
  const riskContainer = document.getElementById("riskContainer");
  const levelContainer = document.getElementById("levelContainer");

  if (!riskModeBtn || !levelModeBtn || !riskContainer || !levelContainer) {
    return;
  }

  // 預設狀態：顯示 Risk (AI 跌倒風險)
  riskContainer.classList.remove("d-none");
  levelContainer.classList.add("d-none");
  riskModeBtn.classList.add("active");
  levelModeBtn.classList.remove("active");

  // 事件監聽：依風險排序
  riskModeBtn.addEventListener("click", () => {
    riskContainer.classList.remove("d-none");
    levelContainer.classList.add("d-none");
    riskModeBtn.classList.add("active");
    levelModeBtn.classList.remove("active");

    // 若切回風險模式需重刷，可於檔首 import { handleRiskFilter } from "./personCardRisk.js" 後呼叫：
    // handleRiskFilter("all", { scope: document });
  });

  // 事件監聽：依等級排序 (Vivifrail)
  levelModeBtn.addEventListener("click", () => {
    riskContainer.classList.add("d-none");
    levelContainer.classList.remove("d-none");
    levelModeBtn.classList.add("active");
    riskModeBtn.classList.remove("active");

    const selectedAssessments = getSelectedAssessmentsFromTable();
    const dataToShow = selectedAssessments.length ? selectedAssessments : [];

    refreshLevelUI(dataToShow);
  });
}

