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

      // 更新表格 & 卡片
      renderAssessmentTable(currentAssessments);
      updateOnLocationChange();
      updateLatestCountDate(currentAssessments);
    } catch (err) {
      console.error("讀取 JSON 失敗:", err);
    }
  }

  // 初始化下拉選單

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

  function renderAssessmentTable(assessments) {
    assessmentTableBody.innerHTML = "";

    // 先依照 Date 排序（由新到舊）
    const sorted = [...assessments].sort((a, b) => b.Date - a.Date);
    updateDegenerateAndLevels([sorted[0]]);
    // 取最新 4 筆
    const latest = sorted.slice(0, 4);

    latest.forEach((item, index) => {
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
    renderRisk([latest[0]]);

    // checkbox 勾選事件
    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        const checkedIndexes = Array.from(checkboxes)
          .filter((c) => c.checked)
          .map((c) => parseInt(c.dataset.index));

        if (checkedIndexes.length === 0) {
          renderRisk([latest[0]]);
          checkboxes[0].checked = true;
        } else {
          const selected = checkedIndexes.map((i) => currentAssessments[i]);
          renderRisk(selected);
          updateDegenerateAndLevels(selected);
        }
      });
    });
  }

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

  // 桌機按鈕監聽
  document.querySelectorAll(".d-md-flex button").forEach((btn) => {
    btn.addEventListener("click", () => {
      handleRiskFilter(btn.dataset.risk);
    });
  });
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
