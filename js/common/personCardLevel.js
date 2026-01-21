// js/common/personCardLevel.js
// 依賴：utils.js（maskName）
// 依賴：state.js（window.selected / window.lastRenderedAssessments）
// 依賴：location.js or main（bindPersonCardClick 已在 personCardRisk.js 也可共用）
// 依賴：lang.js（t）

function flattenLevelData(assessments) {
  const levels = ["A", "B", "C", "D"];
  const result = [];

  (assessments || []).forEach((item) => {
    levels.forEach((level) => {
      if (item?.VIVIFRAIL?.[level]) {
        item.VIVIFRAIL[level].forEach((p) => {
          result.push({ ...p, Level: level });
        });
      }
    });
  });

  return result;
}

function createLevelPersonCard(person, isAll = false, filterLevel = null) {
  const genderText = person.Gender === 0 ? t("female") : t("male");

  const faceColors = {
    A: "#FEE2E2",
    B: "#FEF3C7",
    C: "#DBEAFE",
    D: "#DCFCE7",
  };

  const levelLabels = t("vivifrailLevelLabel") || {};
  const borderColors = {
    A: "#dc3545",
    B: "#fd7e14",
    C: "#0d6efd",
    D: "#28a745",
  };

  const levelLabel = levelLabels[person.Level] || person.Level || "";
  const borderColor = isAll ? "#000" : borderColors[person.Level] || "#6c757d";

  // 單一模式才需要人臉表情
  let faceHTML = "";
  if (!isAll) {
    let mouthPath = "";
    if (person.Level === "A" || person.Level === "B")
      mouthPath = "M40 65 Q50 55 60 65";
    else if (person.Level === "C") mouthPath = "M40 65 L60 65";
    else mouthPath = "M40 65 Q50 75 60 65";

    faceHTML = `
      <div class="face-container mb-2">
        <svg class="w-100" height="130" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" fill="${
            faceColors[person.Level] || "#eee"
          }" />
          <circle cx="40" cy="45" r="5" fill="#4B5563" />
          <circle cx="60" cy="45" r="5" fill="#4B5563" />
          <path d="${mouthPath}" fill="none" stroke="#4B5563" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>`;
  }

  // 統計區（全部模式：A~D 統計；單一模式：該等級次數）
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
              <span style="width:12px;height:12px;background:${
                borderColors[lvl]
              };
                           display:inline-block;border-radius:50%;margin-right:6px;"></span>
              <span class="small text-dark">${levelLabels[lvl] || lvl}</span>
            </div>
            <span class="small fw-semibold text-dark">${counts[lvl] || 0}</span>
          </div>`
          )
          .join("")}
      </div>`;
  } else if (filterLevel) {
    levelCountsHTML = `
      <div class="px-2 py-2 mb-2" style="background:#f8f9fa;border-radius:6px;">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <span style="width:12px;height:12px;background:${
              borderColors[person.Level]
            };
                         display:inline-block;border-radius:50%;margin-right:6px;"></span>
            <span class="small text-dark">${levelLabel}</span>
          </div>
          <span class="small fw-semibold text-dark">${
            person.mergedCount || 1
          }</span>
        </div>
      </div>`;
  }

  return `
    <div class="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
      <div class="person-card bg-white rounded shadow-sm h-100"
           style="border:3px solid ${borderColor};"
           data-Number="${person.Number}"
           data-person="${person.Name}"
           data-age="${person.Age}"
           data-gender="${genderText}"
           data-level="${person.Level}">
        <div class="position-relative">
          ${
            !isAll
              ? `<div class="position-absolute top-0 end-0 text-white small px-2 py-1 rounded-start"
                   style="background-color:${
                     borderColors[person.Level]
                   };">${levelLabel}</div>`
              : ""
          }
          ${faceHTML}
          ${isAll ? levelCountsHTML : ""}
        </div>

        <div class="p-2 text-center">
          <h4 class="fw-semibold text-dark mb-1 masked-name">${maskName(
            person.Name
          )}</h4>
          <p class="small text-muted mb-0">${person.Age}${t(
    "yearsOld"
  )} | ${genderText}</p>
          ${!isAll && filterLevel ? levelCountsHTML : ""}
        </div>
      </div>
    </div>`;
}

function updateLevelButtonsCounts(allPersons) {
  const counts = { all: (allPersons || []).length, A: 0, B: 0, C: 0, D: 0 };
  (allPersons || []).forEach((p) => {
    if (counts[p.Level] !== undefined) counts[p.Level]++;
  });

  // 桌機主畫面
  document
    .querySelectorAll(".level .levelFilterBtnsDesktop button")
    .forEach((btn) => {
      const filter = btn.dataset.filter;
      const originalText = btn.getAttribute("data-original-text");
      if (originalText)
        btn.textContent = `${originalText} (${counts[filter] || 0})`;
      else {
        btn.setAttribute("data-original-text", btn.textContent.trim());
        btn.textContent = `${btn.textContent.trim()} (${counts[filter] || 0})`;
      }
    });

  // 手機主畫面
  document
    .querySelectorAll(".level .levelFilterDropdownMobile .dropdown-item")
    .forEach((item) => {
      const filter = item.dataset.filter;
      const originalText = item.getAttribute("data-original-text");
      if (originalText)
        item.textContent = `${originalText} (${counts[filter] || 0})`;
      else {
        item.setAttribute("data-original-text", item.textContent.trim());
        item.textContent = `${item.textContent.trim()} (${
          counts[filter] || 0
        })`;
      }
    });

  // Modal 桌機
  document
    .querySelectorAll("#modalLevelFilterBtnsDesktop button")
    .forEach((btn) => {
      const filter = btn.dataset.filter;
      const originalText = btn.getAttribute("data-original-text");
      if (originalText)
        btn.textContent = `${originalText} (${counts[filter] || 0})`;
      else {
        btn.setAttribute("data-original-text", btn.textContent.trim());
        btn.textContent = `${btn.textContent.trim()} (${counts[filter] || 0})`;
      }
    });

  // Modal 手機
  document
    .querySelectorAll("#modalLevelFilterDropdownMobile .dropdown-item")
    .forEach((item) => {
      const filter = item.dataset.filter;
      const originalText = item.getAttribute("data-original-text");
      if (originalText)
        item.textContent = `${originalText} (${counts[filter] || 0})`;
      else {
        item.setAttribute("data-original-text", item.textContent.trim());
        item.textContent = `${item.textContent.trim()} (${
          counts[filter] || 0
        })`;
      }
    });
}

function renderLevelCards(filter = null, options = {}, personsData = []) {
  const container =
    options.container || document.getElementById("levelPersonContainer");
  const isModal = options.isModal || false;

  if (!container) return;
  container.innerHTML = "";

  if (!personsData || personsData.length === 0) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-secondary text-center">${t(
      "noMatchedPerson"
    )}</div></div>`;
    updateLevelButtonsCounts([]);
    return;
  }

  const levelOrder = { A: 1, B: 2, C: 3, D: 4 };
  const allPersons = [...personsData].sort(
    (a, b) => levelOrder[a.Level] - levelOrder[b.Level]
  );

  let filteredPersons = allPersons;
  if (filter && filter !== "all")
    filteredPersons = filteredPersons.filter((p) => p.Level === filter);

  // 合併同名
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
    ) {
      mergedMap[p.Name].latest = p;
    }
  });

  const mergedPersons = Object.values(mergedMap).map((v) => ({
    ...v.latest,
    mergedCount: v.mergedCount,
    levelCounts: v.levelCounts,
  }));

  // 統計文字
  const totalRecords = filteredPersons.length;
  const uniqueCount = mergedPersons.length;

  container.innerHTML = `
    <div class="col-12 mb-2">
      <div class="alert alert-info small py-2 px-3 mb-2">
        ${
          !filter || filter === "all"
            ? t("overviewAllText")
                .replace("{people}", uniqueCount)
                .replace("{records}", totalRecords)
            : t("overviewLevelText")
                .replace(
                  "{level}",
                  (t("vivifrailLevelLabel") || {})[filter] || filter
                )
                .replace("{people}", uniqueCount)
                .replace("{records}", totalRecords)
        }
      </div>
    </div>`;

  let renderPersons = mergedPersons;
  if (!isModal) renderPersons = mergedPersons.slice(0, 12);

  container.innerHTML += renderPersons
    .map((p) =>
      createLevelPersonCard(
        p,
        !filter || filter === "all",
        filter && filter !== "all" ? filter : null
      )
    )
    .join("");

  // 點卡片跳 detail（沿用 personCardRisk.js 內的 bindPersonCardClick）
  bindPersonCardClick?.(window.lastRenderedAssessments || []);
  updateLevelButtonsCounts(allPersons);
}

function handleLevelFilter(filter, options = {}) {
  const allAssessments = window.lastRenderedAssessments || [];
  const selected = window.selected || [];
  const selectedAssessments = allAssessments.filter((_, i) =>
    selected.includes(i)
  );
  const dataToShow = selectedAssessments.length > 0 ? selectedAssessments : [];

  const personsData = flattenLevelData(dataToShow);
  renderLevelCards(filter, options, personsData);
}

// 切換地區/勾選後重刷 level UI 用
function refreshLevelUI(assessments = []) {
  if (!assessments || assessments.length === 0) {
    renderLevelCards(null, {}, []);
    return;
  }

  const allPersons = flattenLevelData(assessments);
  const levelOrder = { A: 1, B: 2, C: 3, D: 4 };
  allPersons.sort((a, b) => levelOrder[a.Level] - levelOrder[b.Level]);

  window.lastLevelPersons = allPersons;

  renderLevelCards(
    null,
    { container: document.getElementById("levelPersonContainer") },
    allPersons
  );
}

function initPersonCardLevel() {
  // 主畫面篩選（桌機）
  document
    .querySelectorAll(".level .levelFilterBtnsDesktop button")
    .forEach((btn) =>
      btn.addEventListener("click", () => handleLevelFilter(btn.dataset.filter))
    );

  // 主畫面篩選（手機）
  document
    .querySelectorAll(".level .levelFilterDropdownMobile .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        const filter = item.dataset.filter;

        // 同步 dropdown 顯示文字
        const dropdownBtn = document.querySelector(
          ".level .levelFilterDropdownMobile .dropdown-toggle"
        );
        if (dropdownBtn) {
          const base =
            item.getAttribute("data-original-text") ||
            item.textContent.replace(/\s*\(\d+\)\s*$/, "").trim();
          dropdownBtn.textContent = base;
        }

        handleLevelFilter(filter);
      });
    });

  // 查看全部（Level modal）
  const viewAllLevelBtn = document.getElementById("viewAllLevelBtn");
  const modalLevelPersonContainer = document.getElementById(
    "modalLevelPersonContainer"
  );

  viewAllLevelBtn?.addEventListener("click", () => {
    const allAssessments = window.lastRenderedAssessments || [];
    const selected = window.selected || [];
    const selectedAssessments = allAssessments.filter((_, i) =>
      selected.includes(i)
    );
    const dataToShow =
      selectedAssessments.length > 0 ? selectedAssessments : [];
    const personsData = flattenLevelData(dataToShow);

    renderLevelCards(
      null,
      { container: modalLevelPersonContainer, isModal: true },
      personsData
    );

    const modal = new bootstrap.Modal(
      document.getElementById("participantsLevelModal")
    );
    modal.show();
  });

  // modal 桌機
  document
    .querySelectorAll("#modalLevelFilterBtnsDesktop button")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const allAssessments = window.lastRenderedAssessments || [];
        const selected = window.selected || [];
        const selectedAssessments = allAssessments.filter((_, i) =>
          selected.includes(i)
        );
        const dataToShow =
          selectedAssessments.length > 0 ? selectedAssessments : [];
        const personsData = flattenLevelData(dataToShow);

        renderLevelCards(
          btn.dataset.filter,
          { container: modalLevelPersonContainer, isModal: true },
          personsData
        );
      });
    });

  // modal 手機
  document
    .querySelectorAll("#modalLevelFilterDropdownMobile .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        const allAssessments = window.lastRenderedAssessments || [];
        const selected = window.selected || [];
        const selectedAssessments = allAssessments.filter((_, i) =>
          selected.includes(i)
        );
        const dataToShow =
          selectedAssessments.length > 0 ? selectedAssessments : [];
        const personsData = flattenLevelData(dataToShow);

        renderLevelCards(
          item.dataset.filter,
          { container: modalLevelPersonContainer, isModal: true },
          personsData
        );
      });
    });

  // active 樣式（桌機主/桌機modal）
  const desktopLevelContainers = [
    document.querySelector(".levelFilterBtnsDesktop"),
    document.querySelector("#modalLevelFilterBtnsDesktop"),
  ];

  desktopLevelContainers.forEach((container) => {
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

  // 初次刷新
  refreshLevelUI();
}
