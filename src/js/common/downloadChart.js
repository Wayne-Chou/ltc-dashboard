// src/js/common/downloadChart.js

/**
 * 初始化圖表下載功能 (個別圖表導出為 PNG)
 */
export function initDownloadChart() {
  const downloadButtons = document.querySelectorAll(".download-chart");

  downloadButtons.forEach((btn) => {
    // 移除舊有的監聽器以避免熱更新重複執行
    btn.removeEventListener("click", handleDownload);
    btn.addEventListener("click", handleDownload);
  });

  function handleDownload(e) {
    const btn = e.currentTarget;
    const targetId = btn.dataset.target;
    const canvas = document.getElementById(targetId);

    if (!canvas) {
      console.warn(`[DownloadChart] 找不到目標畫布: ${targetId}`);
      return;
    }

    // 建立一個臨時畫布來處理背景色，而不破壞原本的畫布內容
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    // 1. 填滿白底 (防止 PNG 透明導致在某些閱讀器下顯示黑色背景)
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 2. 將原圖表畫布內容繪製上去
    tempCtx.drawImage(canvas, 0, 0);

    // 3. 轉成圖片 URL (提高品質到 1.0)
    const image = tempCanvas.toDataURL("image/png", 1.0);

    // 4. 觸發下載
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Chart_${targetId}_${dateStr}.png`;

    const link = document.createElement("a");
    link.href = image;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 導出至 window 以相容原本的呼叫方式
window.initDownloadChart = initDownloadChart;
