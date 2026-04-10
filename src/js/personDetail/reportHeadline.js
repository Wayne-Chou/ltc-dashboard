// src/js/personDetail/reportHeadline.js

/**
 * reportHeadline.js
 * 負責渲染報告最上方的「臨床狀態」與「重要摘要」。
 * Vite 修正：
 * 1. 確保從 window.LANG 存取語系資料。
 * 2. 移除 IIFE (立即執行函式) 的限制，直接導出功能或掛載到 window。
 * 3. 增加對 window.filteredAssessments 的安全存取。
 */

(function () {
  const $ = (id) => document.getElementById(id);

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

    // 若 higherIsBetter=false，代表越小越好（例如坐站秒數）
    // 這裡維持原本邏輯：delta > 0 代表數值增加
    if (higherIsBetter === false) {
      delta = -delta; // 讓「數值減少」變成「delta 為正」代表改善
    }
    return delta;
  }

  function pickLatestTwo(arr) {
    // 💥 修正：確保 Date 轉換正確
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

    // 💥 修正：明確從 window.LANG 抓取
    const lang = window.LANG?.[window.currentLang || "zh"]?.headline;
    if (!lang) {
      console.warn("Headline language pack not found");
      return;
    }

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
        <span>${lang.status[statusKey] || statusKey}</span>
      `;
    }

    if (t) t.textContent = lang.title[titleKey] || titleKey;
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
    // 💥 修正：從全域 window 獲取
    const data = window.filteredAssessments;
    const pair = pickLatestTwo(data);

    if (!pair) return false;
    const [prev, curr] = pair;

    const result = buildFromTwo(prev, curr);
    renderHeadline(result);
    return true;
  }

  // 💥 導出到 window 讓 main.js 之後可以手動呼叫
  window.updateHeadlineUI = function (customData) {
    if (customData) {
      // 如果傳入單一資料，通常是為了重置或特定顯示，
      // 但此組件邏輯是比對最近兩筆，故這裡重新跑 tryRender
    }
    return tryRender();
  };

  // 等待 main.js fetch 完畢
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (tryRender() || tries > 40) clearInterval(timer);
  }, 150);

  // 監聽更新事件
  window.addEventListener("trend:updated", () => {
    tryRender();
  });
})();
