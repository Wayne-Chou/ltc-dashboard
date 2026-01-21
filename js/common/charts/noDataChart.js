// js/common/charts/noDataChart.js

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

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#888";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t("alertNoData"), canvas.width / 2, canvas.height / 2);

    if (!canvas.parentElement.querySelector(".no-data-overlay")) {
      const overlay = document.createElement("div");
      overlay.classList.add("no-data-overlay");
      Object.assign(overlay.style, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        pointerEvents: "auto",
        zIndex: 10,
      });

      canvas.parentElement.style.position = "relative";
      canvas.parentElement.appendChild(overlay);
    }
  });
}

function removeNoDataOverlay() {
  document
    .querySelectorAll(".no-data-overlay")
    .forEach((overlay) => overlay.remove());
}
