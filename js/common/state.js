// js/common/state.js

// ===== 全域狀態 =====

// 目前載入的所有 assessments（依地區 / 日期）
window.currentAssessments = [];

// 表格分頁
window.currentPage = 1;
window.pageSize = 10;

// 表格勾選狀態（跨頁）
window.selected = [];
window.checkAllAcrossPages = true;

// 最近一次 render 的 assessments（用於 checkbox / modal）
window.lastRenderedAssessments = [];

// Level 模式下展平後的人員資料
window.lastLevelPersons = [];

// ===== 群體比對狀態（A vs B）=====
window.groupCompareState = {
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
