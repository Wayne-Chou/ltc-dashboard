// src/js/common/modal/viewAllModal.js
import { t } from "../locale.js";
import { lastRenderedAssessments, selected } from "../state.js";
import { flattenData, mergeAllVIVIFRAIL, getRiskCategory } from "../utils.js";
import { renderCards } from "../personCardRisk.js";

/**
 * 安全取得目前勾選的檢測資料
 */
function getSelectedAssessmentsSafe() {
  const list = lastRenderedAssessments || [];
  const selectedIdx = selected || [];
  return list.filter((_, i) => selectedIdx.includes(i));
}

/**
 * 開啟參與者彈窗
 */
function openParticipantsModal() {
  const modalEl = document.getElementById("participantsModal");
  if (!modalEl) return;

  // 使用 Bootstrap 的靜態方法獲取或建立實例，避免重複建立導致的 Backdrop Bug
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

/**
 * 渲染彈窗內的人員卡片
 */
function renderAllInModal(filterRisk = null) {
  const modalPersonContainer = document.getElementById("modalPersonContainer");
  if (!modalPersonContainer) return;

  const selectedAssessments = getSelectedAssessmentsSafe();

  // ✅ 只做資料整理，不做 filter
  const allParticipants = flattenData(mergeAllVIVIFRAIL(selectedAssessments));

  renderCards(allParticipants, filterRisk, {
    container: modalPersonContainer,
    isModal: true,
    scope: document.getElementById("participantsModal"),
  });
}

/**
 * 綁定主畫面的「查看全部」按鈕
 */
function bindMainViewAllBtn() {
  const viewAllBtn = document.getElementById("viewAllBtn");
  if (!viewAllBtn) return;

  viewAllBtn.addEventListener("click", () => {
    renderAllInModal(null);
    openParticipantsModal();
  });
}

/**
 * 綁定彈窗內的桌機版風險過濾按鈕
 */
function bindModalDesktopRiskButtons() {
  const btns = document.querySelectorAll("#modalFilterBtnsDesktop button");
  if (!btns.length) return;

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const risk = btn.dataset.risk;
      renderAllInModal(risk);

      // 切換 active 樣式
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

/**
 * 綁定彈窗內的手機版下拉選單
 */
function bindModalMobileRiskDropdown() {
  const items = document.querySelectorAll(
    "#modalFilterDropdownMobile .dropdown-item",
  );
  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const risk = item.dataset.risk;
      renderAllInModal(risk);

      const dropdownBtn = document.querySelector(
        "#modalFilterDropdownMobileBtn",
      );
      if (dropdownBtn) {
        // 移除括號數字，只顯示純文字
        const baseText = item.textContent.replace(/\s*\(\d+\)\s*$/, "").trim();
        dropdownBtn.textContent = baseText;
      }
    });
  });
}

/**
 * 初始化 ViewAllModal 模組
 */
export function initViewAllModal() {
  bindMainViewAllBtn();
  bindModalDesktopRiskButtons();
  bindModalMobileRiskDropdown();
}

