// js/common/dateFilter.js
// 依賴：state.js（window.currentAssessments / window.selected）、table.js（renderAssessmentTable）
// 依賴：riskStats.js（updateDegenerateAndLevels / resetDegenerateAndLevels）
// 依賴：personCardRisk.js（mergeAllVIVIFRAIL / flattenData / renderCards / updateRiskButtonsCounts）
// 依賴：location.js（updateOnLocationChange）
// 依賴：charts/*.js（drawSitStandChartChartJS / drawBalanceChartChartJS / drawGaitChartChartJS / drawRiskChartChartJS / drawNoDataChart / removeNoDataOverlay）
function getFlatpickrLocale(lang) {
  switch (lang) {
    case "zh":
      return flatpickr.l10ns["zh_tw"] || flatpickr.l10ns.default;
    case "ja":
      return flatpickr.l10ns.ja;
    case "ko":
      return flatpickr.l10ns.ko;
    case "en":
    default:
      return flatpickr.l10ns.default;
  }
}

function initDateFilter() {
  // 沒有 dateRange 就不做
  const dateRangeEl = document.getElementById("dateRange");
  if (!dateRangeEl || typeof flatpickr === "undefined") return;

  const assessmentTableBody = document.getElementById("assessmentTableBody");
  const personContainer = document.getElementById("personContainer");

  const filterBtnsDesktop = document.querySelector(".filterBtnsDesktop");
  const filterDropdownMobile = document.querySelector(".filterDropdownMobile");
  const paginationContainer = document.getElementById(
    "tablePaginationContainer"
  );

  const viewAllBtn = document.getElementById("viewAllBtn");
  const checkAllBtn = document.getElementById("checkAllBtn");
  const uncheckAllBtn = document.getElementById("uncheckAllBtn");
  const sortModeSwitch = document.querySelector(".sortModeSwitch");

  //  清除時要回到「目前地區」的全量資料
  function getBaseData() {
    return window.currentAssessments || [];
  }

  const fp = flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    locale: getFlatpickrLocale(window.currentLang),
    onChange: function (selectedDates) {
      if (selectedDates.length === 2) {
        filterByDate(selectedDates[0], selectedDates[1]);
      }
    },
  });

  function hideFiltersUI() {
    filterBtnsDesktop?.classList.add("hidden-by-filter");
    filterDropdownMobile?.classList.add("hidden-by-filter");
    viewAllBtn?.classList.add("hidden-by-filter");
    checkAllBtn?.classList.add("hidden-by-filter");
    uncheckAllBtn?.classList.add("hidden-by-filter");
    paginationContainer?.classList.add("hidden-by-filter");
    sortModeSwitch?.classList.add("hidden-by-filter");
  }

  function showFiltersUI() {
    filterBtnsDesktop?.classList.remove("hidden-by-filter");
    filterDropdownMobile?.classList.remove("hidden-by-filter");
    viewAllBtn?.classList.remove("hidden-by-filter");
    checkAllBtn?.classList.remove("hidden-by-filter");
    uncheckAllBtn?.classList.remove("hidden-by-filter");
    paginationContainer?.classList.remove("hidden-by-filter");
    sortModeSwitch?.classList.remove("hidden-by-filter");
  }

  // 日期篩選
  function filterByDate(startDate, endDate) {
    const source = getBaseData();

    const filtered = source.filter((item) => {
      const d = new Date(item.Date);
      return d >= startDate && d <= endDate;
    });

    window.currentPage = 1;
    window.selected = filtered.map((_, i) => i);
    window.checkAllAcrossPages = true;

    if (!filtered || filtered.length === 0) {
      if (assessmentTableBody) {
        assessmentTableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center">
              <div class="alert alert-warning text-center m-0" role="alert">
                ${t("alertNoData")}
              </div>
            </td>
          </tr>`;
      }

      if (personContainer) {
        personContainer.innerHTML = `
          <div class="col-12">
            <div class="alert alert-warning text-center" role="alert">
              ${t("alertNoData")}
            </div>
          </div>`;
      }

      // 清空統計 / 等級 / 風險等
      updateRiskButtonsCounts?.([]);
      renderRisk?.([]);
      resetDegenerateAndLevels?.();
      refreshLevelUI?.([]);

      // 圖表顯示無資料
      drawNoDataChart?.();
      updateLatestCountDate?.([]);
      updateTotalCountAndStartDate?.([]);

      hideFiltersUI();
      return;
    }

    showFiltersUI();

    renderAssessmentTable(filtered);

    drawSitStandChartChartJS?.(filtered);
    drawBalanceChartChartJS?.(filtered);
    drawGaitChartChartJS?.(filtered);
    drawRiskChartChartJS?.(filtered);
    removeNoDataOverlay?.();
  }

  // 清除按鈕
  const clearBtn = document.getElementById("clearBtn");
  clearBtn?.addEventListener("click", () => {
    if (!fp.selectedDates || fp.selectedDates.length === 0) return;

    fp.clear();

    const data = getBaseData();

    if (data.length > 0) {
      showFiltersUI();

      window.currentPage = 1;
      window.selected = data.map((_, i) => i);
      window.checkAllAcrossPages = true;

      renderAssessmentTable(data);

      updateLatestCountDate?.(data);
      updateTotalCountAndStartDate?.(data);
      removeNoDataOverlay?.();

      drawSitStandChartChartJS?.(data);
      drawBalanceChartChartJS?.(data);
      drawGaitChartChartJS?.(data);
      drawRiskChartChartJS?.(data);
    }
  });
}
