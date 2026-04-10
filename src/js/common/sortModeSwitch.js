// src/js/common/sortModeSwitch.js
import { lastRenderedAssessments, selected } from "./state.js";

/**
 * 從目前的表格選取狀態中取得資料
 * 在 Vite 模式下，我們直接讀取 window.selected (由 table.js/state.js 維護)
 */
function getSelectedAssessmentsFromTable() {
  const all = window.lastRenderedAssessments || [];
  const selectedIdx = window.selected || [];
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

    // // 如果切換回風險模式需要重刷，可以在這裡呼叫 handleRiskFilter
    // if (typeof window.handleRiskFilter === "function") {
    //   window.handleRiskFilter("all", { scope: document });
    // }
  });

  // 事件監聽：依等級排序 (Vivifrail)
  levelModeBtn.addEventListener("click", () => {
    riskContainer.classList.add("d-none");
    levelContainer.classList.remove("d-none");
    levelModeBtn.classList.add("active");
    riskModeBtn.classList.remove("active");

    const selectedAssessments = getSelectedAssessmentsFromTable();
    const dataToShow = selectedAssessments.length ? selectedAssessments : [];

    // 呼叫 Level 模式的渲染 UI
    if (typeof window.refreshLevelUI === "function") {
      window.refreshLevelUI(dataToShow);
    }
  });
}

// 導出到 window 讓 main.js 能夠執行 init
window.initSortModeSwitch = initSortModeSwitch;
