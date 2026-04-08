/**********************************************************************
 * calculateTrend.js
 * 功能說明：
 *   1️⃣ 計算最近兩筆測量資料的變化百分比（趨勢分析）。
 *   2️⃣ 產生可供渲染的摘要，包括坐站秒數、平衡得分、步行速度、
 *      AI跌倒風險的 ↑ / ↓ %。
 *   3️⃣ 依據前端 table.js 渲染的 assessments 資料，也就是
 *      每個人的 SPPB 測量與 AI 風險數據。
 *
 * 使用時機：
 *   - 當資料載入完成並排序後，呼叫 calculateTrend() 計算趨勢。
 *   - 再呼叫 renderTrendSummary() 將結果渲染到 #trendSummary。
 *
 * 資料來源：
 *
 *     格式範例：
 *     [
 *       {
 *         Date: "2025-12-30",
 *         ChairSecond: 13.5,      // 坐站秒數
 *         BalanceScore: 3.7,      // 平衡測驗得分
 *         GaitSpeed: 95.3,        // 步行速度 (cm/s)
 *         RiskRate: 12.5           // AI跌倒風險 (%)
 *       },
 *       ...
 *     ]
 **********************************************************************/

// 計算最近兩筆資料的變化百分比
function calculateTrend(assessments) {
  if (!assessments || assessments.length < 2) return null;

  // 依日期排序，確保拿到最新兩筆
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.Date) - new Date(b.Date)
  );
  const last = sorted[sorted.length - 1]; // 最新測量
  const prev = sorted[sorted.length - 2]; // 前一次測量

  // 計算百分比變化公式：
  // (新值 - 舊值) / 舊值 * 100
  const getChange = (newVal, oldVal) => {
    if (newVal == null || oldVal == null) return null; // 無資料
    if (oldVal === 0) return newVal > 0 ? 100 : 0; // 舊值為 0 特殊處理
    return ((newVal - oldVal) / oldVal) * 100;
  };

  return {
    sitStand: getChange(last.ChairSecond, prev.ChairSecond),
    balance: getChange(last.BalanceScore, prev.BalanceScore),
    gait: getChange(last.GaitSpeed, prev.GaitSpeed),
    risk: getChange(last.RiskRate, prev.RiskRate),
    lastDate: last.Date,
    prevDate: prev.Date,
  };
}
