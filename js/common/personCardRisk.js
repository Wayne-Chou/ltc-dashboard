// js/common/personCardRisk.js
// 依賴：utils.js（maskName, formatDate?）
// 依賴：state.js（window.selected / window.lastRenderedAssessments）
// 依賴：lang.js（t）
// 依賴：mergeAllVIVIFRAIL / flattenData / getRiskCategory 需存在

// =========================
// 建立風險人員卡（保留你原本樣式）
// =========================
function createPersonCard(person, isAll = false, filterRisk = null) {
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

  // ALL 模式統計
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
                <span style="width:12px;height:12px;background:${
                  riskStyles[key].border
                };
                            display:inline-block;border-radius:50%;margin-right:6px;"></span>
                <span class="small text-dark">${riskStyles[key].label}</span>
              </div>
              <span class="small fw-semibold text-dark">${
                person.riskCounts?.[key] || 0
              }</span>
            </div>`
          )
          .join("")}
      </div>`;
  }

  // 單一風險人臉
  let faceHTML = "";
  if (!isAll) {
    let mouthPath = "M40 65 Q50 55 60 65";
    if (riskCategory === "low") mouthPath = "M40 65 Q50 75 60 65";
    else if (riskCategory === "slightlyLow") mouthPath = "M40 65 L60 65";

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
  <div class="person-card bg-white rounded shadow-sm h-100"
       style="border:3px solid ${isAll ? "#000" : style.border};"
       data-number="${person.Number}">
    <div class="${isAll ? "d-flex flex-column" : "position-relative"}">
      ${
        !isAll
          ? `<div class="position-absolute top-0 end-0 text-white small px-2 py-1 rounded-start"
                 style="background-color:${style.border};">${style.label}</div>`
          : ""
      }
      ${faceHTML}
      ${isAll ? riskCountsHTML : ""}
    </div>

    <div class="p-2 text-center">
      <h4 class="fw-semibold text-dark mb-1 masked-name">${maskName(
        person.Name
      )}</h4>
      <p class="small text-muted mb-0">${person.Age}${t(
    "yearsOld"
  )} | ${genderText}</p>
      ${
        person.Date
          ? `<p class="small text-muted mb-0">鑑測日期：${formatDate(
              person.Date
            )}</p>`
          : ""
      }
    </div>
  </div>
</div>`;
}

// =========================
// 更新風險按鈕括號（仿 Level：分 scope，不互相污染）
// scope:
// - 主畫面：document（只更新 .risk 區塊）
// - 彈窗：modalEl（只更新彈窗內）
// =========================
function updateRiskButtonsCounts(allPersons = [], scope = document) {
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
    const originalText = el.getAttribute("data-original-text");
    if (originalText) el.textContent = `${originalText} (${counts[key] || 0})`;
    else {
      el.setAttribute("data-original-text", el.textContent.trim());
      el.textContent = `${el.textContent.trim()} (${counts[key] || 0})`;
    }
  };

  //  主畫面（scope 是 document 時，限定 .risk）
  if (scope === document) {
    document
      .querySelectorAll(".risk .filterBtnsDesktop button")
      .forEach((btn) => setTextWithCount(btn, btn.dataset.risk));

    document
      .querySelectorAll(".risk .filterDropdownMobile .dropdown-item")
      .forEach((item) => setTextWithCount(item, item.dataset.risk));

    return; // 主畫面不要動到 modal
  }

  //  彈窗（scope 是 modalEl 時，只更新彈窗內）
  scope
    .querySelectorAll("#modalFilterBtnsDesktop button")
    .forEach((btn) => setTextWithCount(btn, btn.dataset.risk));

  scope
    .querySelectorAll("#modalFilterDropdownMobile .dropdown-item")
    .forEach((item) => setTextWithCount(item, item.dataset.risk));
}

// =========================
// 點擊人卡（跳 detail）
// =========================
function bindPersonCardClick() {
  document.querySelectorAll(".person-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.number;

      const regionId =
        new URLSearchParams(window.location.search).get("region") || "0";

      window.location.href = `personDetail.html?id=${encodeURIComponent(
        id
      )}&region=${regionId}`;
    });
  });
}

// =========================
// render 卡片
// - personsData：flatten 後的人員陣列（含 Risk）
// - options.scope:
//    主畫面：document
//    彈窗：modalEl
// =========================
function renderRiskCards(filterRisk = null, options = {}, personsData = []) {
  const container =
    options.container || document.getElementById("personContainer");
  const isModal = options.isModal || false;
  const scope = options.scope || document;

  if (!container) return;
  container.innerHTML = "";

  // counts 永遠用「全量」算
  const allPersons = Array.isArray(personsData) ? [...personsData] : [];

  // filter 只影響 render，不影響 counts
  let filteredPersons = allPersons;
  if (filterRisk && filterRisk !== "all") {
    filteredPersons = filteredPersons.filter(
      (p) => getRiskCategory(p.Risk) === filterRisk
    );
  }

  //  0 人時：桌機/彈窗都顯示同樣 noMatchedPerson 樣式
  if (!filteredPersons || filteredPersons.length === 0) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-secondary text-center">${t(
      "noMatchedPerson"
    )}</div></div>`;
    updateRiskButtonsCounts(allPersons, scope); // counts 仍顯示全量
    return;
  }

  // 合併同名：latest + riskCounts + mergedCount
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
    ) {
      mergedMap[p.Name].latest = p;
    }
  });

  const mergedPersons = Object.values(mergedMap).map((v) => ({
    ...v.latest,
    mergedCount: v.mergedCount,
    riskCounts: v.riskCounts,
  }));

  const totalRecords = filteredPersons.length;
  const uniqueCount = mergedPersons.length;
  const isAllMode = !filterRisk || filterRisk === "all";

  // 統計文字
  container.innerHTML = `
    <div class="col-12 mb-2">
      <div class="alert alert-info small py-2 px-3 mb-2">
        ${
          isAllMode
            ? t("levelOverviewText")
                .replace("{people}", uniqueCount)
                .replace("{records}", totalRecords)
            : t("levelSingleText")
                .replace(
                  "{levelName}",
                  t("riskLabel")[filterRisk] || filterRisk
                )
                .replace("{people}", uniqueCount)
                .replace("{records}", totalRecords)
        }
      </div>
    </div>`;

  // 主畫面限制 12 張
  let renderPersons = mergedPersons;
  if (!isModal) renderPersons = mergedPersons.slice(0, 12);

  container.innerHTML += renderPersons
    .map((p) => createPersonCard(p, isAllMode, filterRisk))
    .join("");

  bindPersonCardClick();

  // ✅ 只更新「各自 scope」的括號
  updateRiskButtonsCounts(allPersons, scope);
}

// =========================
// 取得目前 selection 的 flatten persons
// =========================
function flattenRiskDataFromSelection() {
  const assessments = window.lastRenderedAssessments || [];
  const selected = window.selected || [];

  const selectedAssessments =
    selected.length > 0
      ? assessments.filter((_, i) => selected.includes(i))
      : assessments;

  const merged = mergeAllVIVIFRAIL(selectedAssessments);
  return flattenData(merged);
}

// =========================
// handleRiskFilter
// =========================
function handleRiskFilter(filterRisk, options = {}) {
  const personsData = flattenRiskDataFromSelection();
  renderRiskCards(filterRisk, options, personsData);
}

// =========================
// Modal 遮罩殘留修復：統一清理
// =========================
function ensureModalCleanup(modalEl) {
  if (!modalEl || modalEl.__riskCleanupBound) return;
  modalEl.__riskCleanupBound = true;

  modalEl.addEventListener("hidden.bs.modal", () => {
    // 保險：避免黑遮罩殘留
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("padding-right");

    document.querySelectorAll(".modal-backdrop").forEach((bd) => bd.remove());
  });
}

// =========================
// 初始化 Risk（主桌/主機/Modal桌/Modal機/active）
// =========================
function initPersonCardRisk() {
  // 主畫面桌機
  document
    .querySelectorAll(".risk .filterBtnsDesktop button")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        handleRiskFilter(btn.dataset.risk, { scope: document })
      );
    });

  // 主畫面手機
  document
    .querySelectorAll(".risk .filterDropdownMobile .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const dropdownBtn = document.querySelector(
          ".risk .filterDropdownMobile .dropdown-toggle"
        );
        if (dropdownBtn) {
          const base =
            item.getAttribute("data-original-text") ||
            item.textContent.replace(/\s*\(\d+\)\s*$/, "").trim();
          dropdownBtn.textContent = base;
        }
        handleRiskFilter(item.dataset.risk, { scope: document });
      });
    });

  // 查看全部（Risk modal）
  const viewAllBtn = document.getElementById("viewAllBtn");
  const modalEl = document.getElementById("participantsModal");
  const modalPersonContainer = document.getElementById("modalPersonContainer");

  if (modalEl) ensureModalCleanup(modalEl);

  viewAllBtn?.addEventListener("click", () => {
    const personsData = flattenRiskDataFromSelection();

    renderRiskCards(
      "all",
      { container: modalPersonContainer, isModal: true, scope: modalEl },
      personsData
    );

    // 避免 new 多次造成 backdrop 問題
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  });

  // modal 桌機
  modalEl?.querySelectorAll("#modalFilterBtnsDesktop button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const personsData = flattenRiskDataFromSelection();
      renderRiskCards(
        btn.dataset.risk,
        { container: modalPersonContainer, isModal: true, scope: modalEl },
        personsData
      );
    });
  });

  // modal 手機
  modalEl
    ?.querySelectorAll("#modalFilterDropdownMobile .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        const dropdownBtn = modalEl.querySelector(
          "#modalFilterDropdownMobile .dropdown-toggle"
        );
        if (dropdownBtn) {
          const base =
            item.getAttribute("data-original-text") ||
            item.textContent.replace(/\s*\(\d+\)\s*$/, "").trim();
          dropdownBtn.textContent = base;
        }

        const personsData = flattenRiskDataFromSelection();
        renderRiskCards(
          item.dataset.risk,
          { container: modalPersonContainer, isModal: true, scope: modalEl },
          personsData
        );
      });
    });

  // active 樣式（桌機主 / 桌機 modal）
  const desktopRiskContainers = [
    document.querySelector(".risk .filterBtnsDesktop"),
    modalEl?.querySelector("#modalFilterBtnsDesktop"),
  ];

  desktopRiskContainers.forEach((container) => {
    if (!container) return;
    container.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        container
          .querySelectorAll("button")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  });

  // 初次刷新（主畫面）
  const personsData = flattenRiskDataFromSelection();
  renderRiskCards(
    "all",
    { container: document.getElementById("personContainer"), scope: document },
    personsData
  );
}

// =========================
// risk/level 切換
// =========================
function initRiskModeUI() {
  const riskModeBtn = document.getElementById("riskModeBtn");
  const levelModeBtn = document.getElementById("levelModeBtn");
  const riskContainer = document.getElementById("riskContainer");
  const levelContainer = document.getElementById("levelContainer");

  if (riskModeBtn && levelModeBtn && riskContainer && levelContainer) {
    riskContainer.classList.remove("d-none");
    levelContainer.classList.add("d-none");

    riskModeBtn.addEventListener("click", () => {
      riskContainer.classList.remove("d-none");
      levelContainer.classList.add("d-none");
      riskModeBtn.classList.add("active");
      levelModeBtn.classList.remove("active");

      const personsData = flattenRiskDataFromSelection();
      renderRiskCards(
        "all",
        {
          container: document.getElementById("personContainer"),
          scope: document,
        },
        personsData
      );
    });

    levelModeBtn.addEventListener("click", () => {
      riskContainer.classList.add("d-none");
      levelContainer.classList.remove("d-none");
      levelModeBtn.classList.add("active");
      riskModeBtn.classList.remove("active");

      const all = window.lastRenderedAssessments || [];
      const selected = window.selected || [];
      const selectedAssessments = all.filter((_, i) => selected.includes(i));
      window.refreshLevelUI?.(
        selectedAssessments.length ? selectedAssessments : all
      );
    });
  }
}

window.renderCards = function (allVIVIFRAIL, filterRisk = null, options = {}) {
  const mergedOptions = { scope: options.scope || document, ...options };
  renderRiskCards(filterRisk, mergedOptions, allVIVIFRAIL || []);
};

// export
window.updateRiskButtonsCounts = updateRiskButtonsCounts;
window.initPersonCardRisk = initPersonCardRisk;
window.initRiskModeUI = initRiskModeUI;
