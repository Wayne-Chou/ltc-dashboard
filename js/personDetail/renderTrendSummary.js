// 將趨勢百分比渲染到 #trendSummary
function renderTrendSummary(trend, selectedDates = null) {
  const container = document.getElementById("trendSummary");
  const langPack = LANG[currentLang]?.trendSummary;

  if (!trend) {
    container.innerHTML = `
      <div class="trend-empty">
        <div class="trend-empty-icon">📊</div>
        <div class="trend-empty-text">
          ${langPack.noData}
        </div>
      </div>
    `;
    return;
  }

  /**
   * renderArrow
   * @param {number|null} val - 百分比變化
   * @param {object} options
   * @param {boolean} options.higherIsBetter - 是否「越高越好」
   */
  const renderArrow = (val, { higherIsBetter = true } = {}) => {
    if (val == null) return { text: "-", tone: "neutral" };

    // 改善 or 退化（語意）
    const isImproved = higherIsBetter ? val > 0 : val < 0;
    const isWorse = higherIsBetter ? val < 0 : val > 0;

    if (isImproved) {
      return {
        text: `↑ ${Math.abs(val).toFixed(1)}%`,
        tone: "good",
      };
    }

    if (isWorse) {
      return {
        text: `↓ ${Math.abs(val).toFixed(1)}%`,
        tone: "critical",
      };
    }

    return { text: "→ 0%", tone: "watch" };
  };

  const items = [
    // 坐站秒數：越低越好
    { key: "sitStand", value: trend.sitStand, higherIsBetter: false },

    // 平衡：越高越好
    { key: "balance", value: trend.balance, higherIsBetter: true },

    // 步速：越高越好
    { key: "gait", value: trend.gait, higherIsBetter: true },

    // 跌倒風險：越低越好
    { key: "risk", value: trend.risk, higherIsBetter: false },
  ];

  let firstDateStr, secondDateStr;
  if (selectedDates && selectedDates.length === 2) {
    firstDateStr = new Date(selectedDates[0]).toLocaleDateString();
    secondDateStr = new Date(selectedDates[1]).toLocaleDateString();
  } else {
    firstDateStr = new Date(trend.prevDate).toLocaleDateString();
    secondDateStr = new Date(trend.lastDate).toLocaleDateString();
  }

  container.innerHTML = `
    <div class="row g-3">
      ${items
        .map((item) => {
          const arrow = renderArrow(item.value, {
            higherIsBetter: item.higherIsBetter,
          });
          return `
            <div class="col-12 col-md-3">
              <div class="trend-card tone-${arrow.tone}">
                <div class="trend-card-title">
                  ${langPack.items[item.key]}
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
