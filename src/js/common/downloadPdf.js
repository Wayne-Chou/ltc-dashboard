// src/js/common/downloadPdf.js
import { t } from "./lang.js";
import html2canvas from "html2canvas"; // 靜態匯入
import { jsPDF } from "jspdf";
/**
 * 初始化 PDF 下載功能
 */
export function initDownloadPdf() {
  const btn = document.getElementById("downloadBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    // 取得要截圖的範圍，通常是整個儀表板容器而非 body
    // 如果你的 main.js 把內容都塞進 #appView，改用這個會更乾淨
    const page = document.getElementById("appView") || document.body;

    btn.disabled = true;
    btn.innerHTML = `<i class="bi bi-hourglass-split me-1"></i> ${t("generatingPDF")}`;

    try {
      // 確保 html2canvas 存在 (若透過 CDN 引入，它在 window 下)
      const h2c = window.html2canvas || (await import("html2canvas")).default;

      const canvas = await h2c(page, {
        scale: 2, // 提高解析度
        useCORS: true, // 允許跨域圖片（例如地圖）
        logging: false,
        scrollY: -window.scrollY, // 修復捲動偏移 Bug
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      // 處理 jsPDF 引入
      const jspdfObj = window.jspdf ? window.jspdf.jsPDF : null;
      if (!jspdfObj) {
        throw new Error("找不到 jsPDF 函式庫，請檢查是否已正確引入。");
      }

      const pdf = new jspdfObj("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // 計算比例
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let finalWidth = imgWidth;
      let finalHeight = imgHeight;

      // 如果高度超過 A4，進行縮放
      if (imgHeight > pageHeight) {
        const ratio = pageHeight / imgHeight;
        finalWidth = imgWidth * ratio;
        finalHeight = pageHeight;
      }

      const x = (pageWidth - finalWidth) / 2;
      const y = 0;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

      const fileName = `FongAI_Dashboard_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF 產生失敗：", error);
      alert("產生 PDF 時發生錯誤，請稍後再試。");
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-download me-1"></i> ${t("downloadPDF")}`;
    }
  });
}

// 為了讓 main.js 能順利呼叫
window.initDownloadPdf = initDownloadPdf;
