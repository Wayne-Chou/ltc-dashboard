document.addEventListener("DOMContentLoaded", async () => {
  const dropdownButton = document.getElementById("dropdownMenuButton");
  const dropdownMenu = document.getElementById("dropdownMenu");
  // 檢測數據資料
  const locationCount = document.getElementById("locationCount");
  const locationList = document.getElementById("locationList");
  // 取得表格
  const assessmentTableBody = document.getElementById("assessmentTableBody");
  // 取得風險等級數字 & 進度條
  const riskA = document.getElementById("riskA");
  const riskB = document.getElementById("riskB");
  const riskC = document.getElementById("riskC");
  const riskD = document.getElementById("riskD");
  const progressA = document.getElementById("progressA");
  const progressB = document.getElementById("progressB");
  const progressC = document.getElementById("progressC");
  const progressD = document.getElementById("progressD");

  const personContainer = document.getElementById("personContainer");
  const viewAllBtn = document.getElementById("viewAllBtn");
  // 檢測日期
  const latestCountEl = document.getElementById("latestCount");
  const latestDateEl = document.getElementById("latestDate");

  let currentAssessments = [];

  // 地區名 JSON 檔案

  const locationFileMap = {
    信義區: "PageAPI-0.json",
    中山區: "PageAPI-1.json",
    北投區: "PageAPI-2.json",
    大安區: "PageAPI-3.json",
    比漾廣場新北永和: "PageAPI-4.json",
    蘆洲功學社音樂廳: "PageAPI-5.json",
    大溝溪生態治水園區: "PageAPI-6.json",
  };

  // VIVIFRAIL 陣列

  function flattenData(VIVIFRAIL) {
    const levels = ["A", "B", "C", "D"];
    const result = [];
    levels.forEach((level) => {
      if (VIVIFRAIL[level]) {
        VIVIFRAIL[level].forEach((p) => {
          result.push({ ...p, Level: level });
        });
      }
    });
    return result;
  }

  // 依照 Risk 數值判斷分類

  function getRiskCategory(risk) {
    if (risk > 60) return "high";
    if (risk > 35) return "slightlyHigh";
    if (risk > 20) return "medium";
    if (risk > 5) return "slightlyLow";
    return "low";
  }

  // 建立人員卡片

  function createPersonCard(person) {
    const genderText = person.Gender === 0 ? "男" : "女";
    const faceColors = {
      A: "#FEE2E2", // 紅色系
      B: "#FEF3C7", // 黃色系
      C: "#DBEAFE", // 藍色系
      D: "#DCFCE7", // 綠色系
    };
    const levelLabels = { A: "A級", B: "B級", C: "C級", D: "D級" };
    const borderClasses = {
      A: "danger",
      B: "warning",
      C: "primary",
      D: "success",
    };

    const faceColor = faceColors[person.Level] || "#E5E7EB";
    const levelLabel = levelLabels[person.Level] || "";
    const levelClass = `border-${borderClasses[person.Level] || "secondary"}`;

    return `
      <div class="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
        <div class="person-card bg-white rounded shadow-sm border border-2 ${levelClass} h-100"
             data-person="${person.Name}"
             data-age="${person.Age}"
             data-gender="${genderText}"
             data-level="${person.Level}"
             data-risk="${getRiskCategory(person.Risk)}">
          <div class="position-relative">
            <!-- SVG 簡單人臉 -->
            <svg class="w-100" height="130" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="30" fill="${faceColor}" />
              <circle cx="40" cy="45" r="5" fill="#4B5563" />
              <circle cx="60" cy="45" r="5" fill="#4B5563" />
              <path d="M40 65 Q50 70 60 65" fill="none" stroke="#4B5563" stroke-width="3" stroke-linecap="round" />
            </svg>
            <div class="position-absolute top-0 end-0 bg-${
              borderClasses[person.Level]
            } text-white small px-2 py-1 rounded-0 rounded-start">
              ${levelLabel}
            </div>
          </div>
          <div class="p-2 text-center">
            <h4 class="fw-semibold text-dark mb-1">${person.Name}</h4>
            <p class="small text-muted mb-0">${person.Age}歲 | ${genderText}</p>
          </div>
        </div>
      </div>`;
  }

  // 地區的 JSON

  async function loadLocationData(location) {
    try {
      const fileName = locationFileMap[location];
      if (!fileName) {
        console.error("找不到對應 JSON:", location);
        return;
      }

      const response = await fetch(fileName);
      const data = await response.json();

      // 下拉按鈕文字
      dropdownButton.textContent = data.Location;

      currentAssessments = data.assessments;
      // 人數與日期
      const latestCountEl = document.getElementById("latestCount");
      const latestDateEl = document.getElementById("latestDate");
      // 判斷 assessments 是否空的
      if (!currentAssessments || currentAssessments.length === 0) {
        assessmentTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <div class="alert alert-warning text-center m-0" role="alert">
               查無資料
            </div>
          </td>
        </tr>
      `;
        personContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning text-center" role="alert">
             查無資料
          </div>
        </div>
      `;
        updateTotalCountAndStartDate([]);
        // 清空其他顯示區域
        latestCountEl.textContent = "0";
        latestDateEl.textContent = "尚無檢測紀錄";
        riskA.textContent = 0;
        riskB.textContent = 0;
        riskC.textContent = 0;
        riskD.textContent = 0;
        progressA.style.width = "0%";
        progressB.style.width = "0%";
        progressC.style.width = "0%";
        progressD.style.width = "0%";
        resetDegenerateAndLevels();
        document
          .querySelector(".filterBtnsDesktop")
          ?.classList.add("hidden-by-filter");
        document
          .querySelector(".filterDropdownMobile")
          ?.classList.add("hidden-by-filter");
        document
          .getElementById("viewAllBtn")
          ?.classList.add("hidden-by-filter");
        drawNoDataChart();

        return;
      }
      document
        .querySelector(".filterBtnsDesktop")
        ?.classList.remove("hidden-by-filter");
      document
        .querySelector(".filterDropdownMobile")
        ?.classList.remove("hidden-by-filter");
      document
        .getElementById("viewAllBtn")
        ?.classList.remove("hidden-by-filter");

      renderAssessmentTable(currentAssessments);
      updateOnLocationChange();
      updateLatestCountDate(currentAssessments);
      updateTotalCountAndStartDate(currentAssessments);
      drawSitStandChart(currentAssessments);
      drawBalanceChart(currentAssessments);
      drawGaitChart(currentAssessments);
      drawRiskChart(currentAssessments);
    } catch (err) {
      console.error("讀取 JSON 失敗:", err);
    }
  }

  // 下拉選單
  try {
    const locations = Object.keys(locationFileMap);

    // 顯示總據點數量 & 名稱
    locationCount.textContent = locations.length;
    locationList.textContent = locations.join("、");

    dropdownMenu.innerHTML = "";

    locations.forEach((loc, index) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.classList.add("dropdown-item");
      a.href = "#";
      a.textContent = loc;
      a.setAttribute("data-location-name", loc);

      a.addEventListener("click", () => {
        loadLocationData(loc);
      });

      li.appendChild(a);
      dropdownMenu.appendChild(li);

      // 預設第一筆
      if (index === 0) {
        loadLocationData(loc);
      }
    });
  } catch (error) {
    console.error("失敗:", error);
  }

  // 表格 function
  let currentPage = 1;
  const pageSize = 10;
  function renderAssessmentTable(assessments) {
    const assessmentTableBody = document.getElementById("assessmentTableBody");
    const paginationContainer = document.getElementById(
      "tablePaginationContainer"
    );

    assessmentTableBody.innerHTML = "";
    if (!assessments || assessments.length === 0) {
      paginationContainer.innerHTML = "";
      return;
    }

    // 排序最新到最舊
    const sorted = [...assessments].sort((a, b) => b.Date - a.Date);
    const totalPages = Math.ceil(sorted.length / pageSize);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = sorted.slice(start, end);

    // 表格
    pageData.forEach((item, index) => {
      const tr = document.createElement("tr");

      const date = new Date(item.Date);
      const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

      tr.innerHTML = `
      <td><input type="checkbox" class="row-check" data-index="${assessments.indexOf(
        item
      )}" ${index === 0 ? "checked" : ""}></td>
      <td>${formattedDate}</td>
      <td>${item.Count}人</td>
      <td>${item.ChairSecond.toFixed(1)}秒</td>
      <td>${item.BalanceScore.toFixed(1)}分</td>
      <td>${item.GaitSpeed.toFixed(1)} cm/s</td>
      <td>${item.RiskRate.toFixed(1)}%</td>
    `;
      assessmentTableBody.appendChild(tr);
    });

    // 預設最新一筆
    renderRisk([pageData[0]]);
    updateDegenerateAndLevels([pageData[0]]);

    // checkbox 勾選事件
    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        const checkedIndexes = Array.from(checkboxes)
          .filter((c) => c.checked)
          .map((c) => parseInt(c.dataset.index));

        if (checkedIndexes.length === 0) {
          showAlert();
          checkboxes[0].checked = true;
          renderRisk([pageData[0]]);
          updateDegenerateAndLevels([pageData[0]]);
        } else {
          const selected = checkedIndexes.map((i) => assessments[i]);
          renderRisk(selected);
          updateDegenerateAndLevels(selected);
        }
      });
    });

    // 分頁按鈕
    paginationContainer.innerHTML = "";
    if (totalPages > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.className = "btn btn-sm btn-outline-primary";
      prevBtn.textContent = "上一頁";
      prevBtn.disabled = currentPage === 1;
      prevBtn.onclick = () => {
        currentPage--;
        renderAssessmentTable(assessments);
      };

      const nextBtn = document.createElement("button");
      nextBtn.className = "btn btn-sm btn-outline-primary";
      nextBtn.textContent = "下一頁";
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.onclick = () => {
        currentPage++;
        renderAssessmentTable(assessments);
      };

      const pageInfo = document.createElement("span");
      pageInfo.className = "small text-center flex-grow-1";
      pageInfo.textContent = `第 ${currentPage} 頁 / 共 ${totalPages} 頁`;

      paginationContainer.appendChild(prevBtn);
      paginationContainer.appendChild(pageInfo);
      paginationContainer.appendChild(nextBtn);
    }
  }

  // 顯示提示訊息
  function showAlert() {
    const alertBox = document.getElementById("alertBox");
    alertBox.classList.remove("d-none");
    setTimeout(() => {
      alertBox.classList.add("d-none");
    }, 3000);
  }

  // 重新更新畫面
  function triggerCheckboxUpdate() {
    const selected = Array.from(
      document.querySelectorAll(".row-check:checked")
    ).map((cb) => currentAssessments[parseInt(cb.dataset.index)]);

    renderRisk(selected);
    updateDegenerateAndLevels(selected);
  }

  // 「全選」按鈕
  document.getElementById("checkAllBtn").addEventListener("click", () => {
    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => (cb.checked = true));
    triggerCheckboxUpdate();
  });

  // 「取消全選」按鈕
  document.getElementById("uncheckAllBtn").addEventListener("click", () => {
    const checkboxes = document.querySelectorAll(".row-check");
    const checked = Array.from(checkboxes).filter((cb) => cb.checked);

    // 取消全部後，保留第一筆
    checkboxes.forEach((cb) => (cb.checked = false));
    if (checked[0]) checked[0].checked = true;

    triggerCheckboxUpdate();
  });

  // 風險等級 function

  function renderRisk(selectedAssessments) {
    if (!selectedAssessments || selectedAssessments.length === 0) return;

    let totalCount = 0;
    let countA = 0,
      countB = 0,
      countC = 0,
      countD = 0;

    selectedAssessments.forEach((item) => {
      totalCount += item.Count;
      const V = item.VIVIFRAIL;
      countA += V.A ? V.A.length : 0;
      countB += V.B ? V.B.length : 0;
      countC += V.C ? V.C.length : 0;
      countD += V.D ? V.D.length : 0;
    });

    riskA.textContent = countA;
    riskB.textContent = countB;
    riskC.textContent = countC;
    riskD.textContent = countD;

    progressA.style.width = totalCount
      ? `${(countA / totalCount) * 100}%`
      : "0%";
    progressB.style.width = totalCount
      ? `${(countB / totalCount) * 100}%`
      : "0%";
    progressC.style.width = totalCount
      ? `${(countC / totalCount) * 100}%`
      : "0%";
    progressD.style.width = totalCount
      ? `${(countD / totalCount) * 100}%`
      : "0%";
  }
  // 更新最新檢測數與日期
  function updateLatestCountDate(assessments) {
    if (!assessments || assessments.length === 0) return;

    // 依 Date 排序，找最新一筆
    const latest = [...assessments].sort((a, b) => b.Date - a.Date)[0];

    if (latestCountEl) latestCountEl.textContent = latest.Count;

    if (latestDateEl) {
      const date = new Date(latest.Date);
      const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
      latestDateEl.textContent = `${formattedDate} 檢測`;
    }
  }

  // 所有 VIVIFRAIL

  function mergeAllVIVIFRAIL(assessments) {
    const merged = { A: [], B: [], C: [], D: [] };
    assessments.forEach((item) => {
      ["A", "B", "C", "D"].forEach((level) => {
        if (item.VIVIFRAIL[level]) {
          merged[level] = merged[level].concat(item.VIVIFRAIL[level]);
        }
      });
    });
    return merged;
  }

  // 切換地點時更新內容

  function updateOnLocationChange() {
    if (currentAssessments.length > 0) {
      const mergedVIVIFRAIL = mergeAllVIVIFRAIL(currentAssessments);
      renderCards(flattenData(mergedVIVIFRAIL));
    }
  }

  // 更新步行速度衰退 / 起坐秒數增加 & 各級人數

  function updateDegenerateAndLevels(assessments) {
    if (!assessments || assessments.length === 0) return;

    // 合併 Degenerate
    let totalGaitSpeed = 0;
    let totalChairSecond = 0;

    // 合併各級人數
    let countA = 0,
      countB = 0,
      countC = 0;

    assessments.forEach((item) => {
      if (item.Degenerate) {
        totalGaitSpeed += item.Degenerate.GaitSpeed || 0;
        totalChairSecond += item.Degenerate.ChairSecond || 0;
      }

      const V = item.VIVIFRAIL;
      if (V) {
        countA += V.A ? V.A.length : 0;
        countB += V.B ? V.B.length : 0;
        countC += V.C ? V.C.length : 0;
      }
    });

    const degenerateList = document.getElementById("degenerateList");
    if (degenerateList) {
      const spans = degenerateList.querySelectorAll("span");
      if (spans.length >= 2) {
        spans[0].textContent = totalGaitSpeed;
        spans[1].textContent = totalChairSecond;
      }
    }

    const levelList = document.getElementById("levelList");
    if (levelList) {
      const spans = levelList.querySelectorAll("span");
      if (spans.length >= 3) {
        spans[0].textContent = countA;
        spans[1].textContent = countB;
        spans[2].textContent = countC;
      }
    }
  }

  // 總計參與人數 & 起始日期
  function updateTotalCountAndStartDate(assessments) {
    const totalCountEl = document.getElementById("totalCount");
    const startDateTextEl = document.getElementById("startDateText");
    if (!assessments || assessments.length === 0) {
      if (totalCountEl) totalCountEl.textContent = "0";
      if (startDateTextEl) startDateTextEl.textContent = "尚無資料";
      return;
    }

    //  人數加總 Count
    const totalCount = assessments.reduce(
      (sum, item) => sum + (item.Count || 0),
      0
    );

    // 找最舊日期
    const minDate = new Date(Math.min(...assessments.map((item) => item.Date)));
    const startYear = minDate.getFullYear();
    const startMonth = (minDate.getMonth() + 1).toString().padStart(2, "0");

    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (startDateTextEl)
      startDateTextEl.textContent = `自 ${startYear} 年 ${startMonth} 月起累計`;
  }

  // 人員卡片 (最多 12 個，按 A->B->C->D 排序)

  function renderCards(allVIVIFRAIL, filterRisk = null) {
    personContainer.innerHTML = "";

    let persons = allVIVIFRAIL;
    if (filterRisk && filterRisk !== "all") {
      persons = persons.filter((p) => getRiskCategory(p.Risk) === filterRisk);
    }

    const levelOrder = { A: 1, B: 2, C: 3, D: 4 };
    persons.sort((a, b) => levelOrder[a.Level] - levelOrder[b.Level]);

    const showAllBtn = persons.length > 12;
    updateViewAllBtn(showAllBtn);

    persons = persons.slice(0, 12);

    if (persons.length === 0) {
      personContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-secondary text-center" role="alert">
            目前沒有符合條件的人員
          </div>
        </div>`;
      return;
    }

    personContainer.innerHTML = persons.map(createPersonCard).join("");
    updateRiskButtonsCounts(allVIVIFRAIL);
  }

  // 更新桌機風險按鈕括號

  function updateRiskButtonsCounts(allPersons) {
    const counts = {
      all: allPersons.length,
      high: 0,
      slightlyHigh: 0,
      medium: 0,
      slightlyLow: 0,
      low: 0,
    };

    allPersons.forEach((p) => {
      const cat = getRiskCategory(p.Risk);
      if (counts[cat] !== undefined) counts[cat]++;
    });

    document.querySelectorAll(".d-md-flex button").forEach((btn) => {
      const risk = btn.dataset.risk;
      const originalText = btn.getAttribute("data-original-text");
      if (originalText) {
        btn.textContent = `${originalText} (${counts[risk] || 0})`;
      } else {
        btn.setAttribute("data-original-text", btn.textContent.trim());
        btn.textContent = `${btn.textContent.trim()} (${counts[risk] || 0})`;
      }
    });
  }

  // 查看全部按鈕

  function updateViewAllBtn(show) {
    if (!viewAllBtn) return;
    viewAllBtn.style.display = show ? "inline-flex" : "none";
  }

  // 高低風險按鈕 (桌機)

  function handleRiskFilter(risk) {
    if (currentAssessments.length > 0) {
      const mergedVIVIFRAIL = mergeAllVIVIFRAIL(currentAssessments);
      if (risk === "all") {
        renderCards(flattenData(mergedVIVIFRAIL));
      } else {
        renderCards(flattenData(mergedVIVIFRAIL), risk);
      }
    }
  }

  // 高低風險按鈕(手機)
  document.querySelectorAll(".dropdown-menu .dropdown-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      handleRiskFilter(item.dataset.risk);
    });
  });

  // 桌機按鈕監聽
  document.querySelectorAll(".d-md-flex button").forEach((btn) => {
    btn.addEventListener("click", () => {
      handleRiskFilter(btn.dataset.risk);
    });
  });

  // 重置 degenerateList 和 levelList 為 0
  function resetDegenerateAndLevels() {
    const degenerateList = document.getElementById("degenerateList");
    if (degenerateList) {
      const spans = degenerateList.querySelectorAll("span");
      if (spans.length >= 2) {
        spans[0].textContent = 0; // 步行速度衰退
        spans[1].textContent = 0; // 起坐秒數增加
      }
    }

    const levelList = document.getElementById("levelList");
    if (levelList) {
      const spans = levelList.querySelectorAll("span");
      if (spans.length >= 3) {
        spans[0].textContent = 0; // A級
        spans[1].textContent = 0; // B級
        spans[2].textContent = 0; // C級
      }
    }
  }

  // 日期套件js
  const dateAlertBox = document.getElementById("dateAlertBox");

  const fp = flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    locale: "zh_tw",
    onChange: function (selectedDates, dateStr, instance) {
      if (selectedDates.length === 2) {
        let start = selectedDates[0];
        let end = selectedDates[1];

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 限定查找 3 個月內
        if (diffDays > 92) {
          dateAlertBox.classList.remove("d-none");
          dateAlertBox.innerHTML = `
          <strong>提示：</strong> 只能查找三個月內的資料。
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
          setTimeout(() => {
            instance.clear();
          }, 100);
        } else {
          // 三個月內資料
          filterByDate(start, end);
        }
      }
    },
  });

  //  日期篩選 json日期
  function filterByDate(startDate, endDate) {
    // 篩選出區間內的資料
    const filtered = currentAssessments.filter((item) => {
      const d = new Date(item.Date);
      return d >= startDate && d <= endDate;
    });
    const filterBtnsDesktop = document.querySelector(".filterBtnsDesktop");
    const filterDropdownMobile = document.querySelector(
      ".filterDropdownMobile"
    );
    const viewAllBtn = document.getElementById("viewAllBtn");
    if (filtered.length === 0) {
      assessmentTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center">
        <div class="alert alert-warning text-center m-0" role="alert">
           查無資料
        </div>
      </td>
    </tr>
  `;
      personContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning text-center" role="alert">
           查無資料
        </div>
      </div>
    `;
      // 清空其他顯示區域
      riskA.textContent = 0;
      riskB.textContent = 0;
      riskC.textContent = 0;
      riskD.textContent = 0;
      progressA.style.width = "0%";
      progressB.style.width = "0%";
      progressC.style.width = "0%";
      progressD.style.width = "0%";
      resetDegenerateAndLevels();
      filterBtnsDesktop.classList.add("hidden-by-filter");
      filterDropdownMobile.classList.add("hidden-by-filter");
      viewAllBtn.classList.add("hidden-by-filter");
      drawNoDataChart();
    } else {
      renderAssessmentTable(filtered);
      updateDegenerateAndLevels(filtered);
      const mergedVIVIFRAIL = mergeAllVIVIFRAIL(filtered);
      renderCards(flattenData(mergedVIVIFRAIL));
      updateLatestCountDate(filtered);
      drawSitStandChart(filtered);
      drawBalanceChart(filtered);
      drawGaitChart(filtered);
      drawRiskChart(filtered);
    }
  }

  // 清除按鈕
  document.getElementById("clearBtn").addEventListener("click", () => {
    fp.clear();
    dateAlertBox.classList.add("d-none");
    //清除後顯示全部資料
    if (currentAssessments.length > 0) {
      renderAssessmentTable(currentAssessments);
      updateOnLocationChange();
      updateLatestCountDate(currentAssessments);
      const filterBtnsDesktop = document.querySelector(".filterBtnsDesktop");
      const filterDropdownMobile = document.querySelector(
        ".filterDropdownMobile"
      );
      const viewAllBtn = document.getElementById("viewAllBtn");

      filterBtnsDesktop.classList.remove("hidden-by-filter");
      filterDropdownMobile.classList.remove("hidden-by-filter");
      viewAllBtn.classList.remove("hidden-by-filter");
      drawSitStandChart(currentAssessments);
      drawBalanceChart(currentAssessments);
      drawGaitChart(currentAssessments);
      drawRiskChart(currentAssessments);
    }
  });
  // 曲線圖坐站平均秒數
  function drawSitStandChart(assessments) {
    const svg = document.getElementById("sitStandChart");
    if (!svg) return;

    // 先清空
    svg.innerHTML = "";

    if (!assessments || assessments.length === 0) return;

    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    const padding = { top: 30, right: 20, bottom: 30, left: 50 };

    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // 整理資料 (依 Date 排序，由舊到新)
    let sorted = [...assessments].sort((a, b) => a.Date - b.Date);

    // 只取最新 6 筆
    if (sorted.length > 6) {
      sorted = sorted.slice(-6);
    }

    const maxY = Math.max(...sorted.map((d) => d.ChairSecond)) + 0.5;
    const minY = Math.min(...sorted.map((d) => d.ChairSecond)) - 0.5;

    // 計算點座標
    const points = sorted.map((d, i) => {
      const x =
        sorted.length === 1
          ? padding.left + chartWidth / 2
          : padding.left + (i / (sorted.length - 1)) * chartWidth;
      const y =
        padding.top + ((maxY - d.ChairSecond) / (maxY - minY)) * chartHeight;
      return { x, y, value: d.ChairSecond, date: new Date(d.Date) };
    });

    // SVG 定義漸層
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const linearGradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    linearGradient.setAttribute("id", "lineGradient");
    linearGradient.setAttribute("x1", "0");
    linearGradient.setAttribute("y1", "0");
    linearGradient.setAttribute("x2", "0");
    linearGradient.setAttribute("y2", "1");

    const stop1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#10b981");
    stop1.setAttribute("stop-opacity", "0.4");

    const stop2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#10b981");
    stop2.setAttribute("stop-opacity", "0");

    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    defs.appendChild(linearGradient);
    svg.appendChild(defs);

    // === 折線與漸層填充（多筆資料才畫折線）===
    if (sorted.length > 1) {
      const pathD = points
        .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
        .join(" ");
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", pathD);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#10b981");
      path.setAttribute("stroke-width", "3");
      path.setAttribute("stroke-dasharray", "5,5");
      svg.appendChild(path);

      // 線下漸層填充
      const fillPathD =
        pathD +
        ` L${points[points.length - 1].x},${svgHeight - padding.bottom} L${
          points[0].x
        },${svgHeight - padding.bottom} Z`;
      const fillPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      fillPath.setAttribute("d", fillPathD);
      fillPath.setAttribute("fill", "url(#lineGradient)");
      fillPath.setAttribute("stroke", "none");
      svg.appendChild(fillPath);
    }

    // === 畫圓點 + 數值文字 ===
    points.forEach((p) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 5);
      circle.setAttribute("fill", "#10b981");
      svg.appendChild(circle);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", p.x);
      text.setAttribute("y", p.y - 10);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", "#10b981");
      text.textContent = p.value.toFixed(1) + "s";
      svg.appendChild(text);
    });

    // === X 軸文字 ===
    points.forEach((p) => {
      const xText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      xText.setAttribute("x", p.x);
      xText.setAttribute("y", svgHeight - 5);
      xText.setAttribute("text-anchor", "middle");
      xText.setAttribute("font-size", "11");
      xText.setAttribute("fill", "#6b7280");
      xText.textContent = `${p.date.getMonth() + 1}/${p.date.getDate()}`;
      svg.appendChild(xText);
    });

    // === Y 軸數字 + 虛線網格 ===
    const yStep = (maxY - minY) / 5;
    for (let i = 0; i <= 5; i++) {
      const yValue = minY + i * yStep;
      const y = padding.top + ((maxY - yValue) / (maxY - minY)) * chartHeight;

      // Y 軸文字
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", padding.left - 10);
      text.setAttribute("y", y + 5);
      text.setAttribute("text-anchor", "end");
      text.setAttribute("font-size", "11");
      text.setAttribute("fill", "#6b7280");
      text.textContent = yValue.toFixed(1);
      svg.appendChild(text);

      // 虛線格線
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", padding.left);
      line.setAttribute("x2", svgWidth - padding.right);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "#d1d5db");
      line.setAttribute("stroke-dasharray", "2,2");
      svg.appendChild(line);
    }
  }

  // 曲線圖平衡測驗得分
  function drawBalanceChart(assessments) {
    const svg = document.getElementById("balanceChart");
    if (!svg) return;

    svg.innerHTML = "";
    if (!assessments || assessments.length === 0) return;

    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    const padding = { top: 30, right: 20, bottom: 30, left: 50 };

    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // 依 Date 排序
    const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

    // 僅取最後 6 筆
    const displayData = sorted.slice(-6);

    const maxY = Math.max(...displayData.map((d) => d.BalanceScore)) + 0.5;
    const minY = Math.min(...displayData.map((d) => d.BalanceScore)) - 0.5;

    // 計算點座標
    const points = displayData.map((d, i) => {
      const x =
        displayData.length === 1
          ? padding.left + chartWidth / 2
          : padding.left + (i / (displayData.length - 1)) * chartWidth;
      const y =
        padding.top + ((maxY - d.BalanceScore) / (maxY - minY)) * chartHeight;
      return { x, y, value: d.BalanceScore, date: new Date(d.Date) };
    });

    // === SVG 定義漸層 (藍色系) ===
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const linearGradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    linearGradient.setAttribute("id", "balanceGradient");
    linearGradient.setAttribute("x1", "0");
    linearGradient.setAttribute("y1", "0");
    linearGradient.setAttribute("x2", "0");
    linearGradient.setAttribute("y2", "1");

    const stop1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#3b82f6");
    stop1.setAttribute("stop-opacity", "0.4");

    const stop2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#3b82f6");
    stop2.setAttribute("stop-opacity", "0");

    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    defs.appendChild(linearGradient);
    svg.appendChild(defs);

    // === 折線與漸層填充 ===
    if (points.length > 1) {
      const pathD = points
        .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
        .join(" ");
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", pathD);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#3b82f6");
      path.setAttribute("stroke-width", "3");
      path.setAttribute("stroke-dasharray", "5,5");
      svg.appendChild(path);

      const fillPathD =
        pathD +
        ` L${points[points.length - 1].x},${svgHeight - padding.bottom} L${
          points[0].x
        },${svgHeight - padding.bottom} Z`;
      const fillPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      fillPath.setAttribute("d", fillPathD);
      fillPath.setAttribute("fill", "url(#balanceGradient)");
      svg.appendChild(fillPath);
    }

    // === 圓點 + 數值文字 ===
    points.forEach((p) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 5);
      circle.setAttribute("fill", "#3b82f6");
      svg.appendChild(circle);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", p.x);
      text.setAttribute("y", p.y - 10);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", "#3b82f6");
      text.textContent = p.value.toFixed(1);
      svg.appendChild(text);
    });

    // === X 軸文字 ===
    points.forEach((p) => {
      const xText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      xText.setAttribute("x", p.x);
      xText.setAttribute("y", svgHeight - 5);
      xText.setAttribute("text-anchor", "middle");
      xText.setAttribute("font-size", "11");
      xText.setAttribute("fill", "#6b7280");
      xText.textContent = `${p.date.getMonth() + 1}/${p.date.getDate()}`;
      svg.appendChild(xText);
    });

    // === Y 軸數字 + 虛線網格 ===
    const yStep = (maxY - minY) / 5;
    for (let i = 0; i <= 5; i++) {
      const yValue = minY + i * yStep;
      const y = padding.top + ((maxY - yValue) / (maxY - minY)) * chartHeight;

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", padding.left - 10);
      text.setAttribute("y", y + 5);
      text.setAttribute("text-anchor", "end");
      text.setAttribute("font-size", "11");
      text.setAttribute("fill", "#6b7280");
      text.textContent = yValue.toFixed(1);
      svg.appendChild(text);

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", padding.left);
      line.setAttribute("x2", svgWidth - padding.right);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "#d1d5db");
      line.setAttribute("stroke-dasharray", "2,2");
      svg.appendChild(line);
    }
  }

  // 曲線圖步行速度趨勢
  function drawGaitChart(assessments) {
    const svg = document.getElementById("gaitChart");
    if (!svg) return;

    svg.innerHTML = "";
    if (!assessments || assessments.length === 0) return;

    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    const padding = { top: 30, right: 20, bottom: 30, left: 50 };

    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // 整理資料 (依 Date 排序)
    const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

    // 只取最後 6 筆
    const displayData = sorted.slice(-6);

    const maxY = Math.max(...displayData.map((d) => d.GaitSpeed)) + 0.5;
    const minY = Math.min(...displayData.map((d) => d.GaitSpeed)) - 0.5;

    // 計算點座標
    const points = displayData.map((d, i) => {
      const x =
        displayData.length === 1
          ? padding.left + chartWidth / 2
          : padding.left + (i / (displayData.length - 1)) * chartWidth;
      const y =
        padding.top + ((maxY - d.GaitSpeed) / (maxY - minY)) * chartHeight;
      return { x, y, value: d.GaitSpeed, date: new Date(d.Date) };
    });

    // SVG 定義漸層 (黃色系)
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const linearGradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    linearGradient.setAttribute("id", "gaitGradient");
    linearGradient.setAttribute("x1", "0");
    linearGradient.setAttribute("y1", "0");
    linearGradient.setAttribute("x2", "0");
    linearGradient.setAttribute("y2", "1");

    const stop1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#f59e0b");
    stop1.setAttribute("stop-opacity", "0.4");

    const stop2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#f59e0b");
    stop2.setAttribute("stop-opacity", "0");

    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    defs.appendChild(linearGradient);
    svg.appendChild(defs);

    // === 折線與漸層填充 ===
    if (points.length > 1) {
      const pathD = points
        .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
        .join(" ");
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", pathD);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#f59e0b");
      path.setAttribute("stroke-width", "3");
      path.setAttribute("stroke-dasharray", "5,5");
      svg.appendChild(path);

      const fillPathD =
        pathD +
        ` L${points[points.length - 1].x},${svgHeight - padding.bottom} L${
          points[0].x
        },${svgHeight - padding.bottom} Z`;
      const fillPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      fillPath.setAttribute("d", fillPathD);
      fillPath.setAttribute("fill", "url(#gaitGradient)");
      svg.appendChild(fillPath);
    }

    // === 圓點 + 數值文字 ===
    points.forEach((p) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 5);
      circle.setAttribute("fill", "#f59e0b");
      svg.appendChild(circle);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", p.x);
      text.setAttribute("y", p.y - 10);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", "#f59e0b");
      text.textContent = p.value.toFixed(1);
      svg.appendChild(text);
    });

    // === X 軸文字 ===
    points.forEach((p) => {
      const xText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      xText.setAttribute("x", p.x);
      xText.setAttribute("y", svgHeight - 5);
      xText.setAttribute("text-anchor", "middle");
      xText.setAttribute("font-size", "11");
      xText.setAttribute("fill", "#6b7280");
      xText.textContent = `${p.date.getMonth() + 1}/${p.date.getDate()}`;
      svg.appendChild(xText);
    });

    // === Y 軸數字 + 虛線網格 ===
    const yStep = (maxY - minY) / 5;
    for (let i = 0; i <= 5; i++) {
      const yValue = minY + i * yStep;
      const y = padding.top + ((maxY - yValue) / (maxY - minY)) * chartHeight;

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", padding.left - 10);
      text.setAttribute("y", y + 5);
      text.setAttribute("text-anchor", "end");
      text.setAttribute("font-size", "11");
      text.setAttribute("fill", "#6b7280");
      text.textContent = yValue.toFixed(1);
      svg.appendChild(text);

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", padding.left);
      line.setAttribute("x2", svgWidth - padding.right);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "#d1d5db");
      line.setAttribute("stroke-dasharray", "2,2");
      svg.appendChild(line);
    }
  }

  // 曲線圖平均AI跌倒風險機率
  function drawRiskChart(assessments) {
    const svg = document.getElementById("riskChart");
    if (!svg) return;

    svg.innerHTML = "";
    if (!assessments || assessments.length === 0) return;

    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    const padding = { top: 30, right: 20, bottom: 30, left: 50 };

    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // 依 Date 排序
    const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

    // 只取最後 6 筆資料
    const limited = sorted.slice(-6);

    const maxY = Math.max(...limited.map((d) => d.RiskRate)) + 5;
    const minY = Math.min(...limited.map((d) => d.RiskRate)) - 5;

    const points = limited.map((d, i) => {
      const x =
        limited.length === 1
          ? padding.left + chartWidth / 2
          : padding.left + (i / (limited.length - 1)) * chartWidth;
      const y =
        padding.top + ((maxY - d.RiskRate) / (maxY - minY)) * chartHeight;
      return { x, y, value: d.RiskRate, date: new Date(d.Date) };
    });

    // === SVG 漸層 (紅色系) ===
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const linearGradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    linearGradient.setAttribute("id", "riskGradient");
    linearGradient.setAttribute("x1", "0");
    linearGradient.setAttribute("y1", "0");
    linearGradient.setAttribute("x2", "0");
    linearGradient.setAttribute("y2", "1");

    const stop1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#ef4444");
    stop1.setAttribute("stop-opacity", "0.4");

    const stop2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#ef4444");
    stop2.setAttribute("stop-opacity", "0");

    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    defs.appendChild(linearGradient);
    svg.appendChild(defs);

    // === 折線與漸層填充 ===
    if (limited.length > 1) {
      const pathD = points
        .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
        .join(" ");
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", pathD);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#ef4444");
      path.setAttribute("stroke-width", "3");
      path.setAttribute("stroke-dasharray", "5,5");
      svg.appendChild(path);

      const fillPathD =
        pathD +
        ` L${points[points.length - 1].x},${svgHeight - padding.bottom} L${
          points[0].x
        },${svgHeight - padding.bottom} Z`;
      const fillPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      fillPath.setAttribute("d", fillPathD);
      fillPath.setAttribute("fill", "url(#riskGradient)");
      svg.appendChild(fillPath);
    }

    // === 圓點 + 數值 ===
    points.forEach((p) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 5);
      circle.setAttribute("fill", "#ef4444");
      svg.appendChild(circle);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", p.x);
      text.setAttribute("y", p.y - 10);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", "#ef4444");
      text.textContent = p.value.toFixed(1) + "%";
      svg.appendChild(text);
    });

    // === X 軸日期 ===
    points.forEach((p) => {
      const xText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      xText.setAttribute("x", p.x);
      xText.setAttribute("y", svgHeight - 5);
      xText.setAttribute("text-anchor", "middle");
      xText.setAttribute("font-size", "11");
      xText.setAttribute("fill", "#6b7280");
      xText.textContent = `${p.date.getMonth() + 1}/${p.date.getDate()}`;
      svg.appendChild(xText);
    });

    // === Y 軸數字 + 虛線網格 ===
    const yStep = (maxY - minY) / 5;
    for (let i = 0; i <= 5; i++) {
      const yValue = minY + i * yStep;
      const y = padding.top + ((maxY - yValue) / (maxY - minY)) * chartHeight;

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", padding.left - 10);
      text.setAttribute("y", y + 5);
      text.setAttribute("text-anchor", "end");
      text.setAttribute("font-size", "11");
      text.setAttribute("fill", "#6b7280");
      text.textContent = yValue.toFixed(1);
      svg.appendChild(text);

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", padding.left);
      line.setAttribute("x2", svgWidth - padding.right);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "#d1d5db");
      line.setAttribute("stroke-dasharray", "2,2");
      svg.appendChild(line);
    }
  }

  // 曲線圖查無資料
  function drawNoDataChart() {
    const charts = ["sitStandChart", "balanceChart", "gaitChart", "riskChart"];

    charts.forEach((id) => {
      const svgEl = document.getElementById(id);
      if (!svgEl) return;

      // 清空原本的圖表
      svgEl.innerHTML = "";

      // 文字提示
      const xmlns = "http://www.w3.org/2000/svg";
      const text = document.createElementNS(xmlns, "text");
      text.setAttribute("x", "50%");
      text.setAttribute("y", "50%");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", "#888");
      text.setAttribute("font-size", "18");
      text.textContent = "查無資料";

      svgEl.appendChild(text);
    });
  }
});

// 地圖
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: { lat: 25.038, lng: 121.5645 }, // 台北市中心
  });

  fetch("PageSiteAPI.json")
    .then((response) => response.json())
    .then((locations) => {
      const bounds = new google.maps.LatLngBounds();

      locations.forEach((loc) => {
        const position = {
          lat: loc.LatLngCoordinate.Latitude,
          lng: loc.LatLngCoordinate.Longitude,
        };

        const marker = new google.maps.Marker({
          position: position,
          map: map,
          title: loc.Name,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<strong>${loc.Name}</strong>`,
        });
        marker.addListener("click", () => infoWindow.open(map, marker));

        bounds.extend(position);
      });

      map.fitBounds(bounds);
    })
    .catch((err) => console.error("讀取 JSON 錯誤:", err));
}
