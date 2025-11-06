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
      startDateText: "自 {yearMonth} ",
      latestDateText: "{date} 檢測",
      generatingPDF: "產生中...",
      downloadPDF: "下載",
      male: "男",
      female: "女",
      yearsOld: "歲",
      people: "人",
      seconds: "秒",
      points: "分",
      gaitSpeed: "cm/s",
      fallRisk: "％",
      walkDecline: "步行速度衰退",
      sitStandIncrease: "起坐秒數增加",
      vivifrailA: "A級失能者",
      vivifrailB: "B級衰弱者",
      vivifrailC: "C級衰弱前期者",
      overview: "總表",
      riskLabel: {
        high: "危險",
        slightlyHigh: "高",
        medium: "中",
        slightlyLow: "稍低",
        low: "低",
        unknown: "未知",
      },
      name: "姓名",
      genderLabel: "性別",
      ageLabel: "年齡",
      riskLevel: "等級",
      dates: "日期",
      degenerateWarning: "功能衰退警示 (較前次檢測衰退超過10%)",
      highRiskGroup: "高風險族群",
      all: "全部",
      month: "月",
      noDataThisMonth: "本月無資料",
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
      startDateText: "Accumulated since {yearMonth}",
      latestDateText: "Measured on {date}",
      generatingPDF: "Generating...",
      downloadPDF: "Download",
      male: "Male",
      female: "Female",
      yearsOld: "years old",
      people: "people",
      seconds: "s",
      points: "pts",
      gaitSpeed: "cm/s",
      fallRisk: "％",
      walkDecline: "Gait speed decline",
      sitStandIncrease: "Sit-stand time increase",
      vivifrailA: "Level A disabled",
      vivifrailB: "Level B frail",
      vivifrailC: "Level C pre-frail",
      overview: "Overview",
      riskLabel: {
        high: "Danger",
        slightlyHigh: "high",
        medium: "middle",
        slightlyLow: "Slightly lower",
        low: "Low",
        unknown: "Unknown",
      },
      name: "Name",
      genderLabel: "Gender",
      ageLabel: "Age",
      riskLevel: "Level",
      dates: "Date",
      degenerateWarning: "Degeneration Warning (decline > 10% since last test)",
      highRiskGroup: "High-Risk Group",
      all: "All",
      month: "Month",
      noDataThisMonth: "No data this month",
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
      startDateText: "以来{yearMonth}",
      latestDateText: "{date} 測定",
      generatingPDF: "生成中...",
      downloadPDF: "ダウンロード",
      male: "男性",
      female: "女性",
      yearsOld: "歳",
      people: "人",
      seconds: "秒",
      points: "点",
      gaitSpeed: "cm/s",
      fallRisk: "％",
      walkDecline: "歩行速度の低下",
      sitStandIncrease: "起立時間の増加",
      vivifrailA: "A級失能者",
      vivifrailB: "B級衰弱者",
      vivifrailC: "C級衰弱前期者",
      overview: "総表",
      riskLabel: {
        high: "危険",
        slightlyHigh: "高い",
        medium: "真ん中",
        slightlyLow: "わずかに低い",
        low: "低い",
        unknown: "不明",
      },
      name: "名前",
      genderLabel: "性別",
      ageLabel: "年齢",
      riskLevel: "等級",
      dates: "日付",
      degenerateWarning: "機能衰退警告（前回検査より10％以上低下）",
      highRiskGroup: "高リスク群",
      all: "すべて",
      month: "月",
      noDataThisMonth: "今月データなし",
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
      startDateText: "이래{yearMonth}",
      latestDateText: "{date} 측정",
      generatingPDF: "생성 중...",
      downloadPDF: "다운로드",
      male: "남성",
      female: "여성",
      yearsOld: "세",
      people: "명",
      seconds: "초",
      points: "점",
      gaitSpeed: "cm/s",
      fallRisk: "％",
      walkDecline: "보행 속도 감소",
      sitStandIncrease: "기립 시간 증가",
      vivifrailA: "A등급 장애자",
      vivifrailB: "B등급 허약자",
      vivifrailC: "C등급 허약 전기자",
      overview: "전체표",
      riskLabel: {
        high: "위험",
        slightlyHigh: "높은",
        medium: "가운데",
        slightlyLow: "약간 낮음",
        low: "낮은",
        unknown: "알 수 없음",
      },
      name: "이름",
      genderLabel: "성별",
      ageLabel: "나이",
      riskLevel: "등급",
      dates: "날짜",
      degenerateWarning: "기능 저하 경고 (이전 검사 대비 10% 이상 감소)",
      highRiskGroup: "고위험군",
      all: "전체",
      month: "월",
      noDataThisMonth: "이번 달 데이터 없음",
    },
  };

  function t(key) {
    return LANG[window.currentLang][key] || key;
  }

  const dropdownButton = document.getElementById("dropdownMenuButton");
  if (dropdownButton) dropdownButton.textContent = t("overview");
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
    新加坡: "PageAPI-Singapore.json",
    全成: "PageAPI-全成.json",
  };

  // VIVIFRAIL 陣列
  function flattenData(VIVIFRAIL) {
    const result = [];

    // 展平所有 A~D
    Object.values(VIVIFRAIL).forEach((group) => {
      group.forEach((p) => result.push({ ...p, Level: p.Level || "" }));
    });

    // 依風險排序
    const riskOrder = ["high", "slightlyHigh", "medium", "slightlyLow", "low"];
    result.sort((a, b) => {
      const aCategory = getRiskCategory(a.Risk);
      const bCategory = getRiskCategory(b.Risk);
      return riskOrder.indexOf(aCategory) - riskOrder.indexOf(bCategory);
    });

    return result;
  }

  // 依照 Risk 數值判斷分類

  function getRiskCategory(risk) {
    if (risk > 50) return "high"; // 危險
    if (risk > 30) return "slightlyHigh"; // 稍高
    if (risk > 17.5) return "medium"; // 中
    if (risk > 5) return "slightlyLow"; // 稍低
    return "low"; // 低
  }

  // 建立人員卡片
  function createPersonCard(person) {
    const genderText = person.Gender === 0 ? t("female") : t("male");
    const riskCategory = getRiskCategory(person.Risk);

    const riskStyles = {
      high: {
        face: "#ff5757",
        border: "#dc3545",
        label: t("riskLabel").high,
      },
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
      low: {
        face: "#4ffa00",
        border: "#198754",
        label: t("riskLabel").low,
      },
    };

    const style = riskStyles[riskCategory] || {
      face: "#E5E7EB",
      border: "#6c757d",
      label: t("riskLabel").unknown,
    };

    //  判斷嘴巴表情
    let mouthPath = "";
    if (riskCategory === "low") {
      // 笑臉
      mouthPath = "M40 65 Q50 75 60 65";
    } else if (riskCategory === "slightlyLow") {
      // 直線
      mouthPath = "M40 65 L60 65";
    } else {
      // 哭臉
      mouthPath = "M40 65 Q50 55 60 65";
    }

    return `
  <div class="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
    <div class="person-card bg-white rounded shadow-sm h-100"
         style="border: 3px solid ${style.border};"
         data-person="${person.Name}"
         data-age="${person.Age}"
         data-gender="${genderText}"
         data-risk="${riskCategory}">
      <div class="position-relative">
        <!-- SVG 簡單人臉 -->
        <svg class="w-100" height="130" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="30" fill="${style.face}" />
          <circle cx="40" cy="45" r="5" fill="#4B5563" />
          <circle cx="60" cy="45" r="5" fill="#4B5563" />
          <path d="${mouthPath}" fill="none" stroke="#4B5563" stroke-width="3" stroke-linecap="round" />
        </svg>

        <!-- 右上角顯示風險文字 -->
        <div class="position-absolute top-0 end-0 text-white small px-2 py-1 rounded-0 rounded-start"
             style="background-color:${style.border};">
          ${style.label}
        </div>
      </div>

      <!-- 人員基本資訊 -->
      <div class="p-2 text-center">
        <h4 class="fw-semibold text-dark mb-1 masked-name">${maskName(
          person.Name
        )}</h4>
        <p class="small text-muted mb-0">${person.Age}${t(
      "yearsOld"
    )} | ${genderText}</p>
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
        selected = [...currentAssessments];
      } else {
        const checkedIndexes = Array.from(
          document.querySelectorAll(".row-check")
        )
          .filter((c) => c.checked)
          .map((c) => parseInt(c.dataset.index));

        selected = checkedIndexes.map((i) => currentAssessments[i]);
      }

      const modalBody = document.querySelector("#detailsModal .modal-body");
      modalBody.innerHTML = "";

      if (!selected || selected.length === 0) {
        modalBody.innerHTML = `<div class="text-center text-muted">${t(
          "alertNoData"
        )}</div>`;
      } else {
        // ===== 功能衰退統計 =====
        let totalGaitSpeed = 0;
        let totalChairSecond = 0;
        let gaitNames = [];
        let chairNames = [];

        function getAllNames(vivifrail) {
          const levels = ["A", "B", "C"];
          const names = [];
          levels.forEach((lvl) => {
            if (vivifrail[lvl]) {
              vivifrail[lvl].forEach((p) => {
                if (p.Name) names.push(p.Name);
              });
            }
          });
          return names;
        }

        selected.forEach((item) => {
          if (item.Degenerate) {
            const allNames = item.VIVIFRAIL
              ? getAllNames(item.VIVIFRAIL)
              : [t("unknown")];
            if (item.Degenerate.GaitSpeed) {
              totalGaitSpeed += item.Degenerate.GaitSpeed;
              gaitNames.push(...allNames);
            }
            if (item.Degenerate.ChairSecond) {
              totalChairSecond += item.Degenerate.ChairSecond;
              chairNames.push(...allNames);
            }
          }
        });

        const degenerateHtml = `
        <div class="mb-4">
          <h6 class="fw-bold">${t("degenerateWarning")}</h6>
          <div class="row g-2">
            <div class="col-12 col-md-6">
              <div class="card">
                <div class="card-header">${t(
                  "walkDecline"
                )} (${totalGaitSpeed})</div>
                <ul id="degenerateGaitSpeed" class="list-group list-group-flush">
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
                <ul id="degenerateChair" class="list-group list-group-flush">
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
        modalBody.innerHTML += degenerateHtml;

        // ===== 年份下拉 + 標題 =====
        modalBody.innerHTML += `<div class="mb-2 fw-bold">${t(
          "highRiskGroup"
        )}</div>`;

        const startYear = 1900;
        const endYear = new Date().getFullYear();
        const years = [];
        for (let y = startYear; y <= endYear; y++) years.push(y);
        const currentYear = new Date().getFullYear();

        modalBody.innerHTML += `
        <div class="mb-2">
          <select id="yearSelect" class="form-select form-select-sm w-auto">
            ${years
              .map(
                (y) =>
                  `<option value="${y}" ${
                    y === currentYear ? "selected" : ""
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

        function renderMonthButtons(year) {
          monthButtonsContainer.innerHTML = "";

          // 「全部」按鈕
          const allBtn = document.createElement("button");
          allBtn.className = "btn btn-outline-secondary btn-sm active";
          allBtn.textContent = t("all");
          monthButtonsContainer.appendChild(allBtn);
          allBtn.addEventListener("click", () => {
            renderAllLevels();
            monthButtonsContainer
              .querySelectorAll("button")
              .forEach((b) => b.classList.remove("active"));
            allBtn.classList.add("active");
          });

          // 月份按鈕
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
            btn.className = "btn btn-outline-primary btn-sm";
            btn.dataset.month = m;

            if (window.currentLang === "en") {
              btn.textContent = monthNamesEN[m - 1]; // 英文縮寫
            } else {
              btn.textContent = `${m} ${t("month")}`; // 其他語系仍是 "1 月"、"2 月"...
            }

            monthButtonsContainer.appendChild(btn);

            btn.addEventListener("click", () => {
              renderMonth(year, m);
              monthButtonsContainer
                .querySelectorAll("button")
                .forEach((b) => b.classList.remove("active"));
              btn.classList.add("active");
            });
          }

          // 預設顯示「全部」
          renderAllLevels();
        }

        function renderAllLevels() {
          monthContent.innerHTML = "";
          const levels = ["A", "B", "C"];
          const levelTitles = {
            A: t("vivifrailA"),
            B: t("vivifrailB"),
            C: t("vivifrailC"),
          };
          const levelColors = { A: "danger", B: "warning", C: "primary" };

          // 使用 row g-2, 3 col-4 併排
          let html = "";
          levels.forEach((level) => {
            let names = [];
            selected.forEach((item) => {
              if (item.VIVIFRAIL && item.VIVIFRAIL[level]) {
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

        function renderMonth(year, month = null) {
          monthContent.innerHTML = "";

          const items = selected.filter((item) => {
            if (!item.Date) return false;
            const d = new Date(item.Date);
            if (month)
              return (
                d.getFullYear() === parseInt(year) && d.getMonth() + 1 === month
              );
            return d.getFullYear() === parseInt(year);
          });

          if (!items || items.length === 0) {
            monthContent.innerHTML = `<div class="text-center text-muted">${t(
              "noDataThisMonth"
            )}</div>`;
            return;
          }

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
              const dateHtml = `<div class="mb-3 p-2 bg-light rounded">
              <h6 class="fw-bold mb-2">${date}</h6>
              <div class="row g-2">
                ${levels
                  .map((level) => {
                    const names = [];
                    dateItems.forEach((item) => {
                      if (item.VIVIFRAIL && item.VIVIFRAIL[level]) {
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
                          names.push({
                            nameLine: `${person.Name} (${ageText}, ${genderText})`,
                            dateLine: date,
                          });
                        });
                      }
                    });

                    return `<div class="col-12 col-md-4">
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
                                      `<li class="list-group-item"><div>${n.nameLine}</div></li>`
                                  )
                                  .join("")
                              : `<li class="list-group-item text-muted">${t(
                                  "alertNoData"
                                )}</li>`
                          }
                        </ul>
                      </div>
                    </div>`;
                  })
                  .join("")}
              </div>
            </div>`;
              monthContent.innerHTML += dateHtml;
            });
        }

        renderMonthButtons(parseInt(yearSelect.value));
        yearSelect.addEventListener("change", (e) =>
          renderMonthButtons(e.target.value)
        );
      }

      const modal = new bootstrap.Modal(
        document.getElementById("detailsModal")
      );
      modal.show();
    });
  }

  // const viewDetailsBtn = document.getElementById("viewDetailsBtn");
  // if (viewDetailsBtn) {
  //   viewDetailsBtn.addEventListener("click", () => {
  //     let selected = [];

  //     if (checkAllAcrossPages) {
  //       selected = [...currentAssessments];
  //     } else {
  //       const checkedIndexes = Array.from(
  //         document.querySelectorAll(".row-check")
  //       )
  //         .filter((c) => c.checked)
  //         .map((c) => parseInt(c.dataset.index));

  //       selected = checkedIndexes.map((i) => currentAssessments[i]);
  //     }

  //     const modalBody = document.querySelector("#detailsModal .modal-body");
  //     modalBody.innerHTML = "";

  //     if (!selected || selected.length === 0) {
  //       modalBody.innerHTML = `<div class="text-center text-muted">${t(
  //         "alertNoData"
  //       )}</div>`;
  //     } else {
  //       // 功能衰退統計
  //       let totalGaitSpeed = 0;
  //       let totalChairSecond = 0;
  //       let gaitNames = [];
  //       let chairNames = [];

  //       function getAllNames(vivifrail) {
  //         const levels = ["A", "B", "C"];
  //         const names = [];
  //         levels.forEach((lvl) => {
  //           if (vivifrail[lvl]) {
  //             vivifrail[lvl].forEach((p) => {
  //               if (p.Name) names.push(p.Name);
  //             });
  //           }
  //         });
  //         return names;
  //       }

  //       selected.forEach((item) => {
  //         if (item.Degenerate) {
  //           const allNames = item.VIVIFRAIL
  //             ? getAllNames(item.VIVIFRAIL)
  //             : [t("unknown")];

  //           if (item.Degenerate.GaitSpeed) {
  //             totalGaitSpeed += item.Degenerate.GaitSpeed;
  //             gaitNames.push(...allNames);
  //           }

  //           if (item.Degenerate.ChairSecond) {
  //             totalChairSecond += item.Degenerate.ChairSecond;
  //             chairNames.push(...allNames);
  //           }
  //         }
  //       });

  //       // 功能衰退區塊
  //       const degenerateHtml = `
  //     <div class="mb-4">
  //       <h6 class="fw-bold">功能衰退警示 (較前次檢測衰退超過10%)</h6>
  //       <div class="row g-2">
  //         <div class="col-12 col-md-6">
  //           <div class="card">
  //             <div class="card-header">步行速度衰退 (${totalGaitSpeed})</div>
  //             <ul id="degenerateGaitSpeed" class="list-group list-group-flush">
  //               ${
  //                 gaitNames.length
  //                   ? gaitNames
  //                       .map((n) => `<li class="list-group-item">${n}</li>`)
  //                       .join("")
  //                   : `<li class="list-group-item text-muted">${t(
  //                       "alertNoData"
  //                     )}</li>`
  //               }
  //             </ul>
  //           </div>
  //         </div>
  //         <div class="col-12 col-md-6">
  //           <div class="card">
  //             <div class="card-header">起坐秒數增加 (${totalChairSecond})</div>
  //             <ul id="degenerateChair" class="list-group list-group-flush">
  //               ${
  //                 chairNames.length
  //                   ? chairNames
  //                       .map((n) => `<li class="list-group-item">${n}</li>`)
  //                       .join("")
  //                   : `<li class="list-group-item text-muted">${t(
  //                       "alertNoData"
  //                     )}</li>`
  //               }
  //             </ul>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     `;
  //       modalBody.innerHTML += degenerateHtml;

  //       // 年份範圍
  //       const startYear = 1900;
  //       const endYear = new Date().getFullYear();
  //       const years = [];
  //       for (let y = startYear; y <= endYear; y++) years.push(y);
  //       const currentYear = new Date().getFullYear();
  //       const currentMonth = 1; // 預設 1 月

  //       const yearHtml = `
  //     <div class="mb-2">
  //       <select id="yearSelect" class="form-select form-select-sm w-auto">
  //         ${years
  //           .map(
  //             (y) =>
  //               `<option value="${y}" ${
  //                 y === currentYear ? "selected" : ""
  //               }>${y}</option>`
  //           )
  //           .join("")}
  //       </select>
  //     </div>
  //     `;
  //       modalBody.innerHTML += yearHtml;

  //       // 月份按鈕區
  //       modalBody.innerHTML += `<div id="monthButtons" class="mb-3 d-flex flex-wrap gap-1"></div>`;
  //       modalBody.innerHTML += `<div id="monthContent"></div>`;

  //       const monthButtonsContainer = modalBody.querySelector("#monthButtons");
  //       const monthContent = modalBody.querySelector("#monthContent");
  //       const yearSelect = modalBody.querySelector("#yearSelect");

  //       function renderMonthButtons(year) {
  //         monthButtonsContainer.innerHTML = "";

  //         // 新增「全部」按鈕
  //         const allBtn = document.createElement("button");
  //         allBtn.className = "btn btn-outline-secondary btn-sm";
  //         allBtn.textContent = "全部";
  //         monthButtonsContainer.appendChild(allBtn);
  //         allBtn.addEventListener("click", () => {
  //           renderMonth(year, null); // null 代表不篩選月份
  //           monthButtonsContainer
  //             .querySelectorAll("button")
  //             .forEach((b) => b.classList.remove("active"));
  //           allBtn.classList.add("active");
  //         });

  //         for (let m = 1; m <= 12; m++) {
  //           const btn = document.createElement("button");
  //           btn.className = "btn btn-outline-primary btn-sm";
  //           btn.dataset.month = m;
  //           btn.textContent = `${m} 月`;
  //           monthButtonsContainer.appendChild(btn);

  //           btn.addEventListener("click", () => {
  //             renderMonth(year, m);
  //             monthButtonsContainer
  //               .querySelectorAll("button")
  //               .forEach((b) => b.classList.remove("active"));
  //             btn.classList.add("active");
  //           });
  //         }

  //         // 預設 active：1 月
  //         const defaultMonthBtn =
  //           monthButtonsContainer.querySelector(
  //             `button[data-month="${currentMonth}"]`
  //           ) || monthButtonsContainer.querySelector("button");
  //         defaultMonthBtn.classList.add("active");
  //         renderMonth(year, parseInt(defaultMonthBtn.dataset.month));
  //       }

  //       function renderMonth(year, month = null) {
  //         monthContent.innerHTML = "";

  //         const items = selected.filter((item) => {
  //           if (!item.Date) return false;
  //           const d = new Date(item.Date);
  //           if (month) {
  //             return (
  //               d.getFullYear() === parseInt(year) && d.getMonth() + 1 === month
  //             );
  //           }
  //           return d.getFullYear() === parseInt(year);
  //         });

  //         if (!items || items.length === 0) {
  //           monthContent.innerHTML = `<div class="text-center text-muted">本月無資料</div>`;
  //           return;
  //         }

  //         const levels = ["A", "B", "C"];
  //         const levelTitles = {
  //           A: t("vivifrailA"),
  //           B: t("vivifrailB"),
  //           C: t("vivifrailC"),
  //         };
  //         const levelColors = { A: "danger", B: "warning", C: "primary" };

  //         // 分日期
  //         const groupedByDate = {};
  //         items.forEach((item) => {
  //           const dateKey = item.Date
  //             ? new Date(item.Date).toLocaleDateString()
  //             : t("unknown");
  //           if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
  //           groupedByDate[dateKey].push(item);
  //         });

  //         Object.keys(groupedByDate)
  //           .sort((a, b) => new Date(a) - new Date(b))
  //           .forEach((date) => {
  //             const dateItems = groupedByDate[date];
  //             const dateHtml = `<div class="mb-3 p-2 bg-light rounded">
  //           <h6 class="fw-bold mb-2">${date}</h6>
  //           <div class="row g-2">
  //             ${levels
  //               .map((level) => {
  //                 const names = [];
  //                 dateItems.forEach((item) => {
  //                   if (item.VIVIFRAIL && item.VIVIFRAIL[level]) {
  //                     item.VIVIFRAIL[level].forEach((person) => {
  //                       const ageText = person.Age
  //                         ? `${person.Age}${t("yearsOld")}`
  //                         : t("unknown");
  //                       const genderText =
  //                         person.Gender === 0
  //                           ? t("male")
  //                           : person.Gender === 1
  //                           ? t("female")
  //                           : t("unknown");
  //                       names.push({
  //                         nameLine: `${person.Name} (${ageText}, ${genderText})`,
  //                         dateLine: date,
  //                       });
  //                     });
  //                   }
  //                 });

  //                 return `<div class="col-12 col-md-4">
  //                 <div class="card">
  //                   <div class="card-header bg-${
  //                     levelColors[level]
  //                   } text-white">${levelTitles[level]} (${names.length})</div>
  //                   <ul class="list-group list-group-flush">
  //                     ${
  //                       names.length
  //                         ? names
  //                             .map(
  //                               (n) =>
  //                                 `<li class="list-group-item"><div>${n.nameLine}</div><div class="text-muted small">${n.dateLine}</div></li>`
  //                             )
  //                             .join("")
  //                         : `<li class="list-group-item text-muted">${t(
  //                             "alertNoData"
  //                           )}</li>`
  //                     }
  //                   </ul>
  //                 </div>
  //               </div>`;
  //               })
  //               .join("")}
  //           </div>
  //         </div>`;
  //             monthContent.innerHTML += dateHtml;
  //           });
  //       }

  //       renderMonthButtons(parseInt(yearSelect.value));
  //       yearSelect.addEventListener("change", (e) =>
  //         renderMonthButtons(e.target.value)
  //       );
  //     }

  //     const modal = new bootstrap.Modal(
  //       document.getElementById("detailsModal")
  //     );
  //     modal.show();
  //   });
  // }

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
  // 區塊顯示隱藏
  function updateHideOnAll(location) {
    const showOnlyOnRegion = document.querySelectorAll(".hide-on-all");
    const mainCols = document.querySelectorAll(".main-col");
    const sechide = document.querySelectorAll(".sechide");
    if (location === t("overview")) {
      showOnlyOnRegion.forEach((el) => (el.style.display = "none"));
      mainCols.forEach((el) => {
        el.classList.remove("col-md-6");
        el.classList.add("col-md-4");
      });
      sechide.forEach((el) => (el.style.display = "block"));
    } else {
      showOnlyOnRegion.forEach((el) => (el.style.display = "block"));
      mainCols.forEach((el) => {
        el.classList.remove("col-md-4");
        el.classList.add("col-md-6");
      });
      sechide.forEach((el) => (el.style.display = "none"));
    }
  }

  // 地區的 JSON
  async function loadLocationData(location) {
    updateHideOnAll(location);
    try {
      if (location === t("overview")) {
        let allAssessments = [];
        for (const loc of Object.keys(locationFileMap)) {
          const response = await fetch(locationFileMap[loc]);
          const data = await response.json();
          allAssessments = allAssessments.concat(data.assessments);
        }
        currentAssessments = allAssessments;

        dropdownButton.textContent = t("overview");

        updateLatestCountDate(currentAssessments);
        updateTotalCountAndStartDate(currentAssessments);
        renderAssessmentTable(currentAssessments);
        drawSitStandChartChartJS(currentAssessments);
        drawBalanceChartChartJS(currentAssessments);
        drawRiskChartChartJS(currentAssessments);
        drawGaitChartChartJS(currentAssessments);

        return;
      }
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
    const liAll = document.createElement("li");
    const aAll = document.createElement("a");
    aAll.classList.add("dropdown-item");
    aAll.href = "#";
    aAll.textContent = t("overview");
    aAll.addEventListener("click", () => {
      dropdownButton.textContent = t("overview");
      loadLocationData(t("overview"));
      refreshLevelUI();

      // 更新 URL，清除 region 參數
      const url = new URL(window.location);
      url.searchParams.delete("region");
      window.history.replaceState({}, "", url);
    });
    liAll.appendChild(aAll);
    dropdownMenu.appendChild(liAll);

    locations.forEach((loc, index) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.classList.add("dropdown-item");
      a.href = "#";
      a.textContent = loc;
      a.setAttribute("data-location-name", loc);

      a.addEventListener("click", () => {
        dropdownButton.textContent = loc;
        loadLocationData(loc);
        refreshLevelUI();

        // 點地區時更新網址參數
        const url = new URL(window.location);
        url.searchParams.set("region", loc);
        window.history.replaceState({}, "", url);
      });

      li.appendChild(a);
      dropdownMenu.appendChild(li);
    });

    // 根據 URL 自動載入對應地區
    const params = new URL(window.location).searchParams;
    const region = params.get("region");
    if (region && locationFileMap[region]) {
      dropdownButton.textContent = region;
      loadLocationData(region);
    } else {
      loadLocationData(t("overview"));
    }
  } catch (error) {
    console.error("失敗:", error);
  }

  // 表格 function

  let currentPage = 1;
  const pageSize = 10;
  let checkAllAcrossPages = true; // 紀錄是否全選
  let selected = []; //紀錄跨頁勾選
  function renderAssessmentTable(assessments) {
    window.lastRenderedAssessments = assessments;
    const assessmentTableBody = document.getElementById("assessmentTableBody");
    const paginationContainer = document.getElementById(
      "tablePaginationContainer"
    );

    assessmentTableBody.innerHTML = "";
    if (!assessments || assessments.length === 0) {
      paginationContainer.innerHTML = "";
      return;
    }

    // 排序：最新到最舊
    const sorted = [...assessments].sort((a, b) => b.Date - a.Date);

    const totalPages = Math.ceil(sorted.length / pageSize);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = sorted.slice(start, end);

    // 初始全選
    if (checkAllAcrossPages && selected.length === 0) {
      selected = assessments.map((_, i) => i);
    }

    // 表格生成
    pageData.forEach((item) => {
      const tr = document.createElement("tr");
      const date = new Date(item.Date);
      const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

      const globalIndex = assessments.indexOf(item);
      const isChecked = selected.includes(globalIndex);

      tr.innerHTML = `
      <td><input type="checkbox" class="row-check" data-index="${globalIndex}" ${
        isChecked ? "checked" : ""
      }></td>
      <td>${formattedDate}</td>
      <td>${item.Count}${t("people")}</td>
      <td>${item.ChairSecond.toFixed(1)}${t("seconds")}</td>
      <td>${item.BalanceScore.toFixed(1)}${t("points")}</td>
      <td>${item.GaitSpeed.toFixed(1)} cm/s</td>
      <td>${item.RiskRate.toFixed(1)}%</td>
    `;
      assessmentTableBody.appendChild(tr);
    });

    // 根據選取更新統計和卡片
    const selectedAssessments = assessments.filter((_, i) =>
      selected.includes(i)
    );
    updateRiskButtonsCounts(selectedAssessments);
    renderRisk(selectedAssessments);
    updateDegenerateAndLevels(selectedAssessments);
    updateLatestCountDate(selectedAssessments);
    updateTotalCountAndStartDate(selectedAssessments);

    // 更新卡片
    const mergedVIVIFRAIL = mergeAllVIVIFRAIL(selectedAssessments);
    renderCards(flattenData(mergedVIVIFRAIL));

    // checkbox 勾選事件
    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        const idx = parseInt(cb.dataset.index);
        if (cb.checked) {
          if (!selected.includes(idx)) selected.push(idx);
        } else {
          selected = selected.filter((i) => i !== idx);
        }

        const selectedAssessments = assessments.filter((_, i) =>
          selected.includes(i)
        );

        updateRiskButtonsCounts(selectedAssessments);
        renderRisk(selectedAssessments);
        updateDegenerateAndLevels(selectedAssessments);
        updateLatestCountDate(selectedAssessments);
        updateTotalCountAndStartDate(selectedAssessments);

        const mergedVIVIFRAIL = mergeAllVIVIFRAIL(selectedAssessments);
        renderCards(flattenData(mergedVIVIFRAIL));

        checkAllAcrossPages = selected.length === assessments.length;
        renderLevelCards(null, {}, flattenLevelData(selectedAssessments));
        updateChartsBasedOnSelection(assessments);
        removeNoDataOverlay();
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

  // 每次勾選也同步更新圖表
  function updateChartsBasedOnSelection(assessments) {
    const selectedAssessments = assessments.filter((_, i) =>
      selected.includes(i)
    );

    if (selectedAssessments.length === 0) {
      drawNoDataChart(); // 沒有選擇就顯示查無資料
    } else {
      drawSitStandChartChartJS(selectedAssessments);
      drawBalanceChartChartJS(selectedAssessments);
      drawGaitChartChartJS(selectedAssessments);
      drawRiskChartChartJS(selectedAssessments);
    }
  }

  // 「全選」按鈕
  document.getElementById("checkAllBtn").addEventListener("click", () => {
    checkAllAcrossPages = true; // 設定跨頁全選

    // （畫面上目前顯示的資料）
    const renderData = window.lastRenderedAssessments || [];

    //  將目前 render 出來的所有項目加進 selected
    selected = renderData.map((_, i) => i);

    // 同步畫面上的 checkbox（只處理目前這頁顯示的）
    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => (cb.checked = true));
    const mergedVIVIFRAIL = mergeAllVIVIFRAIL(renderData);
    renderCards(flattenData(mergedVIVIFRAIL));
    renderLevelCards(null, {}, flattenLevelData(renderData));

    renderRisk(renderData);
    updateDegenerateAndLevels(renderData);
    updateLatestCountDate(renderData);
    updateTotalCountAndStartDate(renderData);
    drawSitStandChartChartJS(renderData);
    drawBalanceChartChartJS(renderData);
    drawGaitChartChartJS(renderData);
    drawRiskChartChartJS(renderData);
    removeNoDataOverlay();
  });

  // 「取消全選」按鈕
  document.getElementById("uncheckAllBtn").addEventListener("click", () => {
    checkAllAcrossPages = false; // 取消跨頁全選
    selected = [];

    // 先取消所有 checkbox
    const checkboxes = document.querySelectorAll(".row-check");
    checkboxes.forEach((cb) => (cb.checked = false));
    renderLevelCards(null, {}, []);
    renderCards([]);
    updateRiskButtonsCounts([]);
    renderRisk([]);
    updateDegenerateAndLevels([]);
    updateLatestCountDate([]);
    updateTotalCountAndStartDate([]);
    drawNoDataChart();
  });

  // 風險等級 function

  function renderRisk(selectedAssessments = []) {
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
    if (!latestCountEl || !latestDateEl) return;

    //  如果沒有資料
    if (!assessments || assessments.length === 0) {
      latestCountEl.textContent = "0";
      latestDateEl.textContent = t("alertNoData");
      return;
    }

    //  計算總人數
    const totalCount = assessments.reduce(
      (sum, item) => sum + (item.Count || 0),
      0
    );
    latestCountEl.textContent = `${totalCount}`;

    //  日期排序 (由舊到新)
    const sorted = [...assessments].sort((a, b) => a.Date - b.Date);

    //  取得最舊與最新日期
    const oldestDate = new Date(sorted[0].Date);
    const latestDate = new Date(sorted[sorted.length - 1].Date);

    const formatDate = (date) =>
      `${date.getFullYear()}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

    const formattedOldest = formatDate(oldestDate);
    const formattedLatest = formatDate(latestDate);

    // 顯示日期範圍
    if (sorted.length === 1) {
      // 只有一筆日期
      latestDateEl.textContent = t("latestDateText").replace(
        "{date}",
        formattedLatest
      );
    } else {
      // 多個日期最舊~最新
      const dateRange = `${formattedOldest} ~ ${formattedLatest}`;
      latestDateEl.textContent = t("latestDateText").replace(
        "{date}",
        dateRange
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

  function updateDegenerateAndLevels(assessments = []) {
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

    // 收集所有 VIVIFRAIL 的 Name, 重複的只算一次
    const allNames = [];
    assessments.forEach((item) => {
      if (item.VIVIFRAIL) {
        Object.values(item.VIVIFRAIL).forEach((group) => {
          group.forEach((person) => {
            if (person.Name) allNames.push(person.Name);
          });
        });
      }
    });

    const uniqueNames = [...new Set(allNames)];
    const totalCount = uniqueNames.length;

    // 取得最舊與最新日期
    const sortedDates = assessments
      .map((item) => new Date(item.Date))
      .sort((a, b) => a - b);

    const formatDate = (date) =>
      `${date.getFullYear()}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

    const formattedOldest = formatDate(sortedDates[0]);
    const formattedLatest = formatDate(sortedDates[sortedDates.length - 1]);

    // 更新顯示
    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (startDateTextEl) {
      if (sortedDates.length === 1) {
        // 只有一個日期
        startDateTextEl.textContent = t("startDateText").replace(
          "{yearMonth}",
          formattedLatest
        );
      } else {
        // 多個日期，顯示範圍
        startDateTextEl.textContent = t("startDateText").replace(
          "{yearMonth}",
          `${formattedOldest} ~ ${formattedLatest}`
        );
      }
    }
  }

  // 顯示等級人員詳細彈窗
  const personDetailModalEl = document.getElementById("personDetailModal");
  const personDetailModal = new bootstrap.Modal(personDetailModalEl);

  function bindPersonCardClick(allSelectedData) {
    const cards = document.querySelectorAll(".person-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const name = card.dataset.person;
        const age = card.dataset.age;
        const gender = card.dataset.gender;

        const riskLabelDiv = card.querySelector(
          ".position-absolute.top-0.end-0"
        );
        const risk = riskLabelDiv
          ? riskLabelDiv.textContent
          : t("riskLabel.unknown");

        // 找出所有該人的測試紀錄
        const personRecords = allSelectedData.filter((item) => {
          if (item.VIVIFRAIL) {
            const allPeople = flattenData(item.VIVIFRAIL);
            return allPeople.some((p) => p.Name === name);
          }
          return false;
        });

        let datesHtml = "";
        if (personRecords.length > 0) {
          datesHtml = personRecords
            .map((item) => {
              const dateText = item.Date
                ? new Date(item.Date).toLocaleDateString()
                : t("unknown");
              return `<div class="py-1 border-bottom">${dateText}</div>`;
            })
            .join("");
        } else {
          datesHtml = `<div class="text-muted py-1 border-bottom">${t(
            "alertNoData"
          )}</div>`;
        }

        const bodyHtml = `
        <div class="row mb-3 gx-0 border">
          <div class="col-6 border-end p-2"><strong>${t(
            "name"
          )}:</strong> ${name}</div>
          <div class="col-6 p-2"><strong>${t(
            "genderLabel"
          )}:</strong> ${gender}</div>
          <div class="col-6 border-top border-end p-2"><strong>${t(
            "ageLabel"
          )}:</strong> ${age}</div>
          <div class="col-6 border-top p-2"><strong>${t(
            "riskLevel"
          )}:</strong> ${risk}</div>
        </div>
        <div class="mb-2">
          <strong>${t("dates")}:</strong>
          <div class="pt-2">${datesHtml}</div>
        </div>
      `;

        document.getElementById("personDetailTitle").textContent = name;
        document.getElementById("personDetailBody").innerHTML = bodyHtml;

        personDetailModal.show();
      });
    });
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
    bindPersonCardClick(currentAssessments);
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
    // 電腦
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
    // 手機
    document
      .querySelectorAll(".filterDropdownMobile .dropdown-item")
      .forEach((item) => {
        const risk = item.dataset.risk;
        const originalText = item.getAttribute("data-original-text");
        if (originalText) {
          item.textContent = `${originalText} (${counts[risk] || 0})`;
        } else {
          item.setAttribute("data-original-text", item.textContent.trim());
          item.textContent = `${item.textContent.trim()} (${
            counts[risk] || 0
          })`;
        }
      });
  }

  // 桌機版風險按鈕（包含主畫面 & 彈窗）
  const desktopRiskContainers = [
    document.querySelector(".filterBtnsDesktop"),
    document.querySelector("#modalFilterBtnsDesktop"),
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

  // 查看全部按鈕
  function updateViewAllBtn(show) {
    if (!viewAllBtn) return;
    viewAllBtn.style.display = show ? "inline-flex" : "none";
  }

  // 高低風險按鈕 (桌機)
  function handleRiskFilter(risk) {
    if (currentAssessments.length > 0) {
      const mergedVIVIFRAIL = mergeAllVIVIFRAIL(
        currentAssessments.filter((_, i) => selected.includes(i))
      );
      if (risk === "all") {
        renderCards(flattenData(mergedVIVIFRAIL));
      } else {
        renderCards(flattenData(mergedVIVIFRAIL), risk);
      }
    }
  }

  // 高低風險按鈕(手機)
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    const dropdownBtn = dropdown.querySelector(".dropdown-toggle");
    const items = dropdown.querySelectorAll(".dropdown-menu .dropdown-item");

    if (!dropdownBtn || items.length === 0) return;

    items.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        const risk = item.dataset.risk;
        const text = item.textContent.trim();

        dropdownBtn.textContent = text;

        handleRiskFilter(risk);
      });
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

    const checkAllBtn = document.getElementById("checkAllBtn");
    const uncheckAllBtn = document.getElementById("uncheckAllBtn");
    const paginationContainer = document.getElementById(
      "tablePaginationContainer"
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
      if (checkAllBtn) checkAllBtn.classList.add("hidden-by-filter");
      if (uncheckAllBtn) uncheckAllBtn.classList.add("hidden-by-filter");
      if (paginationContainer)
        paginationContainer.classList.add("hidden-by-filter");
      drawNoDataChart();
      updateLatestCountDate([]);
      updateTotalCountAndStartDate([]);
    } else {
      renderAssessmentTable(filtered);
      updateDegenerateAndLevels(filtered);
      const mergedVIVIFRAIL = mergeAllVIVIFRAIL(filtered);
      renderCards(flattenData(mergedVIVIFRAIL));
      updateLatestCountDate(filtered);
      updateTotalCountAndStartDate(filtered);
      drawSitStandChartChartJS(filtered);
      drawBalanceChartChartJS(filtered);
      drawGaitChartChartJS(filtered);
      drawRiskChartChartJS(filtered);
    }
  }

  // 清除按鈕
  document.getElementById("clearBtn").addEventListener("click", () => {
    if (!fp.selectedDates || fp.selectedDates.length === 0) return;
    fp.clear();
    const checkAllBtn = document.getElementById("checkAllBtn");
    const uncheckAllBtn = document.getElementById("uncheckAllBtn");
    const paginationContainer = document.getElementById(
      "tablePaginationContainer"
    );
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
      if (checkAllBtn) checkAllBtn.classList.remove("hidden-by-filter");
      if (uncheckAllBtn) uncheckAllBtn.classList.remove("hidden-by-filter");
      if (paginationContainer)
        paginationContainer.classList.remove("hidden-by-filter");
      drawSitStandChartChartJS(currentAssessments);
      drawBalanceChartChartJS(currentAssessments);
      drawGaitChartChartJS(currentAssessments);
      drawRiskChartChartJS(currentAssessments);
    }
  });

  // 新曲線圖坐站平均秒數
  Chart.register(window["chartjs-plugin-annotation"]);
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
    let labels = sorted.map((d) => {
      const date = new Date(d.Date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    let dataValues = sorted.map((d) => d.ChairSecond);
    if (labels.length === 1) {
      labels = ["", ...labels, ""];
      dataValues = [null, ...dataValues, null];
    }
    const baselineY = 12; // 基準線
    const minValue = Math.min(...dataValues, baselineY);
    const maxValue = Math.max(...dataValues, baselineY);
    let yMin = minValue - (maxValue - minValue) * 0.2;
    let yMax = maxValue + (maxValue - minValue) * 0.2;
    if (yMin < 0) yMin = 0;
    if (yMax - yMin < 5) yMax = yMin + 5;
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
            pointRadius: 2,
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
                const unit = t("seconds");
                return `${fullDate}：${value.toFixed(1)} ${unit}`;
              },
            },
          },
          annotation: {
            annotations: {
              baseline: {
                type: "line",
                yMin: 12,
                yMax: 12,
                borderColor: "#6b7280",
                borderWidth: 2,
                borderDash: [6, 4], // 虛線樣式
                label: {
                  display: true,
                  content: "",
                  position: "end",
                  backgroundColor: "rgba(107,114,128,0.1)",
                  color: "#374151",
                  font: {
                    style: "italic",
                  },
                },
              },
            },
          },
        },

        scales: {
          x: {
            offset: true,
            title: { display: true, text: "日期" },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 7, // 最多顯示 7 個刻度
            },
          },
          y: {
            title: { display: true, text: t("sitStand") },
            beginAtZero: false,
            min: yMin,
            max: yMax,
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

    let labels = sorted.map((d) => {
      const date = new Date(d.Date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    let dataValues = sorted.map((d) => d.BalanceScore);
    if (labels.length === 1) {
      labels = ["", ...labels, ""];
      dataValues = [null, ...dataValues, null];
    }
    const yMin = 0;
    const yMax = 4;

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
            pointRadius: 2,
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
                const unit = t("points");
                return `${fullDate}：${value.toFixed(1)} ${unit}`;
              },
            },
          },
          annotation: {
            annotations: {
              baseline: {
                type: "line",
                yMin: 3.5,
                yMax: 3.5,
                borderColor: "#6b7280",
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: "",
                  position: "start",
                  backgroundColor: "rgba(107,114,128,0.1)",
                  color: "#374151",
                  font: { weight: "bold" },
                  padding: 4,
                },
              },
            },
          },
        },
        scales: {
          x: {
            offset: true,
            title: { display: true, text: "日期" },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 7, // 最多顯示 7 個刻度
            },
          },
          y: {
            title: { display: true, text: t("balanceScore") },
            beginAtZero: false,
            min: yMin,
            max: yMax,
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

    let labels = sorted.map((d) => {
      const date = new Date(d.Date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    let dataValues = sorted.map((d) => d.GaitSpeed);
    if (labels.length === 1) {
      labels = ["", ...labels, ""];
      dataValues = [null, ...dataValues, null];
    }
    const baseline1 = 100;
    const baseline2 = 80;
    const minValue = Math.min(...dataValues, baseline1, baseline2);
    const maxValue = Math.max(...dataValues, baseline1, baseline2);
    let yMin = minValue - (maxValue - minValue) * 0.2;
    let yMax = maxValue + (maxValue - minValue) * 0.2;
    if (yMin < 0) yMin = 0;
    if (yMax - yMin < 10) yMax = yMin + 10;

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
            pointRadius: 2,
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
                const unit = t("gaitSpeed");
                return `${fullDate}：${value.toFixed(1)} ${unit}`;
              },
            },
          },
          annotation: {
            annotations: {
              baseline100: {
                type: "line",
                yMin: 100,
                yMax: 100,
                borderColor: "#6b7280",
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: "",
                  position: "start",
                  backgroundColor: "rgba(107,114,128,0.1)",
                  color: "#374151",
                  font: { weight: "bold" },
                  padding: 4,
                },
              },
              baseline80: {
                type: "line",
                yMin: 80,
                yMax: 80,
                borderColor: "#6b7280",
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: "",
                  position: "start",
                  backgroundColor: "rgba(107,114,128,0.1)",
                  color: "#374151",
                  font: { weight: "bold" },
                  padding: 4,
                },
              },
            },
          },
        },
        scales: {
          x: {
            offset: true,
            title: { display: true, text: "日期" },
            ticks: { autoSkip: true, maxTicksLimit: 7 },
          },
          y: {
            title: { display: true, text: t("gaitSpeed") },
            beginAtZero: false,
            min: yMin,
            max: yMax,
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

    let labels = sorted.map((d) => {
      const date = new Date(d.Date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    let dataValues = sorted.map((d) => d.RiskRate);
    if (labels.length === 1) {
      labels = ["", ...labels, ""];
      dataValues = [null, ...dataValues, null];
    }
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
            pointRadius: 2,
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
                const unit = t("fallRisk");
                return `${fullDate}：${value.toFixed(1)} ${unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            offset: true,
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
  // 圖表下載功能
  document.querySelectorAll(".download-chart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const canvas = document.getElementById(targetId);
      if (!canvas) return;

      // 添加白底
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      //圖檔
      const image = canvas.toDataURL("image/png", 0.9);

      // a 標籤下載
      const link = document.createElement("a");
      link.href = image;
      link.download = `${targetId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  // Chart.js 圖表 hover/語系更新處理
  // 當滑鼠 hover 或切換語系時，Chart.js 需要重新繪製圖表
  // 以避免 tooltip 或單位顯示錯誤
  const chartList = [
    { instance: "balanceChartInstance", draw: drawBalanceChartChartJS },
    { instance: "sitStandChartInstance", draw: drawSitStandChartChartJS },
    { instance: "gaitChartInstance", draw: drawGaitChartChartJS },
    { instance: "riskChartInstance", draw: drawRiskChartChartJS },
  ];

  // 重新繪製所有圖表（在切換語系或 hover 時使用）
  function refreshChartsForLang(lang) {
    window.currentLang = lang;

    chartList.forEach((chart) => {
      // 若圖表已存在，先銷毀舊圖表
      // 這是為了避免 Chart.js tooltip 單位或 hover 資料顯示錯誤
      if (window[chart.instance]) {
        window[chart.instance].destroy();
        window[chart.instance] = null;
      }
      chart.draw(assessments);
    });
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

  //A~D等級人員區塊
  const riskModeBtn = document.getElementById("riskModeBtn");
  const levelModeBtn = document.getElementById("levelModeBtn");
  const riskContainer = document.getElementById("riskContainer");
  const levelContainer = document.getElementById("levelContainer");

  riskContainer.classList.remove("d-none");
  levelContainer.classList.add("d-none");

  // 風險排序
  riskModeBtn.addEventListener("click", () => {
    riskContainer.classList.remove("d-none");
    levelContainer.classList.add("d-none");
    riskModeBtn.classList.add("active");
    levelModeBtn.classList.remove("active");
  });

  // 等級排序
  levelModeBtn.addEventListener("click", () => {
    riskContainer.classList.add("d-none");
    levelContainer.classList.remove("d-none");
    levelModeBtn.classList.add("active");
    riskModeBtn.classList.remove("active");
    // 根據目前勾選的資料決定要顯示的內容
    const allAssessments = window.lastRenderedAssessments || [];
    const selectedAssessments = allAssessments.filter((_, i) =>
      selected.includes(i)
    );

    // 如果沒勾選，就顯示「無資料」
    const dataToShow =
      selectedAssessments.length > 0 ? selectedAssessments : [];

    refreshLevelUI(dataToShow);
  });

  function flattenLevelData(assessments) {
    const levels = ["A", "B", "C", "D"];
    const result = [];
    assessments.forEach((item) => {
      levels.forEach((level) => {
        if (item.VIVIFRAIL && item.VIVIFRAIL[level]) {
          item.VIVIFRAIL[level].forEach((p) => {
            result.push({ ...p, Level: level });
          });
        }
      });
    });
    return result;
  }

  // level建立人員卡片
  function createLevelPersonCard(person) {
    const genderText = person.Gender === 0 ? t("female") : t("male");
    const faceColors = {
      A: "#FEE2E2",
      B: "#FEF3C7",
      C: "#DBEAFE",
      D: "#DCFCE7",
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

    // ===== 判斷嘴巴表情 =====
    let mouthPath = "";
    if (person.Level === "D") {
      // 笑臉
      mouthPath = "M40 65 Q50 75 60 65";
    } else if (person.Level === "C") {
      // 直線
      mouthPath = "M40 65 L60 65";
    } else {
      // 哭臉
      mouthPath = "M40 65 Q50 55 60 65";
    }

    return `
  <div class="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
    <div class="person-card bg-white rounded shadow-sm border border-2 ${levelClass} h-100"
         data-person="${person.Name}"
         data-age="${person.Age}"
         data-gender="${genderText}"
         data-level="${person.Level}">
      <div class="position-relative">
        <svg class="w-100" height="130" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="30" fill="${faceColor}" />
          <circle cx="40" cy="45" r="5" fill="#4B5563" />
          <circle cx="60" cy="45" r="5" fill="#4B5563" />
          <path d="${mouthPath}" fill="none" stroke="#4B5563" stroke-width="3" stroke-linecap="round" />
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

  // level卡片
  function renderLevelCards(filter = null, options = {}, personsData = []) {
    const container =
      options.container || document.getElementById("levelPersonContainer");
    const isModal = options.isModal || false;

    container.innerHTML = "";

    // 如果沒資料，顯示「無符合條件的人員」
    if (!personsData || personsData.length === 0) {
      container.innerHTML = `<div class="col-12"><div class="alert alert-secondary text-center">${t(
        "noMatchedPerson"
      )}</div></div>`;
      updateLevelButtonsCounts([]);
      return;
    }

    // 資料存在才排序
    const allPersons = [...personsData];
    const levelOrder = { A: 1, B: 2, C: 3, D: 4 };
    allPersons.sort((a, b) => levelOrder[a.Level] - levelOrder[b.Level]);

    let persons = allPersons;
    if (filter && filter !== "all") {
      persons = persons.filter((p) => p.Level === filter);
    }

    if (!isModal) persons = persons.slice(0, 12);

    if (persons.length === 0) {
      container.innerHTML = `<div class="col-12"><div class="alert alert-secondary text-center">${t(
        "noMatchedPerson"
      )}</div></div>`;
      updateLevelButtonsCounts([]);
      return;
    }

    container.innerHTML = persons.map(createLevelPersonCard).join("");
    bindPersonCardClick(currentAssessments);
    updateLevelButtonsCounts(allPersons);
  }

  // level更新按鈕括弧 (桌機 + 手機 + 彈窗)
  function updateLevelButtonsCounts(allPersons) {
    const counts = { all: allPersons.length, A: 0, B: 0, C: 0, D: 0 };
    allPersons.forEach((p) => {
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
          btn.textContent = `${btn.textContent.trim()} (${
            counts[filter] || 0
          })`;
        }
      });

    // level手機主畫面
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

    // level modal 桌機
    document
      .querySelectorAll("#modalLevelFilterBtnsDesktop button")
      .forEach((btn) => {
        const filter = btn.dataset.filter;
        const originalText = btn.getAttribute("data-original-text");
        if (originalText)
          btn.textContent = `${originalText} (${counts[filter] || 0})`;
        else {
          btn.setAttribute("data-original-text", btn.textContent.trim());
          btn.textContent = `${btn.textContent.trim()} (${
            counts[filter] || 0
          })`;
        }
      });

    //level  modal 手機
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

  // 篩選事件
  function handleLevelFilter(filter, options = {}) {
    // 取出目前所有資料
    const allAssessments = window.lastRenderedAssessments || [];
    // 取出目前勾選的資料索引
    const selectedAssessments = allAssessments.filter((_, i) =>
      selected.includes(i)
    );

    //  用勾選資料,如果沒勾選顯示空
    const dataToShow =
      selectedAssessments.length > 0 ? selectedAssessments : [];

    // 把資料給各級人員
    const personsData = flattenLevelData(dataToShow);

    //  最後 renderLevelCards
    renderLevelCards(filter, options, personsData);
  }

  document
    .querySelectorAll(".level .levelFilterBtnsDesktop button")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        handleLevelFilter(btn.dataset.filter)
      );
    });
  document
    .querySelectorAll(".level .levelFilterDropdownMobile .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        handleLevelFilter(item.dataset.filter);
      });
    });

  // level查看全部彈窗
  const viewAllLevelBtn = document.getElementById("viewAllLevelBtn");
  const modalLevelPersonContainer = document.getElementById(
    "modalLevelPersonContainer"
  );

  viewAllLevelBtn.addEventListener("click", () => {
    // 使用目前勾選的資料
    const allAssessments = window.lastRenderedAssessments || [];
    const selectedAssessments = allAssessments.filter((_, i) =>
      selected.includes(i)
    );
    const dataToShow =
      selectedAssessments.length > 0 ? selectedAssessments : [];
    const personsData = flattenLevelData(dataToShow);

    renderLevelCards(
      null,
      {
        container: modalLevelPersonContainer,
        isModal: true,
      },
      personsData
    ); //加入第三個參數

    const modal = new bootstrap.Modal(
      document.getElementById("participantsLevelModal")
    );
    modal.show();
  });
  // 桌機版
  document
    .querySelectorAll("#modalLevelFilterBtnsDesktop button")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const allAssessments = window.lastRenderedAssessments || [];
        const selectedAssessments = allAssessments.filter((_, i) =>
          selected.includes(i)
        );
        const dataToShow =
          selectedAssessments.length > 0 ? selectedAssessments : [];
        const personsData = flattenLevelData(dataToShow);

        renderLevelCards(
          btn.dataset.filter,
          {
            container: modalLevelPersonContainer,
            isModal: true,
          },
          personsData
        );
      });
    });

  // 手機版
  document
    .querySelectorAll("#modalLevelFilterDropdownMobile .dropdown-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        const allAssessments = window.lastRenderedAssessments || [];
        const selectedAssessments = allAssessments.filter((_, i) =>
          selected.includes(i)
        );
        const dataToShow =
          selectedAssessments.length > 0 ? selectedAssessments : [];
        const personsData = flattenLevelData(dataToShow);

        renderLevelCards(
          item.dataset.filter,
          {
            container: modalLevelPersonContainer,
            isModal: true,
          },
          personsData
        );
      });
    });

  // 等級桌機版按鈕樣式添加
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
  // 切換地區更新畫面
  function refreshLevelUI(assessments = []) {
    // 如果 assessments 空的（例如未勾選），顯示空畫面
    if (!assessments || assessments.length === 0) {
      renderLevelCards(null, {}, []); // 顯示「目前沒有符合條件的人員」
      return;
    }

    const allPersons = flattenLevelData(assessments);
    const levelOrder = { A: 1, B: 2, C: 3, D: 4 };
    allPersons.sort((a, b) => levelOrder[a.Level] - levelOrder[b.Level]);
    window.lastLevelPersons = allPersons;
    renderLevelCards(
      null,
      {
        container: document.getElementById("levelPersonContainer"),
      },
      allPersons
    );
  }

  refreshLevelUI();
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
