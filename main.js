document.addEventListener("DOMContentLoaded", async () => {
  // 語系
  const LANG = {
    zh: {
      alertNoData: "查無資料",
      viewAll: "查看全部",
      prevPage: "上一頁",
      nextPage: "下一頁",
      page: "第",
      total: "頁 / 共",
      sitStand: "坐站平均秒數",
      balanceScore: "平衡分數",
      gaitSpeed: "步行速度",
      fallRisk: "跌倒風險 (%)",
      countWarning: "尚無資料",
      noRecord: "尚無檢測紀錄",
      noMatchedPerson: "目前沒有符合條件的人員",
      startDateText: "自 {year} 年 {month} 月起累計",
      latestDateText: "{date} 檢測",
      generatingPDF: "產生中...",
      downloadPDF: "下載",
    },
    en: {
      alertNoData: "No data",
      viewAll: "View all",
      prevPage: "Previous",
      nextPage: "Next",
      page: "Page",
      total: "of",
      sitStand: "Sit-Stand Avg (s)",
      balanceScore: "Balance Score",
      gaitSpeed: "Gait Speed",
      fallRisk: "Fall Risk (%)",
      countWarning: "No data",
      noRecord: "No test records",
      noMatchedPerson: "No matching participants found",
      startDateText: "Accumulated since {year}/{month}",
      latestDateText: "Measured on {date}",
      generatingPDF: "Generating...",
      downloadPDF: "Download",
    },
    ja: {
      alertNoData: "データなし",
      viewAll: "すべて表示",
      prevPage: "前ページ",
      nextPage: "次ページ",
      page: "第",
      total: "ページ / 全",
      sitStand: "座立平均秒数",
      balanceScore: "バランススコア",
      gaitSpeed: "歩行速度",
      fallRisk: "転倒リスク (%)",
      countWarning: "データなし",
      noRecord: "検査記録なし",
      noMatchedPerson: "条件に一致する参加者がいません",
      startDateText: "{year}年{month}月から累計",
      latestDateText: "{date} 測定",
      generatingPDF: "生成中...",
      downloadPDF: "ダウンロード",
    },
    ko: {
      alertNoData: "데이터 없음",
      viewAll: "모두보기",
      prevPage: "이전",
      nextPage: "다음",
      page: "페이지",
      total: " / 총",
      sitStand: "좌/서 평균 초",
      balanceScore: "균형 점수",
      gaitSpeed: "보행 속도",
      fallRisk: "낙상 위험 (%)",
      countWarning: "데이터 없음",
      noRecord: "검사 기록 없음",
      noMatchedPerson: "조건에 맞는 인원이 없습니다",
      startDateText: "{year}년 {month}월부터 누적",
      latestDateText: "{date} 측정",
      generatingPDF: "생성 중...",
      downloadPDF: "다운로드",
    },
  };

  function t(key) {
    return LANG[window.currentLang][key] || key;
  }

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
    新加坡: "PageAPI-Singapore.json",
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
            <h4 class="fw-semibold text-dark mb-1 masked-name">${maskName(
              person.Name
            )}</h4>
            <p class="small text-muted mb-0">${person.Age}歲 | ${genderText}</p>
          </div>
        </div>
      </div>`;
  }

  // 姓名（顯示圓點）
  function maskName(name) {
    if (!name) return "匿名";
    const len = name.length;

    // 中文姓名
    if (len === 2) {
      return `${name[0]}<span class="dot"></span>`;
    } else if (len === 3) {
      return `${name[0]}<span class="dot"></span>${name[2]}`;
    } else if (len >= 4) {
      return `${name[0]}<span class="dot"></span><span class="dot"></span>${
        name[len - 1]
      }`;
    } else {
      return name;
    }
  }
  // 詳細名單彈窗
  const viewDetailsBtn = document.getElementById("viewDetailsBtn");
  if (viewDetailsBtn) {
    viewDetailsBtn.addEventListener("click", () => {
      let selected = [];

      if (checkAllAcrossPages) {
        // 全選跨頁直接使用整筆資料
        selected = [...currentAssessments];
      } else {
        // 只抓目前頁面勾選
        const checkedIndexes = Array.from(
          document.querySelectorAll(".row-check")
        )
          .filter((c) => c.checked)
          .map((c) => parseInt(c.dataset.index));

        selected = checkedIndexes.map((i) => currentAssessments[i]);
      }

      if (!selected || selected.length === 0) {
        document.getElementById("degenerateGaitSpeed").textContent =
          t("alertNoData");
        document.getElementById("degenerateChair").textContent = "";
        ["vivifrailA", "vivifrailB", "vivifrailC"].forEach((id) => {
          document.getElementById(
            id
          ).innerHTML = `<li class="list-group-item">${t("alertNoData")}</li>`;
        });
      } else {
        let totalGaitSpeed = 0;
        let totalChairSecond = 0;
        selected.forEach((item) => {
          if (item.Degenerate) {
            totalGaitSpeed += item.Degenerate.GaitSpeed || 0;
            totalChairSecond += item.Degenerate.ChairSecond || 0;
          }
        });
        document.getElementById(
          "degenerateGaitSpeed"
        ).textContent = `步行速度衰退：${totalGaitSpeed} 人`;
        document.getElementById(
          "degenerateChair"
        ).textContent = `起坐秒數增加：${totalChairSecond} 人`;

        // 顯示 VIVIFRAIL 名單
        const levels = ["A", "B", "C"];
        levels.forEach((level) => {
          const ul = document.getElementById("vivifrail" + level);
          ul.innerHTML = "";
          let names = [];
          selected.forEach((item) => {
            if (item.VIVIFRAIL && item.VIVIFRAIL[level]) {
              item.VIVIFRAIL[level].forEach((person) => {
                names.push(
                  `${person.Name} (${person.Age}歲, ${
                    person.Gender === 1 ? "男" : "女"
                  })`
                );
              });
            }
          });
          if (names.length === 0) {
            ul.innerHTML = `<li class="list-group-item">${t(
              "alertNoData"
            )}</li>`;
          } else {
            names.forEach((n) => {
              const li = document.createElement("li");
              li.className = "list-group-item";
              li.textContent = n;
              ul.appendChild(li);
            });
          }
        });
      }

      // 彈窗顯示
      const modal = new bootstrap.Modal(
        document.getElementById("detailsModal")
      );
      modal.show();
    });
  }

  // 查看全部彈窗
  viewAllBtn.addEventListener("click", () => {
    const allParticipants = flattenData(mergeAllVIVIFRAIL(currentAssessments));

    renderCards(allParticipants, null, {
      container: modalPersonContainer,
      isModal: true, // 移除12限制
    });

    const modal = new bootstrap.Modal(
      document.getElementById("participantsModal")
    );
    modal.show();
  });

  // 查看全部彈窗桌機按鈕
  const modalFilterBtnsDesktop = document.querySelectorAll(
    "#modalFilterBtnsDesktop button"
  );
  modalFilterBtnsDesktop.forEach((btn) => {
    btn.addEventListener("click", () => {
      const risk = btn.dataset.risk;
      const allParticipants = flattenData(
        mergeAllVIVIFRAIL(currentAssessments)
      );
      renderCards(allParticipants, risk, {
        container: modalPersonContainer,
        isModal: true,
      });
    });
  });

  // 查看全部彈窗手機下拉
  const modalFilterDropdownMobile = document.querySelectorAll(
    "#modalFilterDropdownMobile .dropdown-item"
  );
  modalFilterDropdownMobile.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const risk = item.dataset.risk;
      const allParticipants = flattenData(
        mergeAllVIVIFRAIL(currentAssessments)
      );
      renderCards(allParticipants, risk, {
        container: modalPersonContainer,
        isModal: true,
      });
    });
  });

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
                ${t("alertNoData")}
            </div>
          </td>
        </tr>
      `;
        personContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning text-center" role="alert">
              ${t("alertNoData")}
          </div>
        </div>
      `;
        updateTotalCountAndStartDate([]);
        // 清空其他顯示區域
        latestCountEl.textContent = "0";
        latestDateEl.textContent = t("alertNoData");
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
      removeNoDataOverlay();
      renderAssessmentTable(currentAssessments);
      updateOnLocationChange();
      updateLatestCountDate(currentAssessments);
      updateTotalCountAndStartDate(currentAssessments);

      drawSitStandChartChartJS(currentAssessments);
      drawBalanceChartChartJS(currentAssessments);

      drawRiskChartChartJS(currentAssessments);
      drawGaitChartChartJS(currentAssessments);
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
  let checkAllAcrossPages = false; // 紀錄是否全選
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

    // 整筆資料最新的一筆
    const latest = sorted[0];
    const latestIndex = assessments.indexOf(latest);

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

      const isChecked =
        checkAllAcrossPages || assessments.indexOf(item) === latestIndex;

      tr.innerHTML = `
      <td><input type="checkbox" class="row-check" data-index="${assessments.indexOf(
        item
      )}" ${isChecked ? "checked" : ""}></td>
      <td>${formattedDate}</td>
      <td>${item.Count}人</td>
      <td>${item.ChairSecond.toFixed(1)}秒</td>
      <td>${item.BalanceScore.toFixed(1)}分</td>
      <td>${item.GaitSpeed.toFixed(1)} cm/s</td>
      <td>${item.RiskRate.toFixed(1)}%</td>
    `;
      assessmentTableBody.appendChild(tr);
    });

    // 預設最新一筆或全選時
    if (!checkAllAcrossPages) {
      renderRisk([latest]);
      updateDegenerateAndLevels([latest]);
    } else {
      renderRisk(assessments);
      updateDegenerateAndLevels(assessments);
    }

    // checkbox 勾選事件
    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        const checkedIndexes = Array.from(checkboxes)
          .filter((c) => c.checked)
          .map((c) => parseInt(c.dataset.index));

        if (checkedIndexes.length === 0) {
          showAlert();

          // 取消所有勾選時，保留整筆資料最新一筆
          const latestCheckbox = Array.from(checkboxes).find(
            (c) => parseInt(c.dataset.index) === latestIndex
          );
          if (latestCheckbox) latestCheckbox.checked = true;

          renderRisk([latest]);
          updateDegenerateAndLevels([latest]);
        } else {
          const selected = checkedIndexes.map((i) => assessments[i]);
          renderRisk(selected);
          updateDegenerateAndLevels(selected);

          // 紀錄是否跨頁全選
          checkAllAcrossPages = selected.length === assessments.length;
        }
      });
    });

    // 分頁按鈕
    paginationContainer.innerHTML = "";
    if (totalPages > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.className = "btn btn-sm btn-outline-primary";
      prevBtn.textContent = t("prevPage");
      prevBtn.disabled = currentPage === 1;
      prevBtn.onclick = () => {
        currentPage--;
        renderAssessmentTable(assessments);
      };

      const nextBtn = document.createElement("button");
      nextBtn.className = "btn btn-sm btn-outline-primary";
      nextBtn.textContent = t("nextPage");
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.onclick = () => {
        currentPage++;
        renderAssessmentTable(assessments);
      };
      const pageInfo = document.createElement("span");
      pageInfo.className = "small text-center flex-grow-1";
      pageInfo.textContent = `${t("page")} ${currentPage} ${t(
        "total"
      )} ${totalPages}`;

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

  // 「全選」按鈕
  document.getElementById("checkAllBtn").addEventListener("click", () => {
    checkAllAcrossPages = true;

    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => (cb.checked = true));

    renderRisk(currentAssessments);
    updateDegenerateAndLevels(currentAssessments);
  });

  // 「取消全選」按鈕
  document.getElementById("uncheckAllBtn").addEventListener("click", () => {
    checkAllAcrossPages = false;

    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => (cb.checked = false));

    if (currentAssessments.length > 0) {
      const latest = [...currentAssessments].sort((a, b) => b.Date - a.Date)[0];
      const latestIndex = currentAssessments.indexOf(latest);

      checkboxes.forEach((cb) => {
        if (parseInt(cb.dataset.index) === latestIndex) {
          cb.checked = true;
        }
      });

      renderRisk([latest]);
      updateDegenerateAndLevels([latest]);
    }
  });

  // 顯示提示訊息
  function showAlert() {
    const alertBox = document.getElementById("alertBox");
    alertBox.classList.remove("d-none");
    setTimeout(() => {
      alertBox.classList.add("d-none");
    }, 3000);
  }

  // 「全選」按鈕
  document.getElementById("checkAllBtn").addEventListener("click", () => {
    checkAllAcrossPages = true; // 設定跨頁全選

    // 把目前畫面上的 checkbox 都勾選
    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => (cb.checked = true));

    renderRisk(currentAssessments);
    updateDegenerateAndLevels(currentAssessments);
  });

  // 「取消全選」按鈕
  document.getElementById("uncheckAllBtn").addEventListener("click", () => {
    checkAllAcrossPages = false; // 取消跨頁全選

    // 先取消所有 checkbox
    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => (cb.checked = false));

    // 保留整筆資料最新一筆
    if (currentAssessments.length > 0) {
      // 找出日期最新的一筆
      const latest = [...currentAssessments].sort((a, b) => b.Date - a.Date)[0];

      checkboxes.forEach((cb) => {
        if (parseInt(cb.dataset.index) === currentAssessments.indexOf(latest)) {
          cb.checked = true;
        }
      });

      renderRisk([latest]);
      updateDegenerateAndLevels([latest]);
    }
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
      latestDateEl.textContent = t("latestDateText").replace(
        "{date}",
        formattedDate
      );
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
      if (startDateTextEl) startDateTextEl.textContent = t("countWarning");
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
      startDateTextEl.textContent = t("startDateText")
        .replace("{year}", startYear)
        .replace("{month}", startMonth);
  }

  // 人員卡片 (最多 12 個，按 A->B->C->D 排序)
  function renderCards(allVIVIFRAIL, filterRisk = null, options = {}) {
    const container = options.container || personContainer;
    const isModal = options.isModal || false;

    container.innerHTML = "";

    let persons = allVIVIFRAIL;
    if (filterRisk && filterRisk !== "all") {
      persons = persons.filter((p) => getRiskCategory(p.Risk) === filterRisk);
    }

    const levelOrder = { A: 1, B: 2, C: 3, D: 4 };
    persons.sort((a, b) => levelOrder[a.Level] - levelOrder[b.Level]);

    // 只有非彈窗限制 12 個
    if (!isModal) {
      const showAllBtn = persons.length > 12;
      updateViewAllBtn(showAllBtn);
      persons = persons.slice(0, 12);
    }

    if (persons.length === 0) {
      container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-secondary text-center" role="alert">
          ${t("noMatchedPerson")}
        </div>
      </div>`;
      return;
    }

    container.innerHTML = persons.map(createPersonCard).join("");
    if (!isModal) updateRiskButtonsCounts(allVIVIFRAIL);
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

  const fp = flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    locale: "zh_tw",
    onChange: function (selectedDates, dateStr, instance) {
      if (selectedDates.length === 2) {
        let start = selectedDates[0];
        let end = selectedDates[1];

        filterByDate(start, end);
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
           ${t("alertNoData")}
        </div>
      </td>
    </tr>
  `;
      personContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning text-center" role="alert">
          ${t("alertNoData")}
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

      drawSitStandChartChartJS(filtered);
      drawBalanceChartChartJS(filtered);
      drawGaitChartChartJS(filtered);
      drawRiskChartChartJS(filtered);
    }
  }

  // 清除按鈕
  document.getElementById("clearBtn").addEventListener("click", () => {
    fp.clear();

    //清除後顯示全部資料
    if (currentAssessments.length > 0) {
      renderAssessmentTable(currentAssessments);
      updateOnLocationChange();
      updateLatestCountDate(currentAssessments);
      removeNoDataOverlay();
      const filterBtnsDesktop = document.querySelector(".filterBtnsDesktop");
      const filterDropdownMobile = document.querySelector(
        ".filterDropdownMobile"
      );
      const viewAllBtn = document.getElementById("viewAllBtn");

      filterBtnsDesktop.classList.remove("hidden-by-filter");
      filterDropdownMobile.classList.remove("hidden-by-filter");
      viewAllBtn.classList.remove("hidden-by-filter");

      drawSitStandChartChartJS(currentAssessments);
      drawBalanceChartChartJS(currentAssessments);
      drawGaitChartChartJS(currentAssessments);
      drawRiskChartChartJS(currentAssessments);
    }
  });

  // 新曲線圖坐站平均秒數
  function drawSitStandChartChartJS(assessments) {
    const ctx = document.getElementById("sitStandChartCanvas");
    if (!ctx) return;

    if (!assessments || assessments.length === 0) {
      ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
      return;
    }

    // 依日期排序
    const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

    // 完整資料
    const labels = sorted.map((d) => {
      const date = new Date(d.Date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const dataValues = sorted.map((d) => d.ChairSecond);

    // 如果之前已有圖表，先銷毀
    if (window.sitStandChartInstance) {
      window.sitStandChartInstance.destroy();
    }

    // 建立圖表
    window.sitStandChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels, // 全部資料
        datasets: [
          {
            label: t("sitStand"),
            data: dataValues,
            borderColor: "#10b981",
            backgroundColor: "rgba(16,185,129,0.3)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                const dateObj = sorted[context.dataIndex]
                  ? new Date(sorted[context.dataIndex].Date)
                  : null;
                const fullDate = dateObj
                  ? `${dateObj.getFullYear()}/${
                      dateObj.getMonth() + 1
                    }/${dateObj.getDate()}`
                  : labels[context.dataIndex];

                return `${fullDate}：${value.toFixed(1)} 秒`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "日期" },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 7, // 最多顯示 7 個刻度
            },
          },
          y: {
            title: { display: true, text: t("sitStand") },
            beginAtZero: false,
          },
        },
      },
    });
  }

  // 新曲線圖平衡測驗得分
  function drawBalanceChartChartJS(assessments) {
    const ctx = document.getElementById("balanceChartCanvas");
    if (!ctx) return;

    if (!assessments || assessments.length === 0) {
      ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
      return;
    }

    // 依日期排序
    const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

    const labels = sorted.map((d) => {
      const date = new Date(d.Date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const dataValues = sorted.map((d) => d.BalanceScore);

    // 如果之前已有圖表，先銷毀
    if (window.balanceChartInstance) {
      window.balanceChartInstance.destroy();
    }

    window.balanceChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels, // 全部資料
        datasets: [
          {
            label: t("balanceScore"),
            data: dataValues,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.3)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                const dateObj = sorted[context.dataIndex]
                  ? new Date(sorted[context.dataIndex].Date)
                  : null;
                const fullDate = dateObj
                  ? `${dateObj.getFullYear()}/${
                      dateObj.getMonth() + 1
                    }/${dateObj.getDate()}`
                  : labels[context.dataIndex];

                return `${fullDate}：${value.toFixed(1)} 秒`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "日期" },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 7, // 最多顯示 7 個刻度
            },
          },
          y: {
            title: { display: true, text: t("balanceScore") },
            beginAtZero: false,
          },
        },
      },
    });
  }
  // 新曲線圖步行速度趨勢
  function drawGaitChartChartJS(assessments) {
    const ctx = document.getElementById("gaitChartCanvas");
    if (!ctx) return;

    if (!assessments || assessments.length === 0) {
      ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
      return;
    }

    // 依日期排序
    const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

    const labels = sorted.map((d) => {
      const date = new Date(d.Date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const dataValues = sorted.map((d) => d.GaitSpeed);

    if (window.gaitChartInstance) {
      window.gaitChartInstance.destroy();
    }

    window.gaitChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: t("gaitSpeed"),
            data: dataValues,
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245,158,11,0.3)",
            fill: true,
            tension: 0.3,
            pointRadius: 0, // 圓點隱藏
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                const dateObj = sorted[context.dataIndex]
                  ? new Date(sorted[context.dataIndex].Date)
                  : null;
                const fullDate = dateObj
                  ? `${dateObj.getFullYear()}/${
                      dateObj.getMonth() + 1
                    }/${dateObj.getDate()}`
                  : labels[context.dataIndex];

                return `${fullDate}：${value.toFixed(1)} 秒`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "日期" },
            ticks: { autoSkip: true, maxTicksLimit: 7 },
          },
          y: {
            title: { display: true, text: t("gaitSpeed") },
            beginAtZero: false,
          },
        },
      },
    });
  }

  // 新曲線圖平均AI跌倒風險機率
  function drawRiskChartChartJS(assessments) {
    const ctx = document.getElementById("riskChartCanvas");
    if (!ctx) return;

    if (!assessments || assessments.length === 0) {
      ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
      return;
    }

    // 依日期排序
    const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

    const labels = sorted.map((d) => {
      const date = new Date(d.Date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const dataValues = sorted.map((d) => d.RiskRate);

    // 如果之前已有圖表，先銷毀
    if (window.riskChartInstance) {
      window.riskChartInstance.destroy();
    }

    window.riskChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels, // 全部資料
        datasets: [
          {
            label: t("fallRisk"),
            data: dataValues,
            borderColor: "#ef4444",
            backgroundColor: "rgba(239,68,68,0.3)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                const dateObj = sorted[context.dataIndex]
                  ? new Date(sorted[context.dataIndex].Date)
                  : null;
                const fullDate = dateObj
                  ? `${dateObj.getFullYear()}/${
                      dateObj.getMonth() + 1
                    }/${dateObj.getDate()}`
                  : labels[context.dataIndex];

                return `${fullDate}：${value.toFixed(1)} 秒`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "日期" },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 7, // 最多顯示 7 個刻度
            },
          },
          y: {
            title: { display: true, text: t("fallRisk") },
            beginAtZero: false,
          },
        },
      },
    });
  }
  // 曲線圖查無資料
  function drawNoDataChart() {
    const charts = [
      "sitStandChartCanvas",
      "balanceChartCanvas",
      "gaitChartCanvas",
      "riskChartCanvas",
    ];

    charts.forEach((id) => {
      const canvas = document.getElementById(id);
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 清空畫布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#888";
      ctx.font = "18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // 顯示文字
      ctx.fillText(t("alertNoData"), canvas.width / 2, canvas.height / 2);

      // 加上遮罩防止滑鼠觸碰折線圖顯示問題
      if (!canvas.parentElement.querySelector(".no-data-overlay")) {
        const overlay = document.createElement("div");
        overlay.classList.add("no-data-overlay");
        Object.assign(overlay.style, {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          pointerEvents: "auto",
          zIndex: 10,
        });

        canvas.parentElement.style.position = "relative";
        canvas.parentElement.appendChild(overlay);
      }
    });
  }
  // 移除遮罩
  function removeNoDataOverlay() {
    document
      .querySelectorAll(".no-data-overlay")
      .forEach((overlay) => overlay.remove());
  }

  // 下載功能
  const btn = document.getElementById("downloadBtn");

  if (btn) {
    btn.addEventListener("click", async () => {
      const page = document.body;
      btn.disabled = true;
      btn.innerHTML = `<i class="bi bi-hourglass-split me-1"></i> ${t(
        "generatingPDF"
      )}`;

      try {
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          windowWidth: document.documentElement.scrollWidth,
          windowHeight: document.documentElement.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // 取得圖片的實際尺寸比例
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let finalWidth = imgWidth;
        let finalHeight = imgHeight;
        if (imgHeight > pageHeight) {
          const ratio = pageHeight / imgHeight;
          finalWidth = imgWidth * ratio;
          finalHeight = pageHeight;
        }

        const x = (pageWidth - finalWidth) / 2;
        const y = 0;

        pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

        const fileName = `Dashboard_${new Date().toLocaleDateString(
          "zh-TW"
        )}.pdf`;
        pdf.save(fileName);
      } catch (error) {
        console.error("PDF 產生失敗：", error);
        alert("產生 PDF 時發生錯誤，請稍後再試。");
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-download me-1"></i> ${t(
          "downloadPDF"
        )}`;
      }
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
