// js/personDetail/reportHeadline.js
(function () {
  const $ = (id) => document.getElementById(id);

  function fmtDate(ts) {
    try {
      return new Date(ts).toLocaleDateString();
    } catch {
      return "--";
    }
  }

  function pctChange(prev, curr, higherIsBetter) {
    if (prev == null || curr == null) return null;
    if (prev === 0) return null;
    let delta = ((curr - prev) / Math.abs(prev)) * 100;

    // 若 higherIsBetter=false，代表越小越好（例如坐站秒數）
    // 在這裡統一語意：delta > 0 一律代表「改善」
    if (higherIsBetter === false) {
      delta = -delta;
    }

    // 退化與改善的語意在 render 部分處理
    return delta;
  }

  function pickLatestTwo(arr) {
    const valid = (arr || []).filter((x) => x && x.Date != null);
    valid.sort((a, b) => Number(a.Date) - Number(b.Date));
    if (valid.length < 2) return null;
    return [valid[valid.length - 2], valid[valid.length - 1]];
  }

  function renderHeadline({ tone, statusKey, rangeText, titleKey, descKey }) {
    const root = $("reportHeadline");
    if (!root) return;

    const lang = LANG[window.currentLang]?.headline;
    if (!lang) return;

    const badge = root.querySelector(".headline-badge");
    const t = root.querySelector(".headline-title");
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
        <span>${lang.status[statusKey]}</span>
      `;
    }

    if (t) t.textContent = lang.title[titleKey];
    if (d) d.textContent = lang.desc[descKey];

    // 右側只保留「比較區間」
    const range = $("reportRange");
    if (range) range.textContent = rangeText;

    // 不再有任何「整體判讀」欄位
  }

  function buildFromTwo(prev, curr) {
    // 指標：坐站（越低越好）、平衡（越高越好）、步速（越高越好）、風險（越低越好）
    const sit = pctChange(prev.ChairSecond, curr.ChairSecond, false);
    const bal = pctChange(prev.BalanceScore, curr.BalanceScore, true);
    const gait = pctChange(prev.GaitSpeed, curr.GaitSpeed, true);
    const risk = pctChange(prev.RiskRate, curr.RiskRate, false);

    const issues = [];

    // 坐站：delta < 0 = 退化
    if (sit != null)
      issues.push({
        key: "sitStand",
        bad: sit < -8,
        sev: Math.abs(sit),
        titleKey: sit < 0 ? "sitStandSlow" : "sitStandFast",
      });

    // 平衡：delta < 0 = 退化
    if (bal != null)
      issues.push({
        key: "balance",
        bad: bal < -8,
        sev: Math.abs(bal),
        titleKey: bal < 0 ? "balanceDown" : "balanceUp",
      });

    // 步速：delta < 0 = 退化
    if (gait != null)
      issues.push({
        key: "gait",
        bad: gait < -8,
        sev: Math.abs(gait),
        titleKey: gait < 0 ? "gaitDown" : "gaitUp",
      });

    // 風險：delta < 0 = 退化（更危險）
    if (risk != null)
      issues.push({
        key: "risk",
        bad: risk < -15,
        sev: Math.abs(risk),
        titleKey: risk < 0 ? "riskUp" : "riskDown",
      });

    // 找出最需要注意的項目（以「bad=true」優先，再看幅度）
    issues.sort((a, b) => {
      if (a.bad !== b.bad) return a.bad ? -1 : 1;
      return b.sev - a.sev;
    });

    const top = issues[0];
    const rangeText = `${fmtDate(prev.Date)} → ${fmtDate(curr.Date)}`;

    // 如果資料不足
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
    const data = window.filteredAssessments;
    const pair = pickLatestTwo(data);

    if (!pair) return false;
    const [prev, curr] = pair;

    const result = buildFromTwo(prev, curr);
    renderHeadline(result);
    return true;
  }

  // 等待 main.js fetch 完畢後才會有 window.filteredAssessments
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (tryRender() || tries > 40) clearInterval(timer);
  }, 150);

  window.addEventListener("trend:updated", () => {
    tryRender();
  });
})();
