// src/js/personDetail/table.js

// 💥 引入 t 函式 (假設來自 lang.js)
import { t } from "./lang.js";
import {
  drawSitStandChartChartJS,
  drawBalanceChartChartJS,
  drawGaitChartChartJS,
  drawRiskChartChartJS,
  drawNoDataChart,
} from "./charts.js";
import { calculateTrend } from "./calculateTrend.js";
import { renderTrendSummary } from "./renderTrendSummary.js";

let isRenderingCharts = false;

// ========================
// 資料轉換
// ========================
export function convertToAssessments(datas) {
  if (!datas) return [];

  return datas
    .filter((d) => d && d.Date)
    .map((d) => ({
      Date: d.Date,
      ChairSecond: d.SPPB?.Chairtest?.Second ?? null,
      BalanceScore:
        (d.SPPB?.Balancetest?.balance1?.Score ?? 0) +
        (d.SPPB?.Balancetest?.balance2?.Score ?? 0) +
        (d.SPPB?.Balancetest?.balance3?.Score ?? 0),
      GaitSpeed: d.SPPB?.Gaitspeed?.Speed ?? null,
      RiskRate: d.Risk ?? null,
    }));
}

// ========================
// Chart 清除（統一）
// ========================
export function resetAllCharts() {
  // 💥 修正：相容 Chart.js 不同版本的實例銷毀方式
  if (globalThis.Chart) {
    // 遍歷所有已知的 Chart 實例並銷毀
    const instances = globalThis.Chart.instances || {};
    Object.values(instances).forEach((chart) => {
      try {
        if (chart) chart.destroy();
      } catch (e) {
        console.warn("Chart destroy error:", e);
      }
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

    // 💥 雙重保險：如果個別畫布還有實例，直接透過 canvas 找出來殺掉
    if (globalThis.Chart) {
      const individualChart = globalThis.Chart.getChart(canvas);
      if (individualChart) individualChart.destroy();
    }

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 強制清空緩存，避免「留下一個點」
    canvas.width = canvas.width;
  });
}

// ========================
// Table 渲染
// ========================
export function renderTable(datas) {
  const container = document.getElementById("personTable");
  if (!container) return;

  if (!datas || datas.length === 0) {
    container.innerHTML = `
      <div class="text-muted py-3 text-center">
        ${t("alertNoData")}
      </div>`;
    return;
  }

  let html = `<div class="record-list">`;

  datas.forEach((d, index) => {
    const dateText = d.Date
      ? new Date(d.Date).toLocaleDateString()
      : t("unknown");

    const sitStand =
      d.SPPB?.Chairtest?.Second != null
        ? d.SPPB.Chairtest.Second.toFixed(2) + " " + t("seconds")
        : "-";

    const gait =
      d.SPPB?.Gaitspeed?.Speed != null
        ? d.SPPB.Gaitspeed.Speed.toFixed(2) + " cm/s"
        : "-";

    const b1 = d.SPPB?.Balancetest?.balance1?.Score ?? "-";
    const b2 = d.SPPB?.Balancetest?.balance2?.Score ?? "-";
    const b3 = d.SPPB?.Balancetest?.balance3?.Score ?? "-";

    const riskLabel = d.Risk != null ? getRiskLabel(d.Risk) : "-";
    const riskColor = getRiskColor(d.Risk);

    html += `
      <label class="record-item">
        <input
          type="checkbox"
          class="row-check"
          data-index="${index}"
          checked
        />
        <div class="record-content">
          <div class="record-date">${dateText}</div>
          <div class="record-metrics">
            <span>${t("sitStand")} <b>${sitStand}</b></span>
            <span>${t("gaitSpeed")} <b>${gait}</b></span>
            <span class="risk">${t("fallRisk")} <b style="color: ${riskColor}">${riskLabel}</b></span>
          </div>
          <div class="record-balance">
            <div class="balance-title">${t("balance")}</div>
            <ul class="balance-list">
              <li>${t("balance1")}：<b>${b1}</b></li>
              <li>${t("balance2")}：<b>${b2}</b></li>
              <li>${t("balance3")}：<b>${b3}</b></li>
            </ul>
          </div>
        </div>
      </label>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// ========================
// Checkbox + Chart 邏輯
// ========================
export function setupCheckboxes(datas) {
  const checkAllBtn = document.getElementById("checkAllBtn");
  const uncheckAllBtn = document.getElementById("uncheckAllBtn");
  const hint = document.querySelector(".panel-hint");

  const getRowChecks = () => document.querySelectorAll(".row-check");

  function updateCharts() {
    if (isRenderingCharts) return;
    isRenderingCharts = true;

    try {
      const checks = getRowChecks();
      const selectedIndexes = Array.from(checks)
        .filter((c) => c.checked)
        .map((c) => parseInt(c.dataset.index));

      const selectedDatas = selectedIndexes.map((i) => datas[i]);

      // --- 無資料狀態 ---
      if (selectedDatas.length === 0) {
        resetAllCharts();
        globalThis.removeNoDataOverlay?.();
        drawNoDataChart();
        renderTrendSummary(null);
        updateCompareHint([], []);
        return;
      }

      // --- 有資料狀態 ---
      // 這裡定義的是 allAssessments
      const allAssessments = convertToAssessments(selectedDatas);

      resetAllCharts();
      globalThis.removeNoDataOverlay?.();

      // 💥 修正處：將 assessments 全部改為 allAssessments
      drawSitStandChartChartJS(allAssessments);
      drawBalanceChartChartJS(allAssessments); // 這裡之前報錯
      drawGaitChartChartJS(allAssessments);
      drawRiskChartChartJS(allAssessments);

      const compareDatas = [...selectedDatas]
        .filter((d) => d?.Date)
        .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()) // 建議加上 getTime() 排序較穩定
        .slice(-2); // 取得最後兩筆（最新兩筆）

      if (compareDatas.length < 2) {
        renderTrendSummary(null);
      } else {
        const compareAssessments = convertToAssessments(compareDatas);
        renderTrendSummary(calculateTrend(compareAssessments));
      }

      updateCompareHint(selectedDatas, compareDatas);
    } catch (e) {
      console.error("updateCharts error:", e);
    } finally {
      isRenderingCharts = false;
    }
  }

  function updateCompareHint(selectedDatas, compareDatas) {
    if (!hint) return;
    const hintLang = t("tableHint");
    if (!hintLang) return;

    function format(str, vars) {
      return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
    }

    if (selectedDatas.length === 0) {
      hint.textContent = hintLang.empty;
      return;
    }
    if (selectedDatas.length === 1) {
      hint.textContent = hintLang.single;
      return;
    }

    const dates = compareDatas.map((d) =>
      new Date(d.Date).toLocaleDateString(),
    );
    hint.textContent =
      selectedDatas.length > 2
        ? format(hintLang.multi, {
            count: selectedDatas.length,
            d1: dates[0],
            d2: dates[1],
          })
        : format(hintLang.comparing, { d1: dates[0], d2: dates[1] });
  }

  // 💥 事件綁定 (修正 onclick 改為對容器事件代理，防止動態 HTML 失效)
  const tableContainer = document.getElementById("personTable");
  if (tableContainer) {
    tableContainer.addEventListener("change", (e) => {
      if (e.target.classList.contains("row-check")) updateCharts();
    });
  }

  if (checkAllBtn) {
    checkAllBtn.onclick = () => {
      getRowChecks().forEach((c) => (c.checked = true));
      updateCharts();
    };
  }

  if (uncheckAllBtn) {
    uncheckAllBtn.onclick = () => {
      getRowChecks().forEach((c) => (c.checked = false));
      updateCharts();
    };
  }

  updateCharts();
}

// ========================
// 顏色與標籤輔助
// ========================
export function getRiskColor(risk) {
  if (risk == null) return "inherit";
  if (risk > 50) return "#dc3545";
  if (risk > 30) return "#fd7e14";
  if (risk > 17.5) return "#ffc107";
  if (risk > 5) return "#28a745";
  return "#198754";
}

export function getRiskLabel(risk) {
  const label = t("riskLabel");
  if (typeof label === "string") return label;
  if (risk > 50) return label.high;
  if (risk > 30) return label.slightlyHigh;
  if (risk > 17.5) return label.medium;
  if (risk > 5) return label.slightlyLow;
  return label.low;
}
