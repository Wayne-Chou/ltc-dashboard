// src/js/personDetail/main.js

// 💥 從語系檔引入 t 函式，確保 Vite 環境下可用
import { t } from "./lang.js";

// ===== 1. 日期語系處理函式 =====
function getFlatpickrLocale(lang) {
  const l = lang ? lang.toLowerCase() : "zh";
  if (l.includes("zh")) return flatpickr.l10ns.zh_tw;
  if (l.includes("ja")) return flatpickr.l10ns.ja;
  if (l.includes("ko")) return flatpickr.l10ns.ko;
  return flatpickr.l10ns.default;
}

// ===== 2. 臨床狀態規則 =====
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

// 💥 性別文字對應，增加相容性判斷
function genderText(g) {
  const isMale = g === 1 || g === "1";
  const isFemale = g === 0 || g === "0";
  if (isMale) return t("male");
  if (isFemale) return t("female");
  return t("unknown") || "Unknown";
}

// ===== 3. 主要初始化函式 =====
async function initPersonPage() {
  const nameEl = document.getElementById("personName");
  if (nameEl) nameEl.textContent = "載入中...";

  try {
    // 檢查全域 API 工具是否存在
    if (typeof window.getPersonParams !== "function") {
      throw new Error("找不到 window.getPersonParams，請檢查腳本載入順序");
    }

    const params = window.getPersonParams();
    const { id, regionCode } = params;

    if (!id || !regionCode) {
      throw new Error("網址參數缺失");
    }

    // 呼叫 API 取得資料
    const personalData = await window.fetchPersonDetailData(id, regionCode);

    if (!personalData || !personalData.Profile) {
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get("returnUrl");
      const backUrl = returnUrl
        ? decodeURIComponent(returnUrl)
        : window.location.origin + "/dashboard/index.html";

      document.body.innerHTML = `
        <div class="text-center mt-5">
          <p class="text-danger fs-5">找不到相關資料</p>
          <button class="btn btn-secondary" id="notFoundBackBtn">返回</button>
        </div>`;

      document.getElementById("notFoundBackBtn").onclick = () => {
        window.location.href = backUrl;
      };
      return;
    }

    const profile = personalData.Profile;
    const datas = personalData.Datas || [];
    const originalDatas = [...datas]; // 💥 備份原始資料，用於清除篩選

    if (nameEl) nameEl.textContent = profile.Name;

    // 渲染個人資訊欄位
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

    if (window.applyLanguage) window.applyLanguage();

    // 轉換資料供圖表與分析使用
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

    // 💥 將過濾後的數據存在全域，供 reportHeadline 使用
    window.filteredAssessments = assessments;

    // 初始渲染表格與勾選框
    if (typeof window.renderTable === "function") window.renderTable(datas);
    if (typeof window.setupCheckboxes === "function")
      window.setupCheckboxes(datas);

    // 更新報表頭部 (Headline)
    const headline = document.getElementById("reportHeadline");
    if (headline && assessments.length) {
      const latest = assessments[assessments.length - 1];
      headline.dataset.status = latest.status || "neutral";
      if (window.updateHeadlineUI) window.updateHeadlineUI(latest);
    }

    // 繪製初始圖表
    if (window.drawAllCharts) window.drawAllCharts(assessments);

    // ===== 4. Flatpickr 初始化與 Clear 邏輯 =====
    const dateInput = document.getElementById("dateRange");
    const clearBtn = document.getElementById("clearBtn");

    if (window.flatpickr && dateInput) {
      const lang = window.currentLang || "zh";

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
            // 💥 進行日期範圍篩選
            const filtered = originalDatas.filter((d) => {
              const dDate = new Date(d.Date);
              // 確保包含結束當天
              const endDate = new Date(end);
              endDate.setHours(23, 59, 59, 999);
              return dDate >= start && dDate <= endDate;
            });

            // 重新更新表格與 Checkbox (這會連動更新圖表)
            if (typeof window.renderTable === "function")
              window.renderTable(filtered);
            if (typeof window.setupCheckboxes === "function")
              window.setupCheckboxes(filtered);
          }
        },
      });

      // 💥 實作清除按鈕功能
      if (clearBtn) {
        clearBtn.onclick = () => {
          fp.clear(); // 清空日期選擇器
          // 恢復原始所有資料
          if (typeof window.renderTable === "function")
            window.renderTable(originalDatas);
          if (typeof window.setupCheckboxes === "function")
            window.setupCheckboxes(originalDatas);
        };
      }
    }
  } catch (err) {
    console.error("初始化失敗:", err);
  }
}

// ===== 5. 返回功能 =====
function goBack() {
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get("returnUrl");

  if (returnUrl) {
    window.location.href = decodeURIComponent(returnUrl);
  } else {
    window.location.href = "/ltc-dashboard/index.html";
  }
}

// 💥 必須掛載到 window，否則 HTML 的 onclick 抓不到
window.goBack = goBack;

// 啟動頁面
document.addEventListener("DOMContentLoaded", initPersonPage);
