// src/js/common/groupCompare.js
import { t } from "./lang.js";
import { currentLang, currentAssessments, groupCompareState } from "./state.js";

/**
 * 依日期區間過濾資料
 */
export function getAssessmentsByRange(start, end) {
  const source = window.currentAssessments || [];
  if (!start || !end) return [];
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(23, 59, 59, 999);

  return source.filter((item) => {
    const d = new Date(item.Date).getTime();
    return d >= s && d <= e;
  });
}

/**
 * 計算群體摘要邏輯
 */
export function calcGroupSummary(assessments = []) {
  const totalVisits = assessments.reduce(
    (sum, item) => sum + (item.Count || 0),
    0,
  );

  const allNames = new Set();
  assessments.forEach((item) => {
    if (item.VIVIFRAIL) {
      Object.values(item.VIVIFRAIL).forEach((group) => {
        group.forEach((p) => {
          if (p?.Name) allNames.add(p.Name);
        });
      });
    }
  });

  const avg = (arr) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const chairArr = assessments
    .map((x) => Number(x.ChairSecond))
    .filter((x) => !isNaN(x));
  const balanceArr = assessments
    .map((x) => Number(x.BalanceScore))
    .filter((x) => !isNaN(x));
  const gaitArr = assessments
    .map((x) => Number(x.GaitSpeed))
    .filter((x) => !isNaN(x));
  const riskArr = assessments
    .map((x) => Number(x.RiskRate))
    .filter((x) => !isNaN(x));

  return {
    uniquePeople: allNames.size,
    totalVisits,
    avgChair: avg(chairArr),
    avgBalance: avg(balanceArr),
    avgGait: avg(gaitArr),
    avgRisk: avg(riskArr),
  };
}

function diffPercent(a, b) {
  if (!a) return 0;
  return (((b - a) / a) * 100).toFixed(1);
}

/**
 * 核心渲染邏輯：根據狀態顯示 placeholder 或結果表格
 */
export function renderGroupCompare() {
  const st = window.groupCompareState;
  const container = document.getElementById("groupCompareResult");
  if (!container) return;

  // 1. 未啟用模式
  if (!st?.enabled) {
    container.innerHTML = `
      <div class="compare-placeholder p-5 text-center border rounded bg-light">
        <div class="h2 text-secondary mb-3"><i class="bi bi-power"></i></div>
        <h6 class="fw-bold">${t("notEnabledTitle")}</h6>
        <p class="text-muted small">${t("notEnabledDesc")}</p>
      </div>`;
    return;
  }

  const hasA = st.groupA.start && st.groupA.end;
  const hasB = st.groupB.start && st.groupB.end;

  // 2. 等待選取日期
  if (!hasA || !hasB) {
    container.innerHTML = `
      <div class="compare-placeholder p-5 text-center border border-primary border-dashed rounded bg-white">
        <div class="h2 text-primary mb-3"><i class="bi bi-cursor-fill"></i></div>
        <h6 class="fw-bold text-primary">${t("waitingDateTitle")}</h6>
        <p class="text-muted small">${t("waitingDateDesc")}</p>
      </div>`;
    return;
  }

  // 3. 邏輯錯誤：第二區間早於第一區間
  if (new Date(st.groupA.end) > new Date(st.groupB.start)) {
    container.innerHTML = `
      <div class="compare-placeholder p-5 text-center border border-danger rounded bg-light-danger">
        <div class="h2 text-danger mb-3"><i class="bi bi-calendar-x"></i></div>
        <h6 class="fw-bold text-danger">${t("dateOrderErrorTitle")}</h6>
        <p class="text-muted small">${t("dateOrderErrorDesc")}</p>
      </div>`;
    return;
  }

  const a = st.groupA.assessments || [];
  const b = st.groupB.assessments || [];

  // 4. 查無資料
  if (!a.length || !b.length) {
    const missingTerm = !a.length ? t("baseline") : t("comparison");
    container.innerHTML = `
      <div class="compare-placeholder p-5 text-center border border-warning rounded bg-light-warning">
        <div class="h2 text-warning mb-3"><i class="bi bi-database-exclamation"></i></div>
        <h6 class="fw-bold">${t("noDataTitle")}</h6>
        <p class="text-muted small">${t("noDataDesc").replace("{missing}", missingTerm)}</p>
      </div>`;
    return;
  }

  renderGroupCompareResultTable(calcGroupSummary(a), calcGroupSummary(b));
}

function renderGroupCompareResultTable(summaryA, summaryB) {
  const container = document.getElementById("groupCompareResult");
  const riskDiff = Number(diffPercent(summaryA.avgRisk, summaryB.avgRisk));

  const row = (label, a, b, unit = "", better = "higher") => {
    const diff = Number(diffPercent(a, b));
    let cls = "text-muted",
      icon = "—";
    if (diff > 0) {
      cls = better === "higher" ? "text-success" : "text-danger";
      icon = better === "higher" ? "▲" : "▼";
    } else if (diff < 0) {
      cls = better === "higher" ? "text-danger" : "text-success";
      icon = better === "higher" ? "▼" : "▲";
    }
    return `
      <tr>
        <td class="py-3 fw-bold text-secondary">${label}</td>
        <td>${a.toFixed(1)}${unit}</td>
        <td>${b.toFixed(1)}${unit}</td>
        <td class="fw-bold ${cls}">${icon} ${Math.abs(diff)}%</td>
      </tr>`;
  };

  container.innerHTML = `
    <div class="row g-2 mb-4">
      <div class="col-md-6">
        <div class="p-3 border rounded bg-light">
          <small class="text-muted">${t("baseline")}：${summaryA.uniquePeople} ${t("people")}</small>
          <div class="h5 fw-bold mb-0">${t("avgFallRisk")}：${summaryA.avgRisk.toFixed(1)}%</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="p-3 border rounded ${riskDiff <= 0 ? "border-success" : "border-danger"} bg-white">
          <small class="text-muted">${t("comparison")}：${summaryB.uniquePeople} ${t("people")}</small>
          <div class="h5 fw-bold mb-0 ${riskDiff <= 0 ? "text-success" : "text-danger"}">
            ${riskDiff <= 0 ? t("riskImproved") : t("riskIncreased")} ${Math.abs(riskDiff)}%
          </div>
        </div>
      </div>
    </div>
    <div class="table-responsive border rounded">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr><th>${t("metric")}</th><th>${t("baseline")}</th><th>${t("comparison")}</th><th>${t("change")}</th></tr>
        </thead>
        <tbody>
          ${row(t("avgSitStand"), summaryA.avgChair, summaryB.avgChair, " " + t("seconds"), "lower")}
          ${row(t("avgBalanceScore"), summaryA.avgBalance, summaryB.avgBalance, " " + t("points"), "higher")}
          ${row(t("avgGaitSpeed"), summaryA.avgGait, summaryB.avgGait, " cm/s", "higher")}
          ${row(t("avgFallRisk"), summaryA.avgRisk, summaryB.avgRisk, " %", "lower")}
        </tbody>
      </table>
    </div>`;
}

/**
 * 初始化 Flatpickr 與事件
 */
export function initGroupCompare() {
  const toggle = document.getElementById("groupCompareToggle");
  const inputA = document.getElementById("groupA-range");
  const inputB = document.getElementById("groupB-range");

  if (!toggle || !inputA || !inputB || typeof flatpickr === "undefined") return;

  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    window.groupCompareState.enabled = enabled;
    inputA.disabled = !enabled;
    inputB.disabled = !enabled;

    if (!enabled) {
      if (window.fpGroupA) window.fpGroupA.clear();
      if (window.fpGroupB) window.fpGroupB.clear();
      window.groupCompareState.groupA = {
        start: null,
        end: null,
        assessments: [],
      };
      window.groupCompareState.groupB = {
        start: null,
        end: null,
        assessments: [],
      };
    }
    renderGroupCompare();
  });

  const fpConfig = {
    mode: "range",
    dateFormat: "Y-m-d",
    onChange: (dates, str, instance) => {
      const [start, end] = dates;
      const isA = instance.element.id === "groupA-range";
      if (start && end) {
        const data = {
          start,
          end,
          assessments: getAssessmentsByRange(start, end),
        };
        if (isA) window.groupCompareState.groupA = data;
        else window.groupCompareState.groupB = data;
        renderGroupCompare();
      }
    },
  };

  window.fpGroupA = flatpickr(inputA, fpConfig);
  window.fpGroupB = flatpickr(inputB, fpConfig);

  renderGroupCompare();
}

window.initGroupCompare = initGroupCompare;
