// main.js

// ===== 1. 日期語系處理函式 =====
function getFlatpickrLocale(lang) {
  switch (lang) {
    case "zh":
    case "zh-TW":
      return flatpickr.l10ns.zh_tw;
    case "ja":
      return flatpickr.l10ns.ja;
    case "ko":
      return flatpickr.l10ns.ko;
    case "en":
    default:
      return flatpickr.l10ns.default;
  }
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

function genderText(g) {
  return g === 1 ? t("male") : t("female");
}

async function initPersonPage() {
  const nameEl = document.getElementById("personName");
  if (nameEl) nameEl.textContent = "載入中...";

  try {
    const params = window.getPersonParams();
    const { id, regionCode } = params;

    if (!id || !regionCode) {
      throw new Error("網址參數缺失");
    }

    // 呼叫 API 取得資料
    const personalData = await window.fetchPersonDetailData(id, regionCode);

    if (!personalData || !personalData.Profile) {
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get("returnUrl");

      const backUrl = returnUrl
        ? decodeURIComponent(returnUrl)
        : window.location.origin + "/dashboard/index.html";

      document.body.innerHTML = `
  <div class="text-center mt-5">
    <p class="text-danger fs-5">找不到相關資料</p>
    <button class="btn btn-secondary" id="notFoundBackBtn">
      返回
    </button>
  </div>`;

      document.getElementById("notFoundBackBtn").onclick = () => {
        window.location.href = backUrl;
      };

      return;
    }
    const profile = personalData.Profile;
    const datas = personalData.Datas || [];
    const originalDatas = datas;

    if (nameEl) nameEl.textContent = profile.Name;
    const infoEl = document.getElementById("personInfo");
    if (infoEl) {
      infoEl.innerHTML = `
        <div class="meta-item">
          <div class="meta-label" data-lang="gender">性別</div>
          <div class="meta-value">${genderText(profile.Gender)}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label" data-lang="age">年齡</div>
          <div class="meta-value">${profile.Age}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label" data-lang="serialNumber">編號</div>
          <div class="meta-value">${profile.Number}</div>
        </div>
      `;
    }

    if (window.applyLanguage) window.applyLanguage();

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

    window.filteredAssessments = assessments;

    if (typeof renderTable === "function") renderTable(datas);
    if (typeof setupCheckboxes === "function") setupCheckboxes(datas);

    const headline = document.getElementById("reportHeadline");
    if (headline && assessments.length) {
      const latest = assessments[assessments.length - 1];
      headline.dataset.status = latest.status || "neutral";
      if (window.updateHeadlineUI) window.updateHeadlineUI(latest);
    }

    if (window.drawAllCharts) window.drawAllCharts(assessments);

    if (window.flatpickr && document.getElementById("dateRange")) {
      const lang = window.currentLang || "zh";

      flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "Y/m/d",
        locale: getFlatpickrLocale(lang),
        onReady(selectedDates, dateStr, instance) {
          if (instance.altInput) {
            instance.altInput.placeholder =
              typeof t === "function"
                ? t("dateRangePlaceholder")
                : "請選擇日期範圍";
          }
        },
        onChange(selectedDates) {
          if (selectedDates.length === 2) {
            const [start, end] = selectedDates;
            const filtered = originalDatas.filter((d) => {
              const dDate = new Date(d.Date);
              return dDate >= start && dDate <= end;
            });
            if (typeof renderTable === "function") renderTable(filtered);
          }
        },
      });
    }
  } catch (err) {
    console.error("初始化失敗:", err);
  }
}
function goBack() {
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get("returnUrl");

  if (returnUrl) {
    window.location.href = decodeURIComponent(returnUrl);
  } else {
    window.location.href = "/dashboard/index.html";
  }
}
document.addEventListener("DOMContentLoaded", initPersonPage);
