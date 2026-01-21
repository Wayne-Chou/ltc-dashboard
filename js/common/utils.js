// js/common/utils.js

function getRiskCategory(risk) {
  if (risk > 50) return "high";
  if (risk > 30) return "slightlyHigh";
  if (risk > 17.5) return "medium";
  if (risk > 5) return "slightlyLow";
  return "low";
}

function flattenData(VIVIFRAIL) {
  const result = [];

  Object.values(VIVIFRAIL).forEach((group) => {
    group.forEach((p) => result.push({ ...p, Level: p.Level || "" }));
  });

  const riskOrder = ["high", "slightlyHigh", "medium", "slightlyLow", "low"];
  result.sort((a, b) => {
    const aCategory = getRiskCategory(a.Risk);
    const bCategory = getRiskCategory(b.Risk);
    return riskOrder.indexOf(aCategory) - riskOrder.indexOf(bCategory);
  });

  return result;
}

function maskName(name) {
  if (!name) return "匿名";
  const len = name.length;

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
