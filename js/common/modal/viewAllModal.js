// js/common/modal/viewAllModal.js
// 依賴：state.js（getSelectedAssessments / currentAssessments / selected）
// 依賴：personCardRisk.js（renderCards, flattenData, mergeAllVIVIFRAIL, getRiskCategory）
// 依賴：lang.js（t）
// 依賴：bootstrap（bootstrap.Modal）

(function () {
  function getSelectedAssessmentsSafe() {
    const assessments = window.currentAssessments || [];
    const selected = window.selected || [];
    return assessments.filter((_, i) => selected.includes(i));
  }

  function openParticipantsModal() {
    const modalEl = document.getElementById("participantsModal");
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  function renderAllInModal(filterRisk = null) {
    const modalPersonContainer = document.getElementById(
      "modalPersonContainer"
    );
    if (!modalPersonContainer) return;

    const selectedAssessments = getSelectedAssessmentsSafe();

    const allParticipants = flattenData(mergeAllVIVIFRAIL(selectedAssessments));

    const filtered =
      filterRisk && filterRisk !== "all"
        ? allParticipants.filter((p) => getRiskCategory(p.Risk) === filterRisk)
        : allParticipants;

    renderCards(filtered, filterRisk, {
      container: modalPersonContainer,
      isModal: true, // 取消 12 張限制
    });
  }

  function bindMainViewAllBtn() {
    const viewAllBtn = document.getElementById("viewAllBtn");
    if (!viewAllBtn) return;

    viewAllBtn.addEventListener("click", () => {
      renderAllInModal(null);
      openParticipantsModal();
    });
  }

  function bindModalDesktopRiskButtons() {
    const btns = document.querySelectorAll("#modalFilterBtnsDesktop button");
    if (!btns.length) return;

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const risk = btn.dataset.risk; // all/high/...
        renderAllInModal(risk);

        // active 樣式
        btns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }

  function bindModalMobileRiskDropdown() {
    const items = document.querySelectorAll(
      "#modalFilterDropdownMobile .dropdown-item"
    );
    if (!items.length) return;

    items.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const risk = item.dataset.risk;
        renderAllInModal(risk);

        //（可選）如果你 modal 裡有顯示 dropdown 的按鈕文字，想同步可在這裡做
        const dropdownBtn = document.querySelector(
          "#modalFilterDropdownMobileBtn"
        );
        if (dropdownBtn) dropdownBtn.textContent = item.textContent.trim();
      });
    });
  }

  function initViewAllModal() {
    bindMainViewAllBtn();
    bindModalDesktopRiskButtons();
    bindModalMobileRiskDropdown();
  }

  // export
  window.initViewAllModal = initViewAllModal;
})();
