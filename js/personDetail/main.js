// 日期語系
function getFlatpickrLocale(lang) {
  switch (lang) {
    case "zh":
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

// ===== 臨床狀態規則=====
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

const { id, file } = window.getPersonParams();
document.getElementById("personName").textContent = "載入中...";
const panelActions = document.querySelector(".panel-actions");
fetch(file)
  .then((res) => res.json())
  .then((all) => {
    const person = all.find((p) => String(p.Profile.Number) === String(id));
    if (!person) {
      document.body.innerHTML = `
        <div class="text-center mt-5">
          <p class="text-danger fs-5">找不到編號 ${id} 的資料</p>
          <button class="btn btn-secondary" onclick="history.back()">返回</button>
        </div>`;
      return;
    }

    const profile = person.Profile;
    const datas = person.Datas || [];

    const originalDatas = datas;
    let currentDatas = datas;
    let selectedRange = null;

    // ===== 基本資料 =====
    document.getElementById("personName").textContent = profile.Name;
    document.getElementById("personInfo").innerHTML = `
      <div class="meta-item">
        <div class="meta-label" data-lang="gender"></div>
        <div class="meta-value">${genderText(profile.Gender)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label" data-lang="age"></div>
        <div class="meta-value">${profile.Age}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">編號</div>
        <div class="meta-value">${profile.Number}</div>
      </div>
    `;
    applyLanguage();

    renderTable(currentDatas);
    setupCheckboxes(currentDatas);

    if (window.flatpickr) {
      flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "Y/m/d",
        locale: getFlatpickrLocale(window.currentLang),

        onReady(selectedDates, dateStr, instance) {
          const altInput = instance.altInput;
          if (altInput) {
            altInput.placeholder = t("dateRangePlaceholder");
          }
        },

        onChange(selectedDates) {
          if (selectedDates.length === 2) {
            selectedRange = selectedDates;
            applyDateFilter();
          }
        },
      });
    }

    function applyDateFilter() {
      if (!selectedRange || selectedRange.length !== 2) return;

      const [start, end] = selectedRange;

      currentDatas = originalDatas.filter((d) => {
        if (!d.Date) return false;
        const date = new Date(d.Date);
        return date >= start && date <= end;
      });

      renderTable(currentDatas);
      setupCheckboxes(currentDatas);
      if (panelActions) {
        if (currentDatas.length === 0) {
          panelActions.classList.add("hidden-by-filter");
        }
      }
    }

    document.getElementById("clearBtn")?.addEventListener("click", () => {
      selectedRange = null;
      currentDatas = originalDatas;

      const picker = document.getElementById("dateRange")._flatpickr;
      if (picker) picker.clear();

      renderTable(currentDatas);
      setupCheckboxes(currentDatas);
      if (panelActions) {
        panelActions.classList.remove("hidden-by-filter");
      }
    });

    // ===== 以下全部是你原本的圖表 / 狀態邏輯 =====
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

    const headline = document.getElementById("reportHeadline");
    if (headline && assessments.length) {
      const latest = assessments[assessments.length - 1];
      headline.dataset.status = latest.status || "neutral";

      const badge = headline.querySelector(".headline-badge");
      if (badge) badge.dataset.tone = latest.status || "neutral";

      const statusMap = {
        good: "穩定",
        watch: "需觀察",
        critical: "高風險",
      };
      const elStatus = document.getElementById("reportStatus");
      if (elStatus) elStatus.textContent = statusMap[latest.status] || "--";
    }

    const chartCards = document.querySelectorAll(".chart-card");
    if (chartCards.length && assessments.length) {
      const latest = assessments[assessments.length - 1];

      const sSit = getClinicalStatus({ ChairSecond: latest.ChairSecond });
      const sBal = getClinicalStatus({ BalanceScore: latest.BalanceScore });
      const sGait = getClinicalStatus({ GaitSpeed: latest.GaitSpeed });
      const sRisk = getClinicalStatus({ RiskRate: latest.RiskRate });

      if (chartCards[0]) chartCards[0].dataset.status = sSit;
      if (chartCards[1]) chartCards[1].dataset.status = sBal;
      if (chartCards[2]) chartCards[2].dataset.status = sGait;
      if (chartCards[3]) chartCards[3].dataset.status = sRisk;
    }

    if (window.drawAllCharts) {
      window.drawAllCharts(assessments);
    }
  })
  .catch((err) => {
    console.error(err);
    document.body.innerHTML = `
      <div class="text-center mt-5">
        <p class="text-danger fs-5">資料讀取失敗，請稍後再試</p>
      </div>`;
  });

// 返回
document
  .getElementById("backBtn")
  .addEventListener("click", () => history.back());
