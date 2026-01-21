const ref = document.referrer;
if (ref.includes("index_en.html")) {
  window.currentLang = "en";
} else if (ref.includes("index_ja.html")) {
  window.currentLang = "ja";
} else if (ref.includes("index_ko.html")) {
  window.currentLang = "ko";
} else {
  window.currentLang = "zh";
}

const LANG = {
  zh: {
    alertNoData: "查無資料",
    Select: "選取",
    Date: "檢測日期",
    sitStand: "坐站秒數",
    balance: "平衡",
    balance1: "平衡得分-雙腳並排站立",
    balance2: "平衡得分-雙腳半並排站立",
    balance3: "平衡得分-雙腳直線站立",
    gaitSpeed: "步行速度",
    fallRisk: "跌倒風險",
    seconds: "秒",
    points: "分",
    sitStandTrend: "坐站秒數趨勢",
    balanceTrend: "平衡測驗得分",
    gaitTrend: "步行速度趨勢",
    aiFallRisk: "AI跌倒風險機率",
    suggestSit: "建議小於12秒",
    suggestBalance: "建議大於3.5分",
    suggestGait: "建議大於等於100cm/s",
    downloadImage: "下載圖檔",
    personalTrend: "個人變化趨勢",
    name: "姓名",
    gender: "性別",
    age: "年齡",
    selectAll: "全選",
    unselectAll: "取消全選",
    back: "← 返回上一頁",
    male: "男",
    female: "女",
    riskLabel: {
      high: "危險",
      slightlyHigh: "高",
      medium: "中",
      slightlyLow: "稍低",
      low: "低",
      unknown: "未知",
    },
    dates: "日期",
    trendSummary: {
      noData: "至少需要兩筆資料才能顯示指標變化",
      title: "指標變化趨勢",
      compareText: "與",
      compareSuffix: "的比較，顯示每項指標變化情況",
      items: {
        sitStand: "坐站秒數",
        balance: "平衡得分",
        gait: "步行速度",
        risk: "AI跌倒風險",
      },
    },
    dateRangePlaceholder: "請選擇日期範圍",
    clear: "清除",
    compareRange: "比較區間",
    headline: {
      status: {
        ok: "狀態穩定",
        warn: "需持續追蹤",
        bad: "需立即關注",
        noData: "資料不足",
      },
      title: {
        noData: "需要至少兩筆評估資料",
        sitStandSlow: "坐站秒數變慢",
        sitStandFast: "坐站秒數變快",
        balanceUp: "平衡能力上升",
        balanceDown: "平衡能力下降",
        gaitUp: "步行速度上升",
        gaitDown: "步行速度下降",
        riskUp: "跌倒風險上升",
        riskDown: "跌倒風險下降",
      },
      desc: {
        ok: "多數指標變化不大，建議維持現行訓練並定期複測。",
        warn: "部分指標出現明顯變化，建議持續追蹤並確認是否需要調整訓練或照護計畫。",
        bad: "整體呈現退化趨勢，尤其風險變化較大。建議優先檢視最近一次評估與介入方案。",
        noData: "請先在表格勾選或確認資料是否完整。",
      },
    },
    tableHint: {
      empty: "請選擇評估紀錄以檢視趨勢與比較分析",
      single: "僅選擇 1 筆評估紀錄，無法進行比較分析",
      multi:
        "已選擇 {count} 筆評估紀錄，比較分析將以最近兩筆（{d1}、{d2}）為準",
      comparing: "正在比較 {d1} 與 {d2} 的評估結果",
    },
    headlineLoading: "載入分析中…",
    headlineDefaultTitle: "近期功能變化重點",
    headlineDefaultDesc: "系統自動比對最近兩筆評估結果，提供臨床判讀建議。",

    panelTrendSummary: "評估變化重點摘要",
    panelRecordList: "評估紀錄明細",
    panelRecordHint: "可勾選兩筆資料來比較趨勢摘要",
    panelTrendChart: "趨勢分析圖表",
    panelTrendChartHint: "圖表提供趨勢視覺化，摘要區提供快速判讀",
  },
  en: {
    alertNoData: "No data",
    Select: "Select",
    Date: "Date",
    sitStand: "Sit-Stand (s)",
    balance: "balance",
    balance1: "Balance Score - Feet Together",
    balance2: "Balance Score - Semi-Tandem",
    balance3: "Balance Score - Tandem",
    gaitSpeed: "Gait Speed",
    fallRisk: "Fall Risk",
    seconds: "s",
    points: "pts",
    sitStandTrend: "Sit-Stand Trend",
    balanceTrend: "Balance Test Score",
    gaitTrend: "Gait Speed Trend",
    aiFallRisk: "AI Fall Risk Probability",
    suggestSit: "Recommended: < 12 seconds",
    suggestBalance: "Recommended: > 3.5 points",
    suggestGait: "Recommended: ≥ 100 cm/s",
    downloadImage: "Download Image",
    personalTrend: "Personal Progress Trend",
    name: "Name",
    gender: "Gender",
    age: "Age",
    selectAll: "Select All",
    unselectAll: "Unselect All",
    back: "← Back",
    male: "Male",
    female: "Female",
    riskLabel: {
      high: "Danger",
      slightlyHigh: "high",
      medium: "middle",
      slightlyLow: "Slightly lower",
      low: "Low",
      unknown: "Unknown",
      dates: "Date",
    },
    trendSummary: {
      noData: "At least two records are required to show trend changes.",
      title: "Trend Changes Summary",
      compareText: "compared with",
      compareSuffix: ", showing changes for each indicator.",
      items: {
        sitStand: "Sit-to-Stand Time",
        balance: "Balance Score",
        gait: "Gait Speed",
        risk: "AI Fall Risk",
      },
    },
    dateRangePlaceholder: "Select date range",
    clear: "Clear",
    compareRange: "Comparison Period",
    headline: {
      status: {
        ok: "Stable",
        warn: "Monitor Closely",
        bad: "Immediate Attention Required",
        noData: "Insufficient Data",
      },
      title: {
        noData: "At Least Two Assessments Are Required",
        sitStandSlow: "Sit-to-Stand Time Increased",
        sitStandFast: "Sit-to-Stand Time Improved",
        balanceUp: "Balance Performance Improved",
        balanceDown: "Balance Performance Declined",
        gaitUp: "Gait Speed Improved",
        gaitDown: "Gait Speed Declined",
        riskUp: "Fall Risk Increased",
        riskDown: "Fall Risk Reduced",
      },
      desc: {
        ok: "Most indicators remain stable. It is recommended to continue the current training plan and reassess regularly.",
        warn: "Some indicators show notable changes. Continued monitoring and possible adjustment of the training or care plan are recommended.",
        bad: "An overall decline is observed, particularly with increased risk indicators. Immediate review of the latest assessment and intervention plan is recommended.",
        noData:
          "Please ensure that at least two valid assessment records are selected.",
      },
      tableHint: {
        empty:
          "Please select assessment records to view trends and comparisons.",
        single: "Only one record selected. Comparison is not available.",
        multi:
          "{count} records selected. Comparison will use the latest two ({d1}, {d2}).",
        comparing: "Comparing assessment results from {d1} and {d2}.",
      },
    },
    headlineLoading: "Analyzing data…",
    headlineDefaultTitle: "Recent Functional Changes",
    headlineDefaultDesc:
      "The system automatically compares the two most recent assessments to support clinical interpretation.",

    panelTrendSummary: "Key Trend Summary",
    panelRecordList: "Assessment Records",
    panelRecordHint: "Select two records to compare trend changes",
    panelTrendChart: "Trend Analysis Charts",
    panelTrendChartHint:
      "Charts visualize trends, while the summary provides quick clinical insights.",
  },
  ja: {
    alertNoData: "データなし",
    Select: "選択",
    Date: "検査日",
    sitStand: "座立秒数",
    balance: "バランス",
    balance1: "バランススコア - 並立",
    balance2: "バランススコア - 半並立",
    balance3: "バランススコア - 直線立位",
    gaitSpeed: "歩行速度",
    fallRisk: "転倒リスク",
    seconds: "秒",
    points: "点",
    sitStandTrend: "座立秒数の推移",
    balanceTrend: "バランステスト得点",
    gaitTrend: "歩行速度の推移",
    aiFallRisk: "AI転倒リスク確率",
    suggestSit: "推奨：12秒未満",
    suggestBalance: "推奨：3.5点以上",
    suggestGait: "推奨：100cm/s 以上",
    downloadImage: "画像をダウンロード",
    personalTrend: "個人の変化傾向",
    name: "氏名",
    gender: "性別",
    age: "年齢",
    selectAll: "全選択",
    unselectAll: "全選択解除",
    back: "← 戻る",
    male: "男性",
    female: "女性",
    riskLabel: {
      high: "危険",
      slightlyHigh: "高い",
      medium: "真ん中",
      slightlyLow: "わずかに低い",
      low: "低い",
      unknown: "不明",
    },
    dates: "日付",
    trendSummary: {
      noData: "指標の変化を表示するには、少なくとも2件のデータが必要です。",
      title: "指標変化の推移",
      compareText: "と",
      compareSuffix: "を比較し、各指標の変化を表示します。",
      items: {
        sitStand: "座立秒数",
        balance: "バランス得点",
        gait: "歩行速度",
        risk: "AI転倒リスク",
      },
    },
    dateRangePlaceholder: "日付範囲を選択",
    clear: "クリア",
    compareRange: "比較期間",
    headline: {
      status: {
        ok: "状態は安定しています",
        warn: "継続的な経過観察が必要です",
        bad: "早急な対応が必要です",
        noData: "データ不足",
      },
      title: {
        noData: "評価データが2件以上必要です",
        sitStandSlow: "座立動作の所要時間が増加しています",
        sitStandFast: "座立動作の所要時間が改善しています",
        balanceUp: "バランス能力が向上しています",
        balanceDown: "バランス能力が低下しています",
        gaitUp: "歩行速度が向上しています",
        gaitDown: "歩行速度が低下しています",
        riskUp: "転倒リスクが上昇しています",
        riskDown: "転倒リスクが低下しています",
      },
      desc: {
        ok: "多くの指標に大きな変化は見られません。現行の訓練を継続し、定期的な再評価を推奨します。",
        warn: "一部の指標に明確な変化が見られます。継続的な観察と、必要に応じた訓練・介入内容の見直しを推奨します。",
        bad: "全体的に機能低下の傾向が見られ、特にリスク指標の変化が顕著です。直近の評価結果および介入計画の確認を強く推奨します。",
        noData: "表から少なくとも2件の有効な評価データを選択してください。",
      },
      tableHint: {
        empty: "評価記録を選択して、傾向と比較分析を表示してください。",
        single: "1件のみ選択されています。比較分析はできません。",
        multi:
          "{count}件の評価記録が選択されています。最新2件（{d1}、{d2}）で比較します。",
        comparing: "{d1} と {d2} の評価結果を比較しています。",
      },
    },
    headlineLoading: "分析中…",
    headlineDefaultTitle: "最近の機能変化の要点",
    headlineDefaultDesc:
      "直近2回の評価結果を自動比較し、臨床的な判断を支援します。",

    panelTrendSummary: "評価変化の重要ポイント",
    panelRecordList: "評価記録一覧",
    panelRecordHint: "2件の記録を選択して変化の傾向を比較できます",
    panelTrendChart: "傾向分析グラフ",
    panelTrendChartHint:
      "グラフで傾向を可視化し、要約で迅速な判断を支援します。",
  },
  ko: {
    alertNoData: "데이터 없음",
    Select: "선택",
    Date: "검사 날짜",
    sitStand: "좌/서 시간",
    balance: "균형",
    balance1: "균형 점수 - 양발 나란히",
    balance2: "균형 점수 - 반 텐덤",
    balance3: "균형 점수 - 직선 스탠드",
    gaitSpeed: "보행 속도",
    fallRisk: "낙상 위험",
    seconds: "초",
    points: "점",
    sitStandTrend: "좌/서 시간 추세",
    balanceTrend: "균형 검사 점수",
    gaitTrend: "보행 속도 추세",
    aiFallRisk: "AI 낙상 위험 확률",
    suggestSit: "권장: 12초 미만",
    suggestBalance: "권장: 3.5점 이상",
    suggestGait: "권장: 100cm/s 이상",
    downloadImage: "이미지 다운로드",
    personalTrend: "개인 변화 추세",
    name: "이름",
    gender: "성별",
    age: "나이",
    selectAll: "전체 선택",
    unselectAll: "전체 선택 해제",
    back: "← 뒤로가기",
    male: "남성",
    female: "여성",
    riskLabel: {
      high: "위험",
      slightlyHigh: "높은",
      medium: "가운데",
      slightlyLow: "약간 낮음",
      low: "낮은",
      unknown: "알 수 없음",
    },
    dates: "날짜",
    trendSummary: {
      noData: "지표 변화를 표시하려면 최소 두 개의 데이터가 필요합니다.",
      title: "지표 변화 추세",
      compareText: "와",
      compareSuffix: "의 비교를 통해 각 지표의 변화를 보여줍니다.",
      items: {
        sitStand: "좌/서 시간",
        balance: "균형 점수",
        gait: "보행 속도",
        risk: "AI 낙상 위험",
      },
    },
    dateRangePlaceholder: "날짜 범위를 선택하세요",
    clear: "초기화",
    compareRange: "비교 기간",
    headline: {
      status: {
        ok: "상태 안정",
        warn: "지속적인 관찰 필요",
        bad: "즉각적인 주의 필요",
        noData: "데이터 부족",
      },
      title: {
        noData: "최소 두 건의 평가 데이터가 필요합니다",
        sitStandSlow: "앉았다 일어서기 시간이 증가했습니다",
        sitStandFast: "앉았다 일어서기 시간이 개선되었습니다",
        balanceUp: "균형 능력이 향상되었습니다",
        balanceDown: "균형 능력이 저하되었습니다",
        gaitUp: "보행 속도가 향상되었습니다",
        gaitDown: "보행 속도가 저하되었습니다",
        riskUp: "낙상 위험이 증가했습니다",
        riskDown: "낙상 위험이 감소했습니다",
      },
      desc: {
        ok: "대부분의 지표에서 큰 변화는 관찰되지 않았습니다. 현재의 훈련 계획을 유지하고 정기적인 재평가를 권장합니다.",
        warn: "일부 지표에서 의미 있는 변화가 관찰됩니다. 지속적인 모니터링과 함께 훈련 또는 관리 계획의 조정이 필요할 수 있습니다.",
        bad: "전반적인 기능 저하가 관찰되며, 특히 위험 지표의 변화가 두드러집니다. 최근 평가 결과와 중재 계획에 대한 즉각적인 검토가 필요합니다.",
        noData: "표에서 최소 두 개의 유효한 평가 기록을 선택해 주세요.",
      },
      tableHint: {
        empty: "평가 기록을 선택하여 추세 및 비교 분석을 확인하세요.",
        single: "1개의 기록만 선택되어 비교 분석을 할 수 없습니다.",
        multi:
          "{count}개의 평가 기록이 선택되었습니다. 최신 두 개({d1}, {d2})를 비교합니다.",
        comparing: "{d1}와 {d2}의 평가 결과를 비교 중입니다.",
      },
    },
    headlineLoading: "분석 중…",
    headlineDefaultTitle: "최근 기능 변화 요약",
    headlineDefaultDesc:
      "시스템이 최근 두 건의 평가 결과를 자동으로 비교하여 임상 판단을 지원합니다.",

    panelTrendSummary: "평가 변화 핵심 요약",
    panelRecordList: "평가 기록 상세",
    panelRecordHint: "두 개의 기록을 선택하여 변화 추세를 비교할 수 있습니다",
    panelTrendChart: "추세 분석 차트",
    panelTrendChartHint:
      "차트를 통해 추세를 시각화하고 요약으로 빠른 판단을 돕습니다.",
  },
};
function t(key) {
  return LANG[window.currentLang][key] || key;
}

window.applyLanguage = function () {
  document.querySelectorAll("[data-lang]").forEach((el) => {
    const key = el.getAttribute("data-lang");

    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
};

// 性別文字對應
window.genderText = function (g) {
  if (g === 0) return t("female");
  if (g === 1) return t("male");
  return "Unknown";
};

// 風險中文對應
window.getRiskLabel = function (risk) {
  const label = t("riskLabel");
  if (risk > 50) return label.high;
  if (risk > 30) return label.slightlyHigh;
  if (risk > 17.5) return label.medium;
  if (risk > 5) return label.slightlyLow;
  return label.low;
};
