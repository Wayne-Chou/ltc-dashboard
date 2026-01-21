// js/common/riskStats.js

// ===== 風險等級數字 + 進度條 =====
function renderRisk(selectedAssessments = []) {
  const riskA = document.getElementById("riskA");
  const riskB = document.getElementById("riskB");
  const riskC = document.getElementById("riskC");
  const riskD = document.getElementById("riskD");

  const progressA = document.getElementById("progressA");
  const progressB = document.getElementById("progressB");
  const progressC = document.getElementById("progressC");
  const progressD = document.getElementById("progressD");

  const degenerateGaitSpeedTotal = document.getElementById(
    "degenerateGaitSpeedTotal"
  );
  const degenerateChairTotal = document.getElementById("degenerateChairTotal");
  const progressGaitSpeed = document.getElementById("progressGaitSpeed");
  const progressChair = document.getElementById("progressChair");

  let totalCount = 0;
  let countA = 0,
    countB = 0,
    countC = 0,
    countD = 0;

  let gaitSpeedDeclineCount = 0;
  let chairSecondIncreaseCount = 0;

  selectedAssessments.forEach((item) => {
    totalCount += item.Count || 0;

    const V = item.VIVIFRAIL || {};
    countA += V.A ? V.A.length : 0;
    countB += V.B ? V.B.length : 0;
    countC += V.C ? V.C.length : 0;
    countD += V.D ? V.D.length : 0;

    const D = item.Degenerate;
    if (D) {
      gaitSpeedDeclineCount += Array.isArray(D.GaitSpeed)
        ? D.GaitSpeed.length
        : 0;
      chairSecondIncreaseCount += Array.isArray(D.ChairSecond)
        ? D.ChairSecond.length
        : 0;
    }
  });

  if (riskA) riskA.textContent = countA;
  if (riskB) riskB.textContent = countB;
  if (riskC) riskC.textContent = countC;
  if (riskD) riskD.textContent = countD;

  if (progressA)
    progressA.style.width = totalCount
      ? `${(countA / totalCount) * 100}%`
      : "0%";
  if (progressB)
    progressB.style.width = totalCount
      ? `${(countB / totalCount) * 100}%`
      : "0%";
  if (progressC)
    progressC.style.width = totalCount
      ? `${(countC / totalCount) * 100}%`
      : "0%";
  if (progressD)
    progressD.style.width = totalCount
      ? `${(countD / totalCount) * 100}%`
      : "0%";

  if (degenerateGaitSpeedTotal)
    degenerateGaitSpeedTotal.textContent = gaitSpeedDeclineCount;
  if (degenerateChairTotal)
    degenerateChairTotal.textContent = chairSecondIncreaseCount;

  if (progressGaitSpeed)
    progressGaitSpeed.style.width = totalCount
      ? `${(gaitSpeedDeclineCount / totalCount) * 100}%`
      : "0%";

  if (progressChair)
    progressChair.style.width = totalCount
      ? `${(chairSecondIncreaseCount / totalCount) * 100}%`
      : "0%";
}

// ===== 更新最新檢測數 & 日期 =====
function updateLatestCountDate(assessments) {
  const latestCountEl = document.getElementById("latestCount");
  const latestDateEl = document.getElementById("latestDate");
  if (!latestCountEl || !latestDateEl) return;

  if (!assessments || assessments.length === 0) {
    latestCountEl.textContent = "0";
    latestDateEl.textContent = t("alertNoData");
    return;
  }

  const totalCount = assessments.reduce(
    (sum, item) => sum + (item.Count || 0),
    0
  );
  latestCountEl.textContent = `${totalCount}`;

  const sorted = [...assessments].sort((a, b) => a.Date - b.Date);
  const oldestDate = new Date(sorted[0].Date);
  const latestDate = new Date(sorted[sorted.length - 1].Date);

  const formatDate = (date) =>
    `${date.getFullYear()}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

  const formattedOldest = formatDate(oldestDate);
  const formattedLatest = formatDate(latestDate);

  if (sorted.length === 1) {
    latestDateEl.textContent = t("latestDateText").replace(
      "{date}",
      formattedLatest
    );
  } else {
    latestDateEl.textContent = t("latestDateText").replace(
      "{date}",
      `${formattedOldest} ~ ${formattedLatest}`
    );
  }
}

// ===== 步行速度衰退 / 起坐秒數增加 & 各級人數（小區塊）=====
function updateDegenerateAndLevels(assessments = []) {
  let totalGaitSpeed = 0;
  let totalChairSecond = 0;

  let countA = 0,
    countB = 0,
    countC = 0;

  assessments.forEach((item) => {
    if (item.Degenerate) {
      totalGaitSpeed += Array.isArray(item.Degenerate.GaitSpeed)
        ? item.Degenerate.GaitSpeed.length
        : 0;
      totalChairSecond += Array.isArray(item.Degenerate.ChairSecond)
        ? item.Degenerate.ChairSecond.length
        : 0;
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

// ===== 重置小區塊為 0 =====
function resetDegenerateAndLevels() {
  const degenerateList = document.getElementById("degenerateList");
  if (degenerateList) {
    const spans = degenerateList.querySelectorAll("span");
    if (spans.length >= 2) {
      spans[0].textContent = 0;
      spans[1].textContent = 0;
    }
  }

  const levelList = document.getElementById("levelList");
  if (levelList) {
    const spans = levelList.querySelectorAll("span");
    if (spans.length >= 3) {
      spans[0].textContent = 0;
      spans[1].textContent = 0;
      spans[2].textContent = 0;
    }
  }
}

// ===== 總參與人數 & 起始日期 =====
function updateTotalCountAndStartDate(assessments) {
  const totalCountEl = document.getElementById("totalCount");
  const startDateTextEl = document.getElementById("startDateText");

  if (!assessments || assessments.length === 0) {
    if (totalCountEl) totalCountEl.textContent = "0";
    if (startDateTextEl) startDateTextEl.textContent = t("countWarning");
    return;
  }

  // unique 人數（用 Name 去重）
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

  const sortedDates = assessments
    .map((item) => new Date(item.Date))
    .sort((a, b) => a - b);

  const formatDate = (date) =>
    `${date.getFullYear()}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

  const oldest = formatDate(sortedDates[0]);
  const latest = formatDate(sortedDates[sortedDates.length - 1]);

  if (totalCountEl) totalCountEl.textContent = totalCount;

  if (startDateTextEl) {
    if (sortedDates.length === 1) {
      startDateTextEl.textContent = t("startDateText").replace(
        "{yearMonth}",
        latest
      );
    } else {
      startDateTextEl.textContent = t("startDateText").replace(
        "{yearMonth}",
        `${oldest} ~ ${latest}`
      );
    }
  }
}
