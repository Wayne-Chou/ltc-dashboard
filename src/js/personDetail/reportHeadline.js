// src/js/personDetail/reportHeadline.js
import { LANG } from "./lang.js";
import { getPersonFilteredAssessments } from "./personData.js";

const $ = (id) => document.getElementById(id);

function detailLangKey() {
  return localStorage.getItem("lang") || "zh";
}

function fmtDate(ts) {
  try {
    if (!ts) return "--";
    return new Date(ts).toLocaleDateString();
  } catch {
    return "--";
  }
}

function pctChange(prev, curr, higherIsBetter) {
  if (prev == null || curr == null) return null;
  if (prev === 0) return null;
  let delta = ((curr - prev) / Math.abs(prev)) * 100;

  if (higherIsBetter === false) {
    delta = -delta;
  }
  return delta;
}

function pickLatestTwo(arr) {
  const valid = (arr || []).filter((x) => x && x.Date != null);
  valid.sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
  );
  if (valid.length < 2) return null;
  return [valid[valid.length - 2], valid[valid.length - 1]];
}

function renderHeadline({ tone, statusKey, rangeText, titleKey, descKey }) {
  const root = $("reportHeadline");
  if (!root) return;

  const lang = LANG[detailLangKey()]?.headline;
  if (!lang) {
    console.warn("Headline language pack not found");
    return;
  }

  const badge = root.querySelector(".headline-badge");
  const tEl = root.querySelector(".headline-title");
  const d = root.querySelector(".headline-desc");

  if (badge) {
    badge.setAttribute("data-tone", tone);
    badge.innerHTML = `
        <i class="fa-solid ${
          tone === "ok"
            ? "fa-circle-check"
            : tone === "warn"
              ? "fa-triangle-exclamation"
              : tone === "bad"
                ? "fa-circle-xmark"
                : "fa-circle-info"
        }"></i>
        <span>${lang.status[statusKey] || statusKey}</span>
      `;
  }

  if (tEl) tEl.textContent = lang.title[titleKey] || titleKey;
  if (d) d.textContent = lang.desc[descKey] || descKey;

  const range = $("reportRange");
  if (range) range.textContent = rangeText;
}

function buildFromTwo(prev, curr) {
  const sit = pctChange(prev.ChairSecond, curr.ChairSecond, false);
  const bal = pctChange(prev.BalanceScore, curr.BalanceScore, true);
  const gait = pctChange(prev.GaitSpeed, curr.GaitSpeed, true);
  const risk = pctChange(prev.RiskRate, curr.RiskRate, false);

  const issues = [];

  if (sit != null)
    issues.push({
      key: "sitStand",
      bad: sit < -8,
      sev: Math.abs(sit),
      titleKey: sit < 0 ? "sitStandSlow" : "sitStandFast",
    });

  if (bal != null)
    issues.push({
      key: "balance",
      bad: bal < -8,
      sev: Math.abs(bal),
      titleKey: bal < 0 ? "balanceDown" : "balanceUp",
    });

  if (gait != null)
    issues.push({
      key: "gait",
      bad: gait < -8,
      sev: Math.abs(gait),
      titleKey: gait < 0 ? "gaitDown" : "gaitUp",
    });

  if (risk != null)
    issues.push({
      key: "risk",
      bad: risk < -15,
      sev: Math.abs(risk),
      titleKey: risk < 0 ? "riskUp" : "riskDown",
    });

  issues.sort((a, b) => {
    if (a.bad !== b.bad) return a.bad ? -1 : 1;
    return b.sev - a.sev;
  });

  const top = issues[0];
  const rangeText = `${fmtDate(prev.Date)} → ${fmtDate(curr.Date)}`;

  if (!top) {
    return {
      tone: "neutral",
      statusKey: "noData",
      rangeText,
      titleKey: "noData",
      descKey: "noData",
    };
  }

  const hasBad = issues.some((x) => x.bad);
  const riskUp = risk != null && risk < -15;

  let tone = "ok";
  let statusKey = "ok";

  if (hasBad) {
    tone = riskUp ? "bad" : "warn";
    statusKey = riskUp ? "bad" : "warn";
  }

  return {
    tone,
    statusKey,
    rangeText,
    titleKey: top.titleKey,
    descKey: statusKey,
  };
}

function tryRender() {
  const data = getPersonFilteredAssessments();
  const pair = pickLatestTwo(data);

  if (!pair) return false;
  const [prev, curr] = pair;

  const result = buildFromTwo(prev, curr);
  renderHeadline(result);
  return true;
}

export function updateHeadlineUI() {
  return tryRender();
}

let headlineInitStarted = false;

export function initReportHeadline() {
  if (headlineInitStarted) return;
  headlineInitStarted = true;

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (tryRender() || tries > 40) clearInterval(timer);
  }, 150);

  document.addEventListener("trend:updated", () => {
    tryRender();
  });
}
