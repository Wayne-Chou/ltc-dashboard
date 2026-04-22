// src/js/common/personCardRisk.js
import { t } from "./locale.js";
import {
  maskName,
  getRiskCategory,
  flattenData,
  mergeAllVIVIFRAIL,
} from "./utils.js";
import { lastRenderedAssessments, selected } from "./state.js";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
};

/**
 * 建立風險人員卡 (SVG 表情圖)
 */
export function createPersonCard(person, isAll = false, filterRisk = null) {
  const genderText = person.Gender === 0 ? t("female") : t("male");
  const riskCategory = getRiskCategory(person.Risk);

  const riskStyles = {
    high: { face: "#ff5757", border: "#dc3545", label: t("riskLabel").high },
    slightlyHigh: {
      face: "#ffa203",
      border: "#fd7e14",
      label: t("riskLabel").slightlyHigh,
    },
    medium: {
      face: "#ffd039",
      border: "#ffc107",
      label: t("riskLabel").medium,
    },
    slightlyLow: {
      face: "#8cff00",
      border: "#28a745",
      label: t("riskLabel").slightlyLow,
    },
    low: { face: "#4ffa00", border: "#198754", label: t("riskLabel").low },
  };

  const style = riskStyles[riskCategory] || riskStyles.medium;

  // ALL 模式統計 HTML
  let riskCountsHTML = "";
  if (isAll) {
    const riskLabels = ["high", "slightlyHigh", "medium", "slightlyLow", "low"];
    riskCountsHTML = `
      <div class="px-2 py-2 mb-2" style="background:#f8f9fa;border-radius:6px;">
        ${riskLabels
          .map(
            (key) => `
          <div class="d-flex justify-content-between align-items-center mb-1">
            <div class="d-flex align-items-center">
              <span style="width:12px;height:12px;background:${riskStyles[key].border};display:inline-block;border-radius:50%;margin-right:6px;"></span>
              <span class="small text-dark">${riskStyles[key].label}</span>
            </div>
            <span class="small fw-semibold text-dark">${person.riskCounts?.[key] || 0}</span>
          </div>`,
          )
          .join("")}
      </div>`;
  }

  // 表情 SVG
  let faceHTML = "";
  if (!isAll) {
    let mouthPath = "M40 65 Q50 55 60 65"; // 難過
    if (riskCategory === "low")
      mouthPath = "M40 65 Q50 75 60 65"; // 開心
    else if (riskCategory === "slightlyLow") mouthPath = "M40 65 L60 65"; // 平直

    faceHTML = `
      <svg class="w-100" height="130" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="${style.face}" />
        <circle cx="40" cy="45" r="5" fill="#4B5563" />
        <circle cx="60" cy="45" r="5" fill="#4B5563" />
        <path d="${mouthPath}" fill="none" stroke="#4B5563" stroke-width="3" stroke-linecap="round"/>
      </svg>`;
  }

  return `
    <div class="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
      <div class="person-card bg-white rounded shadow-sm h-100" style="border:3px solid ${isAll ? "#000" : style.border};" data-number="${person.Number}">
        <div class="${isAll ? "d-flex flex-column" : "position-relative"}">
          ${!isAll ? `<div class="position-absolute top-0 end-0 text-white small px-2 py-1 rounded-start" style="background-color:${style.border};">${style.label}</div>` : ""}
          ${faceHTML}
          ${isAll ? riskCountsHTML : ""}
        </div>
        <div class="p-2 text-center">
          <h4 class="fw-semibold text-dark mb-1 masked-name">${maskName(person.Name)}</h4>
          <p class="small text-muted mb-0">${person.Age}${t("yearsOld")} | ${genderText}</p>
          ${person.Date ? `<p class="small text-muted mb-0">鑑測日期：${formatDate(person.Date)}</p>` : ""}
        </div>
      </div>
    </div>`;
}

/**
 * 更新過濾按鈕上的數字括號
 */
export function updateRiskButtonsCounts(allPersons = [], scope = document) {
  const counts = {
    all: allPersons.length,
    high: 0,
    slightlyHigh: 0,
    medium: 0,
    slightlyLow: 0,
    low: 0,
  };
  (allPersons || []).forEach((p) => {
    const cat = getRiskCategory(p.Risk);
    if (counts[cat] !== undefined) counts[cat]++;
  });

  const setTextWithCount = (el, key) => {
    const originalText =
      el.getAttribute("data-original-text") ||
      el.textContent.replace(/\s*\(\d+\)\s*$/, "").trim();
    if (!el.getAttribute("data-original-text"))
      el.setAttribute("data-original-text", originalText);
    el.textContent = `${originalText} (${counts[key] || 0})`;
  };

  if (scope === document) {
    document
      .querySelectorAll(".risk .filterBtnsDesktop button")
      .forEach((btn) => setTextWithCount(btn, btn.dataset.risk));
    document
      .querySelectorAll(".risk .filterDropdownMobile .dropdown-item")
      .forEach((item) => setTextWithCount(item, item.dataset.risk));
  } else {
    scope
      .querySelectorAll("#modalFilterBtnsDesktop button")
      .forEach((btn) => setTextWithCount(btn, btn.dataset.risk));
    scope
      .querySelectorAll("#modalFilterDropdownMobile .dropdown-item")
      .forEach((item) => setTextWithCount(item, item.dataset.risk));
  }
}

/**
 * 綁定點擊跳轉詳情頁
 */
function bindPersonCardClick() {
  document.querySelectorAll(".person-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.number;
      const regionId =
        new URLSearchParams(globalThis.location.search).get("region") || "0";
      const returnUrl = encodeURIComponent(
        globalThis.location.pathname + globalThis.location.search,
      );
      globalThis.location.href = `personDetail.html?id=${encodeURIComponent(id)}&region=${regionId}&returnUrl=${returnUrl}`;
    });
  });
}

/**
 * 渲染卡片核心邏輯
 */
export function renderRiskCards(
  filterRisk = null,
  options = {},
  personsData = [],
) {
  const container =
    options.container || document.getElementById("personContainer");
  const isModal = options.isModal || false;
  const scope = options.scope || document;

  if (!container) return;
  container.innerHTML = "";

  const allPersons = Array.isArray(personsData) ? [...personsData] : [];
  let filteredPersons = allPersons;

  if (filterRisk && filterRisk !== "all") {
    filteredPersons = filteredPersons.filter(
      (p) => getRiskCategory(p.Risk) === filterRisk,
    );
  }

  if (!filteredPersons.length) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-secondary text-center">${t("noMatchedPerson")}</div></div>`;
    updateRiskButtonsCounts(allPersons, scope);
    if (!options.isModal) {
      const btns = document.querySelectorAll(".risk .filterBtnsDesktop button");
      btns.forEach((btn) => {
        btn.classList.toggle(
          "active",
          btn.dataset.risk === (filterRisk || "all"),
        );
      });
    }
    return;
  }

  // 合併重複的人名資料
  const mergedMap = {};
  filteredPersons.forEach((p) => {
    if (!mergedMap[p.Name]) {
      mergedMap[p.Name] = {
        latest: p,
        mergedCount: 0,
        riskCounts: {
          high: 0,
          slightlyHigh: 0,
          medium: 0,
          slightlyLow: 0,
          low: 0,
        },
      };
    }
    const cat = getRiskCategory(p.Risk);
    mergedMap[p.Name].mergedCount++;
    mergedMap[p.Name].riskCounts[cat] =
      (mergedMap[p.Name].riskCounts[cat] || 0) + 1;
    if (
      !mergedMap[p.Name].latest.Date ||
      p.Date > mergedMap[p.Name].latest.Date
    )
      mergedMap[p.Name].latest = p;
  });

  const mergedPersons = Object.values(mergedMap).map((v) => ({
    ...v.latest,
    mergedCount: v.mergedCount,
    riskCounts: v.riskCounts,
  }));
  const isAllMode = !filterRisk || filterRisk === "all";

  // 統計文字區塊
  container.innerHTML = `<div class="col-12 mb-2"><div class="alert alert-info small py-2 px-3 mb-2">
    ${
      isAllMode
        ? t("levelOverviewText")
            .replace("{people}", mergedPersons.length)
            .replace("{records}", filteredPersons.length)
        : t("levelSingleText")
            .replace("{levelName}", t("riskLabel")[filterRisk] || filterRisk)
            .replace("{people}", mergedPersons.length)
            .replace("{records}", filteredPersons.length)
    }
  </div></div>`;

  let renderPersons = isModal ? mergedPersons : mergedPersons.slice(0, 12);
  container.innerHTML += renderPersons
    .map((p) => createPersonCard(p, isAllMode, filterRisk))
    .join("");

  bindPersonCardClick();
  updateRiskButtonsCounts(allPersons, scope);
  // ✅ 同步 active（主畫面）
  if (!options.isModal) {
    const btns = document.querySelectorAll(".risk .filterBtnsDesktop button");

    btns.forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.dataset.risk === (filterRisk || "all"),
      );
    });
  }
}

/**
 * 從目前選擇的數據攤平 Risk Data
 */
function flattenRiskDataFromSelection() {
  const assessments = lastRenderedAssessments || [];
  const selectedIdx = selected || [];
  const selectedAssessments =
    selectedIdx.length > 0
      ? assessments.filter((_, i) => selectedIdx.includes(i))
      : [];
  const merged = mergeAllVIVIFRAIL(selectedAssessments);
  return flattenData(merged);
}

/**
 * Filter 處理
 */
export function handleRiskFilter(filterRisk, options = {}) {
  const personsData = flattenRiskDataFromSelection();
  renderRiskCards(filterRisk, options, personsData);
}

/**
 * 初始化 Risk 相關功能
 */
export function initPersonCardRisk() {
  // ===== 桌機按鈕 =====
  document
    .querySelectorAll(".risk .filterBtnsDesktop button")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        handleRiskFilter(btn.dataset.risk, { scope: document }),
      );
    });

  // ===== 主畫面手機 dropdown =====
  document
    .querySelectorAll(".risk .filterDropdownMobile .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        const filter = item.dataset.risk;

        const dropdownBtn = document.querySelector(
          ".risk .filterDropdownMobile .dropdown-toggle",
        );

        if (dropdownBtn) {
          const baseText = item.getAttribute("data-original-text");
          dropdownBtn.textContent = baseText;
        }

        item.closest(".dropdown-menu")?.previousElementSibling?.click();

        handleRiskFilter(filter, { scope: document });
      });
    });

  // ===== Modal 手機 dropdown =====
  document
    .querySelectorAll("#modalFilterDropdownMobile .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        const filter = item.dataset.risk;
        const modal = document.getElementById("participantsModal");

        const dropdownBtn = modal?.querySelector(
          "#modalFilterDropdownMobile .dropdown-toggle",
        );

        if (dropdownBtn) {
          const baseText = item.getAttribute("data-original-text");
          dropdownBtn.textContent = baseText;
        }

        item.closest(".dropdown-menu")?.previousElementSibling?.click();

        const personsData = flattenRiskDataFromSelection();

        renderRiskCards(
          filter,
          {
            container: document.getElementById("modalPersonContainer"),
            isModal: true,
            scope: modal,
          },
          personsData,
        );
      });
    });

  // ===== Modal 開啟 =====
  const viewAllBtn = document.getElementById("viewAllBtn");
  const modalEl = document.getElementById("participantsModal");

  if (modalEl) {
    viewAllBtn?.addEventListener("click", () => {
      const personsData = flattenRiskDataFromSelection();

      renderRiskCards(
        "all",
        {
          container: document.getElementById("modalPersonContainer"),
          isModal: true,
          scope: modalEl,
        },
        personsData,
      );

      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    });
  }

  // ===== 預設 =====
  handleRiskFilter("all", { scope: document });
}

/** 與舊 renderCards 相同簽名，供 modal / dateFilter / i18n 等 import 使用 */
export function renderCards(allVIVIFRAIL, filterRisk = null, options = {}) {
  renderRiskCards(filterRisk, options, allVIVIFRAIL || []);
}
