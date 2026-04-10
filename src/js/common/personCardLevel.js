// src/js/common/personCardLevel.js
import { t } from "./i18n.js";
import { maskName, flattenLevelData } from "./utils.js";
import { lastRenderedAssessments, selected } from "./state.js";

/**
 * 建立 Level 人員卡片 (SVG 表情圖)
 */
export function createLevelPersonCard(
  person,
  isAll = false,
  filterLevel = null,
) {
  const genderText = person.Gender === 0 ? t("female") : t("male");

  const faceColors = { A: "#FEE2E2", B: "#FEF3C7", C: "#DBEAFE", D: "#DCFCE7" };
  const borderColors = {
    A: "#dc3545",
    B: "#fd7e14",
    C: "#0d6efd",
    D: "#28a745",
  };
  const levelLabels = t("vivifrailLevelLabel") || {};

  const levelLabel = levelLabels[person.Level] || person.Level || "";
  const borderColor = isAll ? "#000" : borderColors[person.Level] || "#6c757d";

  let faceHTML = "";
  if (!isAll) {
    let mouthPath =
      person.Level === "A" || person.Level === "B"
        ? "M40 65 Q50 55 60 65"
        : person.Level === "C"
          ? "M40 65 L60 65"
          : "M40 65 Q50 75 60 65";

    faceHTML = `
      <div class="face-container mb-2">
        <svg class="w-100" height="130" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" fill="${faceColors[person.Level] || "#eee"}" />
          <circle cx="40" cy="45" r="5" fill="#4B5563" />
          <circle cx="60" cy="45" r="5" fill="#4B5563" />
          <path d="${mouthPath}" fill="none" stroke="#4B5563" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>`;
  }

  let levelCountsHTML = "";
  if (isAll) {
    const levels = ["A", "B", "C", "D"];
    const counts = person.levelCounts || { A: 0, B: 0, C: 0, D: 0 };
    levelCountsHTML = `
      <div class="px-2 py-2 mb-2" style="background:#f8f9fa;border-radius:6px;">
        ${levels
          .map(
            (lvl) => `
          <div class="d-flex justify-content-between align-items-center mb-1">
            <div class="d-flex align-items-center">
              <span style="width:12px;height:12px;background:${borderColors[lvl]};display:inline-block;border-radius:50%;margin-right:6px;"></span>
              <span class="small text-dark">${levelLabels[lvl] || lvl}</span>
            </div>
            <span class="small fw-semibold text-dark">${counts[lvl] || 0}</span>
          </div>`,
          )
          .join("")}
      </div>`;
  } else if (filterLevel) {
    levelCountsHTML = `
      <div class="px-2 py-2 mb-2" style="background:#f8f9fa;border-radius:6px;">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <span style="width:12px;height:12px;background:${borderColors[person.Level]};display:inline-block;border-radius:50%;margin-right:6px;"></span>
            <span class="small text-dark">${levelLabel}</span>
          </div>
          <span class="small fw-semibold text-dark">${person.mergedCount || 1}</span>
        </div>
      </div>`;
  }

  return `
    <div class="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
      <div class="person-card bg-white rounded shadow-sm h-100" style="border:3px solid ${borderColor};" data-Number="${person.Number}">
        <div class="position-relative">
          ${!isAll ? `<div class="position-absolute top-0 end-0 text-white small px-2 py-1 rounded-start" style="background-color:${borderColors[person.Level]};">${levelLabel}</div>` : ""}
          ${faceHTML}
          ${isAll ? levelCountsHTML : ""}
        </div>
        <div class="p-2 text-center">
          <h4 class="fw-semibold text-dark mb-1 masked-name">${maskName(person.Name)}</h4>
          <p class="small text-muted mb-0">${person.Age}${t("yearsOld")} | ${genderText}</p>
          ${!isAll && filterLevel ? levelCountsHTML : ""}
        </div>
      </div>
    </div>`;
}

/**
 * 更新按鈕上的括號數字
 */
export function updateLevelButtonsCounts(allPersons) {
  const counts = { all: (allPersons || []).length, A: 0, B: 0, C: 0, D: 0 };
  (allPersons || []).forEach((p) => {
    if (counts[p.Level] !== undefined) counts[p.Level]++;
  });

  const updateEl = (selector, key) => {
    document.querySelectorAll(selector).forEach((el) => {
      const originalText =
        el.getAttribute("data-original-text") ||
        el.textContent.replace(/\s*\(\d+\)\s*$/, "").trim();
      if (!el.getAttribute("data-original-text"))
        el.setAttribute("data-original-text", originalText);
      el.textContent = `${originalText} (${counts[key] || 0})`;
    });
  };

  updateEl(".level .levelFilterBtnsDesktop button", "all"); // 注意這裡需要根據 dataset.filter 動態傳入，以下修正
  document
    .querySelectorAll(
      ".level .levelFilterBtnsDesktop button, .level .levelFilterDropdownMobile .dropdown-item, #modalLevelFilterBtnsDesktop button, #modalLevelFilterDropdownMobile .dropdown-item",
    )
    .forEach((el) => {
      const filter = el.dataset.filter;
      if (filter) {
        const originalText =
          el.getAttribute("data-original-text") ||
          el.textContent.replace(/\s*\(\d+\)\s*$/, "").trim();
        if (!el.getAttribute("data-original-text"))
          el.setAttribute("data-original-text", originalText);
        el.textContent = `${originalText} (${counts[filter] || 0})`;
      }
    });
}

/**
 * 渲染卡片邏輯
 */
export function renderLevelCards(
  filter = null,
  options = {},
  personsData = [],
) {
  const container =
    options.container || document.getElementById("levelPersonContainer");
  const isModal = options.isModal || false;
  if (!container) return;
  container.innerHTML = "";

  if (!personsData || personsData.length === 0) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-secondary text-center">${t("noMatchedPerson")}</div></div>`;
    updateLevelButtonsCounts([]);
    return;
  }

  const levelOrder = { A: 1, B: 2, C: 3, D: 4 };
  const allPersons = [...personsData].sort(
    (a, b) => levelOrder[a.Level] - levelOrder[b.Level],
  );
  let filteredPersons =
    filter && filter !== "all"
      ? allPersons.filter((p) => p.Level === filter)
      : allPersons;

  const mergedMap = {};
  filteredPersons.forEach((p) => {
    if (!mergedMap[p.Name]) {
      mergedMap[p.Name] = {
        latest: p,
        mergedCount: 0,
        levelCounts: { A: 0, B: 0, C: 0, D: 0 },
      };
    }
    mergedMap[p.Name].mergedCount++;
    mergedMap[p.Name].levelCounts[p.Level] =
      (mergedMap[p.Name].levelCounts[p.Level] || 0) + 1;
    if (
      !mergedMap[p.Name].latest.Date ||
      p.Date > mergedMap[p.Name].latest.Date
    )
      mergedMap[p.Name].latest = p;
  });

  const mergedPersons = Object.values(mergedMap).map((v) => ({
    ...v.latest,
    mergedCount: v.mergedCount,
    levelCounts: v.levelCounts,
  }));

  container.innerHTML = `<div class="col-12 mb-2"><div class="alert alert-info small py-2 px-3 mb-2">
    ${
      !filter || filter === "all"
        ? t("overviewAllText")
            .replace("{people}", mergedPersons.length)
            .replace("{records}", filteredPersons.length)
        : t("overviewLevelText")
            .replace(
              "{level}",
              (t("vivifrailLevelLabel") || {})[filter] || filter,
            )
            .replace("{people}", mergedPersons.length)
            .replace("{records}", filteredPersons.length)
    }
  </div></div>`;

  let renderPersons = isModal ? mergedPersons : mergedPersons.slice(0, 12);
  container.innerHTML += renderPersons
    .map((p) =>
      createLevelPersonCard(
        p,
        !filter || filter === "all",
        filter && filter !== "all" ? filter : null,
      ),
    )
    .join("");

  if (typeof window.bindPersonCardClick === "function")
    window.bindPersonCardClick();
  updateLevelButtonsCounts(allPersons);
  // ✅ 同步 active（主畫面）
  if (!options.isModal) {
    const btns = document.querySelectorAll(
      ".level .levelFilterBtnsDesktop button",
    );

    btns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === (filter || "all"));
    });
  }
}

/**
 * 重新整理 Level UI
 */
export function refreshLevelUI(assessments = []) {
  const container = document.getElementById("levelPersonContainer");
  if (!container) return;

  const data = Array.isArray(assessments) ? assessments : [];

  if (data.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-secondary text-center">
          ${t("noMatchedPerson")}
        </div>
      </div>
    `;
    window.lastLevelPersons = [];
    updateLevelButtonsCounts([]);
    return;
  }

  const allPersons = flattenLevelData(data);

  const levelOrder = { A: 1, B: 2, C: 3, D: 4 };
  allPersons.sort((a, b) => levelOrder[a.Level] - levelOrder[b.Level]);

  window.lastLevelPersons = allPersons;

  renderLevelCards(null, { container }, allPersons);
}

/**
 * 初始化
 */
export function initPersonCardLevel() {
  document
    .querySelectorAll(
      ".level .levelFilterBtnsDesktop button, .level .levelFilterDropdownMobile .dropdown-item",
    )
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const el = e.currentTarget;

        // ✅ dropdown 要阻止預設
        if (el.classList.contains("dropdown-item")) {
          e.preventDefault();
        }

        const filter = el.dataset.filter;

        // ✅ 更新 dropdown 顯示文字（手機）
        const dropdownToggle = document.querySelector(
          ".level .levelFilterDropdownMobile .dropdown-toggle",
        );

        if (dropdownToggle) {
          const labelMap = t("vivifrailLevelLabel") || {};
          dropdownToggle.textContent =
            filter === "all" ? t("all") : labelMap[filter] || filter;
        }

        // ✅ 關閉 dropdown（手機）
        const dropdown = el.closest(".dropdown-menu");
        if (dropdown) {
          const toggle = dropdown.previousElementSibling;
          if (toggle) toggle.click();
        }

        // ✅ 渲染資料
        const allAssessments = window.lastRenderedAssessments || [];
        const selectedIdx = window.selected || [];

        const data = selectedIdx.length
          ? allAssessments.filter((_, i) => selectedIdx.includes(i))
          : [];

        renderLevelCards(filter, {}, flattenLevelData(data));
      });
    });

  const viewAllLevelBtn = document.getElementById("viewAllLevelBtn");
  const modalEl = document.getElementById("participantsLevelModal");
  if (viewAllLevelBtn && modalEl) {
    viewAllLevelBtn.addEventListener("click", () => {
      const allAssessments = window.lastRenderedAssessments || [];
      const selectedIdx = window.selected || [];
      const data = selectedIdx.length
        ? allAssessments.filter((_, i) => selectedIdx.includes(i))
        : [];
      renderLevelCards(
        null,
        {
          container: document.getElementById("modalLevelPersonContainer"),
          isModal: true,
        },
        flattenLevelData(data),
      );
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    });
  }
  // ✅ Level Modal Desktop 按鈕
  document
    .querySelectorAll("#modalLevelFilterBtnsDesktop button")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;

        const allAssessments = window.lastRenderedAssessments || [];
        const selectedIdx = window.selected || [];

        const data = selectedIdx.length
          ? allAssessments.filter((_, i) => selectedIdx.includes(i))
          : [];

        renderLevelCards(
          filter,
          {
            container: document.getElementById("modalLevelPersonContainer"),
            isModal: true,
          },
          flattenLevelData(data),
        );

        // ✅ active 切換
        document
          .querySelectorAll("#modalLevelFilterBtnsDesktop button")
          .forEach((b) => b.classList.remove("active"));

        btn.classList.add("active");
      });
    });
  document.addEventListener("click", (e) => {
    const item = e.target.closest(
      "#modalLevelFilterDropdownMobile .dropdown-item",
    );

    if (!item) return;

    e.preventDefault();

    const filter = item.dataset.filter;

    const allAssessments = window.lastRenderedAssessments || [];
    const selectedIdx = window.selected || [];

    const data = selectedIdx.length
      ? allAssessments.filter((_, i) => selectedIdx.includes(i))
      : [];

    renderLevelCards(
      filter,
      {
        container: document.getElementById("modalLevelPersonContainer"),
        isModal: true,
      },
      flattenLevelData(data),
    );

    const modal = document.getElementById("participantsLevelModal");

    const dropdownBtn = modal?.querySelector(
      "#modalLevelFilterDropdownMobile .dropdown-toggle",
    );

    if (dropdownBtn) {
      const labelMap = t("vivifrailLevelLabel") || {};
      dropdownBtn.textContent =
        filter === "all" ? t("all") : labelMap[filter] || filter;
    }
  });
}

// 導出至 window
window.refreshLevelUI = refreshLevelUI;
window.initPersonCardLevel = initPersonCardLevel;
