// src/js/common/table.js
import { t } from "./i18n.js";
import {
  currentPage,
  pageSize,
  selected,
  lastRenderedAssessments,
  checkAllAcrossPages,
} from "./state.js";
import { mergeAllVIVIFRAIL, flattenData } from "./utils.js";

// 輔助函數：因為 state.js 匯出的是值，直接修改 currentPage 會報錯
// 我們需要透過 window 修改，或在 state.js 提供 setter
const setState = (key, value) => {
  window[key] = value;
};

/**
 * 初始化表格參數
 */
export function initTable(assessments) {
  setState("currentPage", 1);
  setState("pageSize", 9);

  if (!Array.isArray(window.selected)) setState("selected", []);

  if (assessments && assessments.length > 0) {
    setState(
      "selected",
      assessments.map((_, i) => i),
    );
    setState("checkAllAcrossPages", true);
  }

  initCheckAllButtons();
}

/**
 * 核心渲染函數 (卡片式)
 */
export function renderAssessmentTable(assessments) {
  setState("lastRenderedAssessments", assessments);

  // 初始勾選邏輯
  if (
    assessments &&
    assessments.length > 0 &&
    window.selected.length === 0 &&
    !window.hasInitSelected
  ) {
    setState(
      "selected",
      assessments.map((_, i) => i),
    );
    setState("checkAllAcrossPages", true);
    window.hasInitSelected = true;
  }

  const container = document.getElementById("assessmentCardsContainer");
  const pagination = document.getElementById("tablePaginationContainer");
  if (!container || !pagination) return;

  container.innerHTML = "";
  pagination.innerHTML = "";

  if (!assessments.length) {
    container.innerHTML = `<div class="col-12 text-center py-5 text-muted">${t("noRecord")}</div>`;
    return;
  }

  // 排序與分頁邏輯
  const sorted = [...assessments].sort((a, b) => b.Date - a.Date);
  const totalPages = Math.ceil(sorted.length / window.pageSize);

  if (window.currentPage > totalPages) setState("currentPage", totalPages);
  if (window.currentPage < 1) setState("currentPage", 1);

  const start = (window.currentPage - 1) * window.pageSize;
  const pageData = sorted.slice(start, start + window.pageSize);

  pageData.forEach((item) => {
    const globalIndex = assessments.indexOf(item);
    const isSelected = window.selected.includes(globalIndex);

    const participantText = t("participantCount").replace(
      "{count}",
      item.Count,
    );
    const date = new Date(item.Date);
    const dateText = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

    const cardCol = document.createElement("div");
    cardCol.className = "col-12 col-md-6 col-lg-4 mb-3";
    cardCol.innerHTML = `
      <div class="card h-100 selectable-card ${isSelected ? "border-primary shadow bg-light" : "border-light shadow-sm"}"
            data-index="${globalIndex}" style="cursor:pointer; border-width:2px; transition:all 0.2s ease;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center">
              <div class="status-indicator me-2 ${isSelected ? "bg-primary" : "bg-secondary opacity-25"}" style="width:12px;height:12px;border-radius:50%;"></div>
              <span class="fw-bold text-dark">${dateText}</span>
            </div>
            <span class="badge bg-white text-primary border border-primary-subtle">${participantText}</span>
          </div>
          <div class="row g-2 mb-3">
            <div class="col-12"><div class="p-2 rounded bg-white border text-center"><small class="text-muted d-block">${t("avgSitStand")}</small><span class="fw-bold text-dark d-block">${item.ChairSecond.toFixed(1)}${t("seconds")}</span></div></div>
            <div class="col-12"><div class="p-2 rounded bg-white border text-center"><small class="text-muted d-block">${t("avgBalanceScore")}</small><span class="fw-bold text-dark d-block">${item.BalanceScore.toFixed(1)}${t("points")}</span></div></div>
            <div class="col-12"><div class="p-2 rounded bg-white border text-center"><small class="text-muted d-block">${t("avgGaitSpeed")}</small><span class="fw-bold text-dark d-block">${item.GaitSpeed.toFixed(0)} cm/s</span></div></div>
          </div>
          <div class="mt-2">
            <div class="d-flex justify-content-between mb-1 small">
              <span class="text-muted fw-bold">${t("avgFallRisk")}</span>
              <span class="fw-bold ${item.RiskRate > 20 ? "text-danger" : "text-success"}">${item.RiskRate.toFixed(1)}%</span>
            </div>
            <div class="progress" style="height:8px; background-color:#e9ecef;">
              <div class="progress-bar ${item.RiskRate > 20 ? "bg-danger" : "bg-primary"}" style="width:${item.RiskRate}%"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    cardCol
      .querySelector(".selectable-card")
      .addEventListener("click", () =>
        toggleSelection(globalIndex, assessments),
      );
    container.appendChild(cardCol);
  });

  renderPagination(totalPages, assessments);
  syncUIBySelection(assessments);
}

/**
 * 處理選取切換
 */
export function toggleSelection(idx, assessments) {
  let newSelected = [...window.selected];
  if (newSelected.includes(idx)) {
    newSelected = newSelected.filter((i) => i !== idx);
  } else {
    newSelected.push(idx);
  }
  setState("selected", newSelected);
  setState("checkAllAcrossPages", newSelected.length === assessments.length);
  renderAssessmentTable(assessments);
}

/**
 * 分頁渲染
 */
export function renderPagination(totalPages, assessments) {
  const pagination = document.getElementById("tablePaginationContainer");
  if (!pagination || totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.className = "btn btn-sm btn-outline-primary px-3";
  prev.textContent = t("prevPage");
  prev.disabled = window.currentPage === 1;
  prev.onclick = (e) => {
    e.stopPropagation();
    setState("currentPage", window.currentPage - 1);
    renderAssessmentTable(assessments);
  };

  const info = document.createElement("span");
  info.className = "small text-muted fw-bold";
  info.textContent = `${t("page")} ${window.currentPage} ${t("total")} ${totalPages} ${window.currentLang === "zh" ? "頁" : ""}`;

  const next = document.createElement("button");
  next.className = "btn btn-sm btn-outline-primary px-3";
  next.textContent = t("nextPage");
  next.disabled = window.currentPage === totalPages;
  next.onclick = (e) => {
    e.stopPropagation();
    setState("currentPage", window.currentPage + 1);
    renderAssessmentTable(assessments);
  };

  pagination.append(prev, info, next);
}

/**
 * 全選按鈕初始化
 */
export function initCheckAllButtons() {
  const btnAll = document.getElementById("checkAllBtn");
  const btnNone = document.getElementById("uncheckAllBtn");

  if (btnAll) {
    btnAll.onclick = () => {
      const list = window.lastRenderedAssessments || [];
      setState(
        "selected",
        list.map((_, i) => i),
      );
      renderAssessmentTable(list);
    };
  }

  if (btnNone) {
    btnNone.onclick = () => {
      const list = window.lastRenderedAssessments || [];
      setState("selected", []);
      window.hasInitSelected = true;
      renderAssessmentTable(list);
    };
  }
}

/**
 * 同步連動圖表與數據
 */
export function syncUIBySelection(assessments) {
  const selectedAssessments = assessments.filter((_, i) =>
    window.selected.includes(i),
  );

  // 呼叫其他模組函數 (透過 window)
  if (typeof window.updateRiskButtonsCounts === "function")
    window.updateRiskButtonsCounts(selectedAssessments);
  if (typeof window.renderRisk === "function")
    window.renderRisk(selectedAssessments);
  if (typeof window.updateDegenerateAndLevels === "function")
    window.updateDegenerateAndLevels(selectedAssessments);
  if (typeof window.updateLatestCountDate === "function")
    window.updateLatestCountDate(selectedAssessments);
  if (typeof window.updateTotalCountAndStartDate === "function")
    window.updateTotalCountAndStartDate(selectedAssessments);

  if (typeof window.renderCards === "function") {
    if (!selectedAssessments.length) {
      window.renderCards([], "all");
    } else {
      const mergedV = mergeAllVIVIFRAIL(selectedAssessments);
      window.renderCards(flattenData(mergedV));
    }
  }

  if (!selectedAssessments.length) {
    if (Chart.instances) {
      Object.values(Chart.instances).forEach((chart) => {
        try {
          chart.destroy();
        } catch (e) {}
      });
    }

    [
      "balanceChartCanvas",
      "gaitChartCanvas",
      "riskChartCanvas",
      "sitStandChartCanvas",
    ].forEach((id) => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    window.removeNoDataOverlay?.();
    window.drawNoDataChart?.();
  } else {
    if (typeof window.drawSitStandChartChartJS === "function") {
      window.removeNoDataOverlay?.();

      window.drawSitStandChartChartJS(selectedAssessments);
      window.drawBalanceChartChartJS(selectedAssessments);
      window.drawGaitChartChartJS(selectedAssessments);
      window.drawRiskChartChartJS(selectedAssessments);
    }
  }
}

// 導出至 window 以相容 HTML 或舊 JS
window.initTable = initTable;
window.renderAssessmentTable = renderAssessmentTable;
