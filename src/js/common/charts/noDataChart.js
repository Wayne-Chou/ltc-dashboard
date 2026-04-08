// js / common / charts / noDataChart.js;
function initEmptyCharts() {
  const charts = [
    "sitStandChartCanvas",
    "balanceChartCanvas",
    "gaitChartCanvas",
    "riskChartCanvas",
  ];

  charts.forEach((id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

function drawNoDataChart() {
  const charts = [
    "sitStandChartCanvas",
    "balanceChartCanvas",
    "gaitChartCanvas",
    "riskChartCanvas",
  ];

  charts.forEach((id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const parent = canvas.parentElement;

    // 避免重複
    if (parent.querySelector(".no-data-overlay")) return;

    parent.style.position = "relative";

    const overlay = document.createElement("div");
    overlay.className = "no-data-overlay";
    overlay.innerText = t("alertNoData");

    parent.appendChild(overlay);
  });
}

function removeNoDataOverlay() {
  document
    .querySelectorAll(".no-data-overlay")
    .forEach((overlay) => overlay.remove());
}
