// js/common/downloadPdf.js

// function initDownloadPdf() {
//   const btn = document.getElementById("downloadBtn");

//   if (!btn) return;

//   btn.addEventListener("click", async () => {
//     const page = document.body;

//     btn.disabled = true;
//     btn.innerHTML = `<i class="bi bi-hourglass-split me-1"></i> ${t(
//       "generatingPDF"
//     )}`;

//     try {
//       const canvas = await html2canvas(page, {
//         scale: 2,
//         useCORS: true,
//         scrollY: 0,
//         windowWidth: document.documentElement.scrollWidth,
//         windowHeight: document.documentElement.scrollHeight,
//       });

//       const imgData = canvas.toDataURL("image/png");
//       const { jsPDF } = window.jspdf;
//       const pdf = new jsPDF("p", "mm", "a4");

//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const pageHeight = pdf.internal.pageSize.getHeight();

//       const imgWidth = pageWidth;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       let finalWidth = imgWidth;
//       let finalHeight = imgHeight;

//       if (imgHeight > pageHeight) {
//         const ratio = pageHeight / imgHeight;
//         finalWidth = imgWidth * ratio;
//         finalHeight = pageHeight;
//       }

//       const x = (pageWidth - finalWidth) / 2;
//       const y = 0;

//       pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

//       const fileName = `Dashboard_${new Date().toLocaleDateString(
//         "zh-TW"
//       )}.pdf`;
//       pdf.save(fileName);
//     } catch (error) {
//       console.error("PDF 產生失敗：", error);
//       alert("產生 PDF 時發生錯誤，請稍後再試。");
//     } finally {
//       btn.disabled = false;
//       btn.innerHTML = `<i class="bi bi-download me-1"></i> ${t("downloadPDF")}`;
//     }
//   });
// }
