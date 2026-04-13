// src/js/common/state.js

// ===== 全域狀態 (用 export 導出) =====
// 目前載入的所有 assessments
export let currentAssessments = [];

// 表格分頁
export let currentPage = 1;
export let pageSize = 9;

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

export function setCurrentPage(page) {
  currentPage = page;
}

export function setSelected(next) {
  selected = next;
}

export function setLastRenderedAssessments(next) {
  lastRenderedAssessments = next;
}

export function setLastLevelPersons(next) {
  lastLevelPersons = next;
}

export function setCheckAllAcrossPages(v) {
  checkAllAcrossPages = v;
}

export function setCurrentAssessments(data) {
  currentAssessments = data;
}

