// function initDownloadChart() {
//   document.querySelectorAll(".download-chart").forEach((btn) => {
//     btn.addEventListener("click", () => {
//       const targetId = btn.dataset.target;
//       const canvas = document.getElementById(targetId);
//       if (!canvas) return;

//       const ctx = canvas.getContext("2d");

//       // 加白底（避免透明）
//       ctx.save();
//       ctx.globalCompositeOperation = "destination-over";
//       ctx.fillStyle = "#ffffff";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       ctx.restore();

//       const image = canvas.toDataURL("image/png", 0.9);

//       const link = document.createElement("a");
//       link.href = image;
//       link.download = `${targetId}.png`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     });
//   });
// }

// window.initDownloadChart = initDownloadChart;
