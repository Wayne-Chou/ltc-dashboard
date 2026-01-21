// js/common/modal/detailModal.js
// 依賴：state.js（window.lastRenderedAssessments）
// 依賴：table.js（.row-check checkbox、dataset.index）
// 依賴：utils.js
// 依賴：lang.js（t）
// 依賴：bootstrap（bootstrap.Modal）

(function () {
  function formatDateLocal(dateValue) {
    const d = new Date(dateValue);
    return `${d.getFullYear()}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
  }

  function getSelectedAssessments() {
    const checkedIndexes = Array.from(document.querySelectorAll(".row-check"))
      .filter((c) => c.checked)
      .map((c) => parseInt(c.dataset.index, 10));

    const list = window.lastRenderedAssessments || [];
    return checkedIndexes.map((i) => list[i]).filter(Boolean);
  }

  function buildDegenerateBlock(selected) {
    let totalGaitSpeed = 0;
    let totalChairSecond = 0;
    const gaitNames = [];
    const chairNames = [];

    selected.forEach((item) => {
      if (!item?.Degenerate) return;

      if (Array.isArray(item.Degenerate.GaitSpeed)) {
        const list = item.Degenerate.GaitSpeed;
        totalGaitSpeed += list.length;

        list.forEach((p) => {
          gaitNames.push(
            `${p.Name || t("unknown")} (${p.Age || t("unknown")}${t(
              "yearsOld"
            )}, ${
              p.Gender === 0
                ? t("male")
                : p.Gender === 1
                ? t("female")
                : t("unknown")
            })`
          );
        });
      }

      if (Array.isArray(item.Degenerate.ChairSecond)) {
        const list = item.Degenerate.ChairSecond;
        totalChairSecond += list.length;

        list.forEach((p) => {
          chairNames.push(
            `${p.Name || t("unknown")} (${p.Age || t("unknown")}${t(
              "yearsOld"
            )}, ${
              p.Gender === 0
                ? t("male")
                : p.Gender === 1
                ? t("female")
                : t("unknown")
            })`
          );
        });
      }
    });

    return `
      <div class="mb-4">
        <h6 class="fw-bold">${t("degenerateWarning")}</h6>
        <div class="row g-2">
          <div class="col-12 col-md-6">
            <div class="card">
              <div class="card-header">${t(
                "walkDecline"
              )} (${totalGaitSpeed})</div>
              <ul class="list-group list-group-flush">
                ${
                  gaitNames.length
                    ? gaitNames
                        .map((n) => `<li class="list-group-item">${n}</li>`)
                        .join("")
                    : `<li class="list-group-item text-muted">${t(
                        "alertNoData"
                      )}</li>`
                }
              </ul>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="card">
              <div class="card-header">${t(
                "sitStandIncrease"
              )} (${totalChairSecond})</div>
              <ul class="list-group list-group-flush">
                ${
                  chairNames.length
                    ? chairNames
                        .map((n) => `<li class="list-group-item">${n}</li>`)
                        .join("")
                    : `<li class="list-group-item text-muted">${t(
                        "alertNoData"
                      )}</li>`
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAllLevels(selected, monthContent) {
    monthContent.innerHTML = "";

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
          item.VIVIFRAIL[level].forEach((person) => {
            const ageText = person.Age
              ? `${person.Age}${t("yearsOld")}`
              : t("unknown");
            const genderText =
              person.Gender === 0
                ? t("male")
                : person.Gender === 1
                ? t("female")
                : t("unknown");
            names.push(`${person.Name} (${ageText}, ${genderText})`);
          });
        }
      });

      html += `
        <div class="col-12 col-md-4 mb-2">
          <div class="card">
            <div class="card-header bg-${levelColors[level]} text-white">
              ${levelTitles[level]} (${names.length})
            </div>
            <ul class="list-group list-group-flush">
              ${
                names.length
                  ? names
                      .map((n) => `<li class="list-group-item">${n}</li>`)
                      .join("")
                  : `<li class="list-group-item text-muted">${t(
                      "alertNoData"
                    )}</li>`
              }
            </ul>
          </div>
        </div>
      `;
    });

    monthContent.innerHTML = `<div class="row g-2">${html}</div>`;
  }

  function renderMonth(selected, year, month, monthContent) {
    monthContent.innerHTML = "";

    const items = selected.filter((item) => {
      if (!item?.Date) return false;
      const d = new Date(item.Date);
      if (month) {
        return (
          d.getFullYear() === parseInt(year, 10) && d.getMonth() + 1 === month
        );
      }
      return d.getFullYear() === parseInt(year, 10);
    });

    if (!items.length) return;

    const levels = ["A", "B", "C"];
    const levelTitles = {
      A: t("vivifrailA"),
      B: t("vivifrailB"),
      C: t("vivifrailC"),
    };
    const levelColors = { A: "danger", B: "warning", C: "primary" };

    const groupedByDate = {};
    items.forEach((item) => {
      const dateKey = item.Date
        ? new Date(item.Date).toLocaleDateString()
        : t("unknown");
      if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
      groupedByDate[dateKey].push(item);
    });

    Object.keys(groupedByDate)
      .sort((a, b) => new Date(a) - new Date(b))
      .forEach((date) => {
        const dateItems = groupedByDate[date];

        const dateHtml = `
          <div class="mb-3 p-2 bg-light rounded">
            <h6 class="fw-bold mb-2">${date}</h6>
            <div class="row g-2">
              ${levels
                .map((level) => {
                  const names = [];
                  dateItems.forEach((item) => {
                    if (item?.VIVIFRAIL?.[level]) {
                      item.VIVIFRAIL[level].forEach((person) => {
                        const ageText = person.Age
                          ? `${person.Age}${t("yearsOld")}`
                          : t("unknown");
                        const genderText =
                          person.Gender === 0
                            ? t("male")
                            : person.Gender === 1
                            ? t("female")
                            : t("unknown");
                        names.push(
                          `${person.Name} (${ageText}, ${genderText})`
                        );
                      });
                    }
                  });

                  return `
                    <div class="col-12 col-md-4">
                      <div class="card">
                        <div class="card-header bg-${
                          levelColors[level]
                        } text-white">
                          ${levelTitles[level]} (${names.length})
                        </div>
                        <ul class="list-group list-group-flush">
                          ${
                            names.length
                              ? names
                                  .map(
                                    (n) =>
                                      `<li class="list-group-item">${n}</li>`
                                  )
                                  .join("")
                              : `<li class="list-group-item text-muted">${t(
                                  "alertNoData"
                                )}</li>`
                          }
                        </ul>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>
        `;

        monthContent.innerHTML += dateHtml;
      });
  }

  function renderMonthButtons(
    selected,
    year,
    monthButtonsContainer,
    monthContent
  ) {
    monthButtonsContainer.innerHTML = "";

    // 全部
    const allBtn = document.createElement("button");
    allBtn.className = "btn btn-outline-secondary btn-sm active";
    allBtn.textContent = t("all");
    monthButtonsContainer.appendChild(allBtn);

    allBtn.addEventListener("click", () => {
      renderAllLevels(selected, monthContent);
      monthButtonsContainer
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("active"));
      allBtn.classList.add("active");
    });

    // 每月是否有資料
    const monthsWithData = new Set();
    selected.forEach((item) => {
      if (!item?.Date) return;
      const d = new Date(item.Date);
      if (d.getFullYear() === parseInt(year, 10))
        monthsWithData.add(d.getMonth() + 1);
    });

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

      if (monthsWithData.has(m)) {
        btn.className = "btn btn-outline-primary btn-sm";
        btn.addEventListener("click", () => {
          renderMonth(selected, year, m, monthContent);
          monthButtonsContainer
            .querySelectorAll("button")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        });
      } else {
        btn.className = "btn btn-outline-secondary btn-sm disabled";
        btn.disabled = true;
      }

      btn.textContent =
        window.currentLang === "en"
          ? monthNamesEN[m - 1]
          : `${m} ${t("month")}`;
      monthButtonsContainer.appendChild(btn);
    }

    // 預設顯示全部
    renderAllLevels(selected, monthContent);
  }

  function initDetailModal() {
    const viewDetailsBtn = document.getElementById("viewDetailsBtn");
    if (!viewDetailsBtn) return;

    viewDetailsBtn.addEventListener("click", () => {
      const selected = getSelectedAssessments();
      const modalEl = document.getElementById("detailsModal");
      const modalBody = document.querySelector("#detailsModal .modal-body");
      if (!modalEl || !modalBody) return;

      modalBody.innerHTML = "";

      if (!selected.length) {
        modalBody.innerHTML = `<div class="text-center text-muted">${t(
          "alertNoData"
        )}</div>`;
      } else {
        // 功能衰退統計
        modalBody.innerHTML += buildDegenerateBlock(selected);

        // 年份下拉 + 標題
        modalBody.innerHTML += `<div class="mb-2 fw-bold">${t(
          "highRiskGroup"
        )}</div>`;

        const yearsSet = new Set();
        selected.forEach((item) => {
          if (item?.Date) {
            yearsSet.add(new Date(item.Date).getFullYear());
          }
        });
        const years = Array.from(yearsSet).sort((a, b) => b - a);
        const defaultYear = years[0];
        modalBody.innerHTML += `
          <div class="mb-2">
            <select id="yearSelect" class="form-select form-select-sm w-auto">
              ${years
                .map(
                  (y) =>
                    `<option value="${y}" ${
                      y === defaultYear ? "selected" : ""
                    }>${y}</option>`
                )
                .join("")}
            </select>
          </div>
          <div id="monthButtons" class="mb-3 d-flex flex-wrap gap-1"></div>
          <div id="monthContent" class="row"></div>
        `;

        const monthButtonsContainer = modalBody.querySelector("#monthButtons");
        const monthContent = modalBody.querySelector("#monthContent");
        const yearSelect = modalBody.querySelector("#yearSelect");

        renderMonthButtons(
          selected,
          parseInt(yearSelect.value, 10),
          monthButtonsContainer,
          monthContent
        );

        yearSelect.addEventListener("change", (e) => {
          renderMonthButtons(
            selected,
            parseInt(e.target.value, 10),
            monthButtonsContainer,
            monthContent
          );
        });
      }

      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    });
  }

  // export
  window.initDetailModal = initDetailModal;
})();
