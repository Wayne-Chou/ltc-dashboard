// src/js/common/state.js

// ===== 全域狀態 (用 export 導出，不再強迫掛在 window) =====
export let currentLang = "zh";
// 目前載入的所有 assessments
export let currentAssessments = [];

// 表格分頁
export let currentPage = 1;
export const pageSize = 10;

// 表格勾選狀態
export let selected = [];
export let checkAllAcrossPages = true;

// 最近一次 render 的 assessments
export let lastRenderedAssessments = [];

// Level 模式下展平後的人員資料
export let lastLevelPersons = [];

// ===== 群體比對狀態 =====
export const groupCompareState = {
  enabled: false,
  groupA: {
    start: null,
    end: null,
    assessments: [],
  },
  groupB: {
    start: null,
    end: null,
    assessments: [],
  },
};

// ===== 儀表板視圖狀態 =====
export const dashboardState = {
  view: "default", // default | compare
  selectedSites: [],
};

// --- 重要：為了相容還沒改完的舊程式碼 ---
// 在過渡時期，我們手動把這些變數掛回 window，
// 這樣你那些還沒加 import 的舊 js 檔案才不會立刻壞掉。
window.currentAssessments = currentAssessments;
window.lastRenderedAssessments = lastRenderedAssessments;
window.selected = selected;
window.dashboardState = dashboardState;
window.groupCompareState = groupCompareState;
