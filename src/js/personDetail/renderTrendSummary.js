/**********************************************************************
 * renderTrendSummary.js
 * 功能說明：
 * 1️⃣ 將趨勢百分比渲染到 #trendSummary 容器。
 * 2️⃣ 自動根據「越高越好」或「越低越好」判斷顏色（good/critical）。
 * 3️⃣ 支援多國語系切換。
 **********************************************************************/

import { LANG } from "./lang.js";

function detailLangKey() {
  return localStorage.getItem("lang") || "zh";
}

/**
 * 將趨勢百分比渲染到 #trendSummary
 * @param {Object|null} trend - 來自 calculateTrend 的結果
 * @param {Array|null} selectedDates - 選取的日期範圍 [startDate, endDate]
 */
export function renderTrendSummary(trend, selectedDates = null) {
  const container = document.getElementById("trendSummary");
  if (!container) return;

  const currentLang = detailLangKey();
  const langPack = LANG[currentLang]?.trendSummary;

  // 如果資料不足
  if (!trend || !langPack) {
    container.innerHTML = `
      <div class="trend-empty">
        <div class="trend-empty-icon">📊</div>
        <div class="trend-empty-text">
          ${langPack?.noData || "至少需要兩筆資料才能顯示指標變化"}
        </div>
      </div>
    `;
    return;
  }

  /**
   * renderArrow：內部輔助函式，用來決定箭頭方向與顏色
   * @param {number|null} val - 百分比變化數值
   * @param {object} options
   * @param {boolean} options.higherIsBetter - 該指標是否為越高越好
   */
  const renderArrow = (val, { higherIsBetter = true } = {}) => {
    if (val == null || isNaN(val)) return { text: "-", tone: "neutral" };

    // 判斷改善 or 退化
    const isImproved = higherIsBetter ? val > 0 : val < 0;
    const isWorse = higherIsBetter ? val < 0 : val > 0;

    if (isImproved) {
      return {
        text: `↑ ${Math.abs(val).toFixed(1)}%`,
        tone: "good", // 綠色/正面
      };
    }

    if (isWorse) {
      return {
        text: `↓ ${Math.abs(val).toFixed(1)}%`,
        tone: "critical", // 紅色/負面
      };
    }

    // 數值為 0
    return { text: "0%", tone: "watch" }; // 橘色或中性
  };

  // 定義要顯示的指標項目
  const items = [
    { key: "sitStand", value: trend.sitStand, higherIsBetter: false }, // 坐站：越快(少)越好
    { key: "balance", value: trend.balance, higherIsBetter: true }, // 平衡：分高越好
    { key: "gait", value: trend.gait, higherIsBetter: true }, // 步速：快(多)越好
    { key: "risk", value: trend.risk, higherIsBetter: false }, // 風險：低越好
  ];

  // 決定日期顯示文字
  let firstDateStr, secondDateStr;
  try {
    if (selectedDates && selectedDates.length === 2) {
      firstDateStr = new Date(selectedDates[0]).toLocaleDateString();
      secondDateStr = new Date(selectedDates[1]).toLocaleDateString();
    } else {
      firstDateStr = new Date(trend.prevDate).toLocaleDateString();
      secondDateStr = new Date(trend.lastDate).toLocaleDateString();
    }
  } catch (e) {
    firstDateStr = "-";
    secondDateStr = "-";
  }

  // 生成 HTML 結構 (使用 Bootstrap Grid)
  container.innerHTML = `
    <div class="row g-3">
      ${items
        .map((item) => {
          const arrow = renderArrow(item.value, {
            higherIsBetter: item.higherIsBetter,
          });

          // 取得該項目的語言名稱
          const itemTitle = langPack.items?.[item.key] || item.key;

          return `
            <div class="col-12 col-md-3">
              <div class="trend-card tone-${arrow.tone}">
                <div class="trend-card-title">
                  ${itemTitle}
                </div>
                <div class="trend-card-value">
                  ${arrow.text}
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

/**
 * 函式改以 ESM export 提供，供其他模組 import 使用。
 */
