// src/js/common/riskStats.js
import { t } from "./locale.js";

/**
 * 更新風險等級數字與進度條 (A/B/C/D 四級)
 */
export function renderRisk(selectedAssessments = []) {
  const riskA = document.getElementById("riskA");
  const riskB = document.getElementById("riskB");
  const riskC = document.getElementById("riskC");
  const riskD = document.getElementById("riskD");

  const progressA = document.getElementById("progressA");
  const progressB = document.getElementById("progressB");
  const progressC = document.getElementById("progressC");
  const progressD = document.getElementById("progressD");

  const degenerateGaitSpeedTotal = document.getElementById(
    "degenerateGaitSpeedTotal",
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

  const setWidth = (el, count) => {
    if (el)
      el.style.width = totalCount ? `${(count / totalCount) * 100}%` : "0%";
  };

  setWidth(progressA, countA);
  setWidth(progressB, countB);
  setWidth(progressC, countC);
  setWidth(progressD, countD);

  if (degenerateGaitSpeedTotal)
    degenerateGaitSpeedTotal.textContent = gaitSpeedDeclineCount;
  if (degenerateChairTotal)
    degenerateChairTotal.textContent = chairSecondIncreaseCount;
  setWidth(progressGaitSpeed, gaitSpeedDeclineCount);
  setWidth(progressChair, chairSecondIncreaseCount);
}

/**
 * 更新最新檢測人次與日期區間
 */
export function updateLatestCountDate(assessments) {
  const latestCountEl = document.getElementById("latestCount");
  const latestDateEl = document.getElementById("latestDate");
  if (!latestCountEl || !latestDateEl) return;

  if (!assessments || assessments.length === 0) {
    latestCountEl.textContent = "0";
    latestDateEl.textContent = t("alertNoData");
    return;
  }

  const totalVisits = assessments.reduce(
    (sum, item) => sum + (item.Count || 0),
    0,
  );
  latestCountEl.textContent = `${totalVisits}`;

  const sorted = [...assessments].sort((a, b) => a.Date - b.Date);
  const formatDate = (date) =>
    `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

  const formattedOldest = formatDate(new Date(sorted[0].Date));
  const formattedLatest = formatDate(new Date(sorted[sorted.length - 1].Date));

  latestDateEl.textContent = t("latestDateText").replace(
    "{date}",
    sorted.length === 1
      ? formattedLatest
      : `${formattedOldest} ~ ${formattedLatest}`,
  );
}
/**
 * 重置小區塊數值為 0 (當篩選結果為空時使用)
 */
export function resetDegenerateAndLevels() {
  const degenerateList = document.getElementById("degenerateList");
  if (degenerateList) {
    const spans = degenerateList.querySelectorAll(".val");
    if (spans.length >= 2) {
      spans[0].textContent = 0;
      spans[1].textContent = 0;
    }
  }

  const levelList = document.getElementById("levelList");
  if (levelList) {
    const spans = levelList.querySelectorAll(".val");
    if (spans.length >= 3) {
      spans[0].textContent = 0;
      spans[1].textContent = 0;
      spans[2].textContent = 0;
    }
  }
}
/**
 * 更新警示清單小區塊 (衰退人數)
 */
export function updateDegenerateAndLevels(assessments = []) {
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

  const updateVal = (id, vals) => {
    const el = document.getElementById(id);
    if (el) {
      const spans = el.querySelectorAll(".val");
      vals.forEach((v, i) => {
        if (spans[i]) spans[i].textContent = v;
      });
    }
  };

  updateVal("degenerateList", [totalGaitSpeed, totalChairSecond]);
  updateVal("levelList", [countA, countB, countC]);
}

/**
 * 更新總檢測人數 (不重複姓名) 與起始日期
 */
export function updateTotalCountAndStartDate(assessments) {
  const totalCountEl = document.getElementById("totalCount");
  const startDateTextEl = document.getElementById("startDateText");

  if (!assessments || assessments.length === 0) {
    if (totalCountEl) totalCountEl.textContent = "0";
    if (startDateTextEl) startDateTextEl.textContent = t("countWarning");
    return;
  }

  const allNames = new Set();
  assessments.forEach((item) => {
    if (item.VIVIFRAIL) {
      Object.values(item.VIVIFRAIL).forEach((group) => {
        group.forEach((person) => {
          if (person.Name) allNames.add(person.Name);
        });
      });
    }
  });

  const sortedDates = assessments
    .map((item) => new Date(item.Date))
    .sort((a, b) => a - b);
  const formatDate = (date) =>
    `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

  const oldest = formatDate(sortedDates[0]);
  const latest = formatDate(sortedDates[sortedDates.length - 1]);

  if (totalCountEl) totalCountEl.textContent = allNames.size;
  if (startDateTextEl) {
    startDateTextEl.textContent = t("startDateText").replace(
      "{yearMonth}",
      sortedDates.length === 1 ? latest : `${oldest} ~ ${latest}`,
    );
  }
}


