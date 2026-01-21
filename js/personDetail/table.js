function convertToAssessments(datas) {
  return datas.map((d) => ({
    Date: d.Date,
    ChairSecond: d.SPPB?.Chairtest?.Second ?? null,
    BalanceScore:
      (d.SPPB?.Balancetest?.balance1?.Score ?? 0) +
      (d.SPPB?.Balancetest?.balance2?.Score ?? 0) +
      (d.SPPB?.Balancetest?.balance3?.Score ?? 0),
    GaitSpeed: d.SPPB?.Gaitspeed?.Speed ?? null,
    RiskRate: d.Risk ?? null,
  }));
}

// ===== 渲染表格 =====
window.renderTable = function (datas) {
  const container = document.getElementById("personTable");

  if (!datas || datas.length === 0) {
    container.innerHTML = `
      <div class="text-muted py-3 text-center">
        ${t("alertNoData")}
      </div>`;
    return;
  }

  let html = `<div class="record-list">`;

  datas.forEach((d, index) => {
    const dateText = d.Date
      ? new Date(d.Date).toLocaleDateString()
      : t("unknown");

    const sitStand =
      d.SPPB?.Chairtest?.Second != null
        ? d.SPPB.Chairtest.Second.toFixed(2) + " " + t("seconds")
        : "-";

    const gait =
      d.SPPB?.Gaitspeed?.Speed != null
        ? d.SPPB.Gaitspeed.Speed.toFixed(2) + " cm/s"
        : "-";

    const b1 = d.SPPB?.Balancetest?.balance1?.Score ?? "-";
    const b2 = d.SPPB?.Balancetest?.balance2?.Score ?? "-";
    const b3 = d.SPPB?.Balancetest?.balance3?.Score ?? "-";

    const risk = d.Risk != null ? getRiskLabel(d.Risk) : "-";

    html += `
      <label class="record-item">
        <input
          type="checkbox"
          class="row-check"
          data-index="${index}"
          checked
        />
        <div class="record-content">
          <div class="record-date">${dateText}</div>

          <div class="record-metrics">
            <span>${t("sitStand")} <b>${sitStand}</b></span>
            <span>${t("gaitSpeed")} <b>${gait}</b></span>
            <span class="risk">${t("fallRisk")} <b>${risk}</b></span>
          </div>

          <div class="record-balance">
            <div class="balance-title">${t("balance")}</div>
            <ul class="balance-list">
              <li>${t("balance1")}：<b>${b1}</b></li>
              <li>${t("balance2")}：<b>${b2}</b></li>
              <li>${t("balance3")}：<b>${b3}</b></li>
            </ul>
          </div>
        </div>
      </label>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
};

// ===== checkbox / 全選 / 取消全選 =====
window.setupCheckboxes = function (datas) {
  const rowChecks = document.querySelectorAll(".row-check");
  const checkAllBtn = document.getElementById("checkAllBtn");
  const uncheckAllBtn = document.getElementById("uncheckAllBtn");
  const hint = document.querySelector(".panel-hint");

  const hintLang =
    LANG[window.currentLang]?.tableHint ||
    LANG[window.currentLang]?.headline?.tableHint;

  function format(str, vars) {
    return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  }

  function updateCompareHint(selectedDatas, compareDatas) {
    if (!hint || !hintLang) return;

    if (selectedDatas.length === 0) {
      hint.dataset.state = "";
      hint.textContent = hintLang.empty;
      return;
    }

    if (selectedDatas.length === 1) {
      hint.dataset.state = "warn";
      hint.textContent = hintLang.single;
      return;
    }

    const dates = compareDatas.map((d) =>
      new Date(d.Date).toLocaleDateString()
    );

    hint.dataset.state = "ok";

    if (selectedDatas.length > 2) {
      hint.textContent = format(hintLang.multi, {
        count: selectedDatas.length,
        d1: dates[0],
        d2: dates[1],
      });
    } else {
      hint.textContent = format(hintLang.comparing, {
        d1: dates[0],
        d2: dates[1],
      });
    }
  }

  function updateCharts() {
    const selectedIndexes = Array.from(rowChecks)
      .filter((c) => c.checked)
      .map((c) => parseInt(c.dataset.index));

    const selectedDatas = selectedIndexes.map((i) => datas[i]);

    const allAssessments = convertToAssessments(selectedDatas);
    window.drawAllCharts(allAssessments);

    const compareDatas = [...selectedDatas]
      .filter((d) => d?.Date)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date))
      .slice(0, 2);

    if (compareDatas.length < 2) {
      renderTrendSummary(null);
    } else {
      const compareAssessments = convertToAssessments(compareDatas);
      renderTrendSummary(calculateTrend(compareAssessments));
    }

    updateCompareHint(selectedDatas, compareDatas);
  }

  rowChecks.forEach((c) => c.addEventListener("change", updateCharts));

  checkAllBtn.addEventListener("click", () => {
    if (window.isEmptyByDateFilter) return;
    rowChecks.forEach((c) => (c.checked = true));
    updateCharts();
  });

  uncheckAllBtn.addEventListener("click", () => {
    if (window.isEmptyByDateFilter) return;
    rowChecks.forEach((c) => (c.checked = false));
    updateCharts();
  });

  updateCharts();
};
