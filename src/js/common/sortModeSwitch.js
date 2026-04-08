// js/common/sortModeSwitch.js
// 依賴：personCardLevel.js 內的 refreshLevelUI（如果你有 export 到 window）
// 依賴：state.js / table.js 會更新 window.lastRenderedAssessments / window.selected

(function () {
  function getSelectedAssessmentsFromTable() {
    const all = window.lastRenderedAssessments || [];
    const selected = window.selected || [];
    return all.filter((_, i) => selected.includes(i));
  }

  function initSortModeSwitch() {
    const riskModeBtn = document.getElementById("riskModeBtn");
    const levelModeBtn = document.getElementById("levelModeBtn");
    const riskContainer = document.getElementById("riskContainer");
    const levelContainer = document.getElementById("levelContainer");

    if (!riskModeBtn || !levelModeBtn || !riskContainer || !levelContainer) {
      return;
    }

    // 預設：顯示 risk
    riskContainer.classList.remove("d-none");
    levelContainer.classList.add("d-none");
    riskModeBtn.classList.add("active");
    levelModeBtn.classList.remove("active");

    // 依風險排序
    riskModeBtn.addEventListener("click", () => {
      riskContainer.classList.remove("d-none");
      levelContainer.classList.add("d-none");
      riskModeBtn.classList.add("active");
      levelModeBtn.classList.remove("active");
    });

    // 依等級排序
    levelModeBtn.addEventListener("click", () => {
      riskContainer.classList.add("d-none");
      levelContainer.classList.remove("d-none");
      levelModeBtn.classList.add("active");
      riskModeBtn.classList.remove("active");

      const selectedAssessments = getSelectedAssessmentsFromTable();
      const dataToShow = selectedAssessments.length ? selectedAssessments : [];

      window.refreshLevelUI?.(dataToShow);
    });
  }

  window.initSortModeSwitch = initSortModeSwitch;
})();
