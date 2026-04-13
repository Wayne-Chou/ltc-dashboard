// src/js/personDetail/main.js

import "../common/config.js";
import { t, applyLanguage } from "./lang.js";
import { getPersonParams, fetchPersonDetailData } from "./url.js";
import { renderTable, setupCheckboxes } from "./table.js";
import { drawAllCharts } from "./charts.js";
import { setPersonFilteredAssessments } from "./personData.js";
import {
  initReportHeadline,
  updateHeadlineUI,
} from "./reportHeadline.js";

function getFlatpickrLocale(lang) {
  const l = lang ? lang.toLowerCase() : "zh";
  if (typeof flatpickr === "undefined") return undefined;
  if (l.includes("zh")) return flatpickr.l10ns.zh_tw;
  if (l.includes("ja")) return flatpickr.l10ns.ja;
  if (l.includes("ko")) return flatpickr.l10ns.ko;
  return flatpickr.l10ns.default;
}

function getClinicalStatus(a) {
  const chair = a.ChairSecond;
  const balance = a.BalanceScore;
  const gait = a.GaitSpeed;
  const risk = a.RiskRate;

  if (
    (chair != null && chair > 15) ||
    (balance != null && balance < 3) ||
    (gait != null && gait < 80) ||
    (risk != null && risk >= 30)
  )
    return "critical";

  if (
    (chair != null && chair > 12) ||
    (balance != null && balance < 3.5) ||
    (gait != null && gait < 100) ||
    (risk != null && risk >= 20)
  )
    return "watch";

  return "good";
}

function genderText(g) {
  const isMale = g === 1 || g === "1";
  const isFemale = g === 0 || g === "0";
  if (isMale) return t("male");
  if (isFemale) return t("female");
  return t("unknown") || "Unknown";
}

function goBack() {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const returnUrl = urlParams.get("returnUrl");

  if (returnUrl) {
    globalThis.location.href = decodeURIComponent(returnUrl);
  } else {
    globalThis.location.href = "/ltc-dashboard/index.html";
  }
}

async function initPersonPage() {
  const nameEl = document.getElementById("personName");
  if (nameEl) nameEl.textContent = "載入中...";

  const backBtn = document.getElementById("personDetailBackBtn");
  if (backBtn) backBtn.addEventListener("click", goBack);

  initReportHeadline();

  try {
    const params = getPersonParams();
    const { id, regionCode } = params;

    if (!id || !regionCode) {
      throw new Error("網址參數缺失");
    }

    const personalData = await fetchPersonDetailData(id, regionCode);

    if (!personalData || !personalData.Profile) {
      const urlParams = new URLSearchParams(globalThis.location.search);
      const returnUrl = urlParams.get("returnUrl");
      const backUrl = returnUrl
        ? decodeURIComponent(returnUrl)
        : `${globalThis.location.origin}/dashboard/index.html`;

      document.body.innerHTML = `
        <div class="text-center mt-5">
          <p class="text-danger fs-5">找不到相關資料</p>
          <button class="btn btn-secondary" id="notFoundBackBtn">返回</button>
        </div>`;

      document.getElementById("notFoundBackBtn").onclick = () => {
        globalThis.location.href = backUrl;
      };
      return;
    }

    const profile = personalData.Profile;
    const datas = personalData.Datas || [];
    const originalDatas = [...datas];

    if (nameEl) nameEl.textContent = profile.Name;

    const infoEl = document.getElementById("personInfo");
    if (infoEl) {
      infoEl.innerHTML = `
        <div class="meta-item">
          <div class="meta-label" data-lang="gender">${t("gender")}</div>
          <div class="meta-value">${genderText(profile.Gender)}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label" data-lang="age">${t("age")}</div>
          <div class="meta-value">${profile.Age}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label" data-lang="serialNumber">${t("serialNumber")}</div>
          <div class="meta-value">${profile.Number}</div>
        </div>
      `;
    }

    applyLanguage();

    const assessments = datas.map((d) => {
      const a = {
        Date: d.Date,
        ChairSecond: d.SPPB?.Chairtest?.Second ?? null,
        BalanceScore:
          (d.SPPB?.Balancetest?.balance1?.Score ?? 0) +
          (d.SPPB?.Balancetest?.balance2?.Score ?? 0) +
          (d.SPPB?.Balancetest?.balance3?.Score ?? 0),
        GaitSpeed: d.SPPB?.Gaitspeed?.Speed ?? null,
        RiskRate: d.Risk ?? null,
      };
      a.status = getClinicalStatus(a);
      return a;
    });

    setPersonFilteredAssessments(assessments);

    renderTable(datas);
    setupCheckboxes(datas);

    const headline = document.getElementById("reportHeadline");
    if (headline && assessments.length) {
      const latest = assessments[assessments.length - 1];
      headline.dataset.status = latest.status || "neutral";
      updateHeadlineUI();
    }

    if (drawAllCharts) drawAllCharts(assessments);

    const dateInput = document.getElementById("dateRange");
    const clearBtn = document.getElementById("clearBtn");

    if (typeof flatpickr !== "undefined" && dateInput) {
      const lang = localStorage.getItem("lang") || "zh";

      const fp = flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "Y/m/d",
        locale: getFlatpickrLocale(lang),
        onReady(selectedDates, dateStr, instance) {
          if (instance.altInput) {
            instance.altInput.placeholder =
              t("dateRangePlaceholder") || "請選擇日期範圍";
          }
        },
        onChange(selectedDates) {
          if (selectedDates.length === 2) {
            const [start, end] = selectedDates;
            const filtered = originalDatas.filter((d) => {
              const dDate = new Date(d.Date);
              const endDate = new Date(end);
              endDate.setHours(23, 59, 59, 999);
              return dDate >= start && dDate <= endDate;
            });

            renderTable(filtered);
            setupCheckboxes(filtered);
          }
        },
      });

      if (clearBtn) {
        clearBtn.onclick = () => {
          fp.clear();
          renderTable(originalDatas);
          setupCheckboxes(originalDatas);
        };
      }
    }
  } catch (err) {
    console.error("初始化失敗:", err);
  }
}

document.addEventListener("DOMContentLoaded", initPersonPage);
