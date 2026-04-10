// src/js/common/modal/detailModal.js
import { t } from "../i18n.js";
import { lastRenderedAssessments, selected, currentLang } from "../state.js";

/**
 * 取得目前表格中選取的檢測資料
 */
function getSelectedAssessments() {
  const selectedIndexes = window.selected || [];
  const list = window.lastRenderedAssessments || [];
  return selectedIndexes.map((i) => list[i]).filter(Boolean);
}

/**
 * 建立功能衰退區塊 (步行速度、起坐秒數)
 */
function buildDegenerateBlock(selected) {
  let totalGaitSpeed = 0;
  let totalChairSecond = 0;
  const gaitNames = [];
  const chairNames = [];

  const formatPerson = (p) => {
    const gender =
      p.Gender === 0 ? t("female") : p.Gender === 1 ? t("male") : t("unknown");
    return `${p.Name || t("unknown")} (${p.Age || t("unknown")}${t("yearsOld")}, ${gender})`;
  };

  selected.forEach((item) => {
    if (!item?.Degenerate) return;

    if (Array.isArray(item.Degenerate.GaitSpeed)) {
      totalGaitSpeed += item.Degenerate.GaitSpeed.length;
      item.Degenerate.GaitSpeed.forEach((p) => gaitNames.push(formatPerson(p)));
    }

    if (Array.isArray(item.Degenerate.ChairSecond)) {
      totalChairSecond += item.Degenerate.ChairSecond.length;
      item.Degenerate.ChairSecond.forEach((p) =>
        chairNames.push(formatPerson(p)),
      );
    }
  });

  const getListHtml = (names) =>
    names.length
      ? names.map((n) => `<li class="list-group-item small">${n}</li>`).join("")
      : `<li class="list-group-item text-muted small">${t("alertNoData")}</li>`;

  return `
    <div class="mb-4">
      <h6 class="fw-bold mb-3"><i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>${t("degenerateWarning")}</h6>
      <div class="row g-2">
        <div class="col-12 col-md-6">
          <div class="card ">
            <div class="card-header py-2 small fw-bold">${t("walkDecline")} (${totalGaitSpeed})</div>
            <ul class="list-group list-group-flush" style="max-height: 200px; overflow-y: auto;">
              ${getListHtml(gaitNames)}
            </ul>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="card ">
            <div class="card-header py-2 small fw-bold">${t("sitStandIncrease")} (${totalChairSecond})</div>
            <ul class="list-group list-group-flush" style="max-height: 200px; overflow-y: auto;">
              ${getListHtml(chairNames)}
            </ul>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * 渲染特定年份的所有等級清單
 */
function renderAllLevels(selected, monthContent) {
  const levels = ["A", "B", "C"];
  const levelTitles = {
    A: t("vivifrailA"),
    B: t("vivifrailB"),
    C: t("vivifrailC"),
  };
  const levelColors = { A: "danger", B: "warning", C: "primary" };

  let html = "";
  levels.forEach((level) => {
    const names = [];
    selected.forEach((item) => {
      if (item?.VIVIFRAIL?.[level]) {
        item.VIVIFRAIL[level].forEach((p) => {
          const gender =
            p.Gender === 0
              ? t("female")
              : p.Gender === 1
                ? t("male")
                : t("unknown");
          names.push(`${p.Name} (${p.Age || "?"}${t("yearsOld")}, ${gender})`);
        });
      }
    });

    html += `
      <div class="col-12 col-md-4 mb-2">
        <div class="card ">
          <div class="card-header py-2 small fw-bold bg-${levelColors[level]} text-white">
            ${levelTitles[level]} (${names.length})
          </div>
          <ul class="list-group list-group-flush small">
            ${names.length ? names.map((n) => `<li class="list-group-item">${n}</li>`).join("") : `<li class="list-group-item text-muted">${t("alertNoData")}</li>`}
          </ul>
        </div>
      </div>`;
  });
  monthContent.innerHTML = `<div class="row g-2">${html}</div>`;
}

/**
 * 渲染按月份分組的詳細內容
 */
function renderMonth(selected, year, month, monthContent) {
  monthContent.innerHTML = "";
  const items = selected.filter((item) => {
    if (!item?.Date) return false;
    const d = new Date(item.Date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  if (!items.length) return;

  const levelColors = { A: "danger", B: "warning", C: "primary" };
  const levelTitles = {
    A: t("vivifrailA"),
    B: t("vivifrailB"),
    C: t("vivifrailC"),
  };

  items.forEach((dateItem) => {
    const dateStr = new Date(dateItem.Date).toLocaleDateString();
    let rowHtml = `<div class="mb-4 p-2 bg-light rounded"><h6 class="fw-bold small mb-2">${dateStr}</h6><div class="row g-2">`;

    ["A", "B", "C"].forEach((level) => {
      const names = (dateItem.VIVIFRAIL?.[level] || []).map((p) => {
        const gender =
          p.Gender === 0
            ? t("male")
            : p.Gender === 1
              ? t("female")
              : t("unknown");
        return `${p.Name} (${p.Age || "?"}${t("yearsOld")}, ${gender})`;
      });

      rowHtml += `
        <div class="col-12 col-md-4">
          <div class="card">
            <div class="card-header py-1 x-small bg-${levelColors[level]} text-white">${levelTitles[level]} (${names.length})</div>
            <ul class="list-group list-group-flush x-small">
              ${names.length ? names.map((n) => `<li class="list-group-item">${n}</li>`).join("") : `<li class="list-group-item text-muted">${t("alertNoData")}</li>`}
            </ul>
          </div>
        </div>`;
    });
    rowHtml += `</div></div>`;
    monthContent.innerHTML += rowHtml;
  });
}

/**
 * 建立月份按鈕
 */
function renderMonthButtons(
  selected,
  year,
  monthButtonsContainer,
  monthContent,
) {
  monthButtonsContainer.innerHTML = "";
  const monthsWithData = new Set();
  selected.forEach((item) => {
    if (item?.Date) {
      const d = new Date(item.Date);
      if (d.getFullYear() === year) monthsWithData.add(d.getMonth() + 1);
    }
  });

  const allBtn = document.createElement("button");
  allBtn.className = "btn btn-outline-secondary btn-sm active";
  allBtn.textContent = t("all");
  allBtn.onclick = () => {
    renderAllLevels(
      selected.filter((i) => new Date(i.Date).getFullYear() === year),
      monthContent,
    );
    monthButtonsContainer
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("active"));
    allBtn.classList.add("active");
  };
  monthButtonsContainer.appendChild(allBtn);

  const monthNamesEN = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let m = 1; m <= 12; m++) {
    const btn = document.createElement("button");
    const hasData = monthsWithData.has(m);
    btn.className = `btn btn-sm ${hasData ? "btn-outline-primary" : "btn-outline-secondary disabled"}`;
    btn.disabled = !hasData;
    btn.textContent =
      window.currentLang === "en" ? monthNamesEN[m - 1] : `${m}${t("month")}`;

    if (hasData) {
      btn.onclick = () => {
        renderMonth(selected, year, m, monthContent);
        monthButtonsContainer
          .querySelectorAll("button")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      };
    }
    monthButtonsContainer.appendChild(btn);
  }
  allBtn.click(); // 預設顯示該年全部
}

/**
 * 初始化彈窗
 */
export function initDetailModal() {
  const viewDetailsBtn = document.getElementById("viewDetailsBtn");
  const modalEl = document.getElementById("detailsModal");
  if (!viewDetailsBtn || !modalEl) return;

  viewDetailsBtn.addEventListener("click", () => {
    renderDetailModalContent();
    // const selectedData = getSelectedAssessments();
    // const modalBody = modalEl.querySelector(".modal-body");
    // if (!modalBody) return;

    // if (!selectedData.length) {
    //   modalBody.innerHTML = `<div class="p-5 text-center text-muted">${t("alertNoData")}</div>`;
    // } else {
    //   modalBody.innerHTML = buildDegenerateBlock(selectedData);
    //   modalBody.innerHTML += `<hr><div class="mb-3 fw-bold"><i class="bi bi-people-fill me-2"></i>${t("highRiskGroup")}</div>`;

    //   const years = [
    //     ...new Set(
    //       selectedData.map((i) =>
    //         i.Date ? new Date(i.Date).getFullYear() : null,
    //       ),
    //     ),
    //   ]
    //     .filter(Boolean)
    //     .sort((a, b) => b - a);

    //   modalBody.innerHTML += `
    //     <div class="d-flex align-items-center gap-2 mb-3">
    //       <select id="yearSelect" class="form-select form-select-sm w-auto">
    //         ${years.map((y) => `<option value="${y}">${y}</option>`).join("")}
    //       </select>
    //       <div id="monthButtons" class="d-flex flex-wrap gap-1"></div>
    //     </div>
    //     <div id="monthContent" class="mt-2"></div>`;

    //   const yearSelect = modalBody.querySelector("#yearSelect");
    //   const monthButtons = modalBody.querySelector("#monthButtons");
    //   const monthContent = modalBody.querySelector("#monthContent");

    //   yearSelect.onchange = (e) =>
    //     renderMonthButtons(
    //       selectedData,
    //       parseInt(e.target.value),
    //       monthButtons,
    //       monthContent,
    //     );
    //   renderMonthButtons(
    //     selectedData,
    //     parseInt(yearSelect.value),
    //     monthButtons,
    //     monthContent,
    //   );
    // }

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  });
}
function renderDetailModalContent() {
  const modalEl = document.getElementById("detailsModal");
  if (!modalEl) return;

  const selectedData = (window.selected || [])
    .map((i) => window.lastRenderedAssessments?.[i])
    .filter(Boolean);

  const modalBody = modalEl.querySelector(".modal-body");
  if (!modalBody) return;

  if (!selectedData.length) {
    modalBody.innerHTML = `<div class="p-5 text-center text-muted">${t("alertNoData")}</div>`;
    return;
  }

  modalBody.innerHTML = buildDegenerateBlock(selectedData);
  modalBody.innerHTML += `<hr><div class="mb-3 fw-bold">
    <i class="bi bi-people-fill me-2"></i>${t("highRiskGroup")}
  </div>`;

  const years = [
    ...new Set(
      selectedData.map((i) => (i.Date ? new Date(i.Date).getFullYear() : null)),
    ),
  ]
    .filter(Boolean)
    .sort((a, b) => b - a);

  modalBody.innerHTML += `
    <div class="d-flex align-items-center gap-2 mb-3">
      <select id="yearSelect" class="form-select form-select-sm w-auto">
        ${years.map((y) => `<option value="${y}">${y}</option>`).join("")}
      </select>
      <div id="monthButtons" class="d-flex flex-wrap gap-1"></div>
    </div>
    <div id="monthContent" class="mt-2"></div>`;

  const yearSelect = modalBody.querySelector("#yearSelect");
  const monthButtons = modalBody.querySelector("#monthButtons");
  const monthContent = modalBody.querySelector("#monthContent");

  yearSelect.onchange = (e) =>
    renderMonthButtons(
      selectedData,
      parseInt(e.target.value),
      monthButtons,
      monthContent,
    );

  renderMonthButtons(
    selectedData,
    parseInt(yearSelect.value),
    monthButtons,
    monthContent,
  );
}

// 掛出去
window.renderDetailModalContent = renderDetailModalContent;
window.initDetailModal = initDetailModal;
window.buildDegenerateBlock = buildDegenerateBlock;
window.renderMonthButtons = renderMonthButtons;
