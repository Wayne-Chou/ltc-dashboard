/**********************************************************************
 * calculateTrend.js
 * 功能說明：
 * 1️⃣ 計算最近兩筆測量資料的變化百分比（趨勢分析）。
 * 2️⃣ 產生可供渲染的摘要，包括坐站秒數、平衡得分、步行速度、
 * AI跌倒風險的 ↑ / ↓ %。
 * 3️⃣ 依據前端 table.js 渲染的 assessments 資料。
 *
 * Vite 修正：
 * - 加入 export 供模組引入。
 * - 加入 window.calculateTrend 供全域呼叫。
 **********************************************************************/

/**
 * 計算最近兩筆資料的變化百分比
 * @param {Array} assessments - 格式化後的評估資料陣列
 */
export function calculateTrend(assessments) {
  // 1. 基本檢查：至少需要兩筆資料才能做比較
  if (!assessments || assessments.length < 2) {
    console.warn("calculateTrend: 資料不足兩筆，無法計算趨勢");
    return null;
  }

  // 2. 依日期排序，確保拿到最新兩筆 (由舊到新)
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
  );

  const last = sorted[sorted.length - 1]; // 最新測量 (New)
  const prev = sorted[sorted.length - 2]; // 前一次測量 (Old)

  /**
   * 計算百分比變化公式：((新值 - 舊值) / 舊值) * 100
   * 數值處理：
   * - 坐站秒數、風險：下降 (-) 代表進步
   * - 平衡、步速：上升 (+) 代表進步
   */
  const getChange = (newVal, oldVal) => {
    // 防呆：無資料或非數字
    if (newVal == null || oldVal == null || isNaN(newVal) || isNaN(oldVal)) {
      return null;
    }

    // 舊值為 0 的特殊處理，避免除以零報錯
    if (oldVal === 0) {
      if (newVal === 0) return 0;
      return newVal > 0 ? 100 : -100;
    }

    const change = ((newVal - oldVal) / oldVal) * 100;

    // 回傳保留兩位小數的數字
    return parseFloat(change.toFixed(2));
  };

  // 3. 封裝結果物件
  const trendResult = {
    // 坐站秒數 (ChairSecond)
    sitStand: getChange(last.ChairSecond, prev.ChairSecond),

    // 平衡測驗得分 (BalanceScore)
    balance: getChange(last.BalanceScore, prev.BalanceScore),

    // 步行速度 (GaitSpeed)
    gait: getChange(last.GaitSpeed, prev.GaitSpeed),

    // AI 跌倒風險 (RiskRate)
    risk: getChange(last.RiskRate, prev.RiskRate),

    // 日期存檔，供 UI 顯示「正在比較某日與某日」
    lastDate: last.Date,
    prevDate: prev.Date,
  };

  return trendResult;
}

/**
 * 💥 重要：全域掛載
 * 解決 Vite 模組隔離問題，確保 charts.js 或其他非模組檔案
 * 透過 window.calculateTrend() 就能抓到這個函式。
 */
window.calculateTrend = calculateTrend;
