// src/js/personDetail/personData.js
/** 詳情頁篩選後的 assessments（供 headline / trend 等讀取） */
let filteredAssessments = [];

export function setPersonFilteredAssessments(list) {
  filteredAssessments = Array.isArray(list) ? list : [];
}

export function getPersonFilteredAssessments() {
  return filteredAssessments;
}
