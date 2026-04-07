// ======== Cookie 基本操作 ========

// 設定 Cookie
// name: Cookie 名稱
// value: Cookie 值
// days: 過期天數
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // 將當前時間加上指定天數
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`; // 設定 cookie
}

// 取得 Cookie 值
// name: 要取得的 Cookie 名稱
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null; // 若找到則回傳值，否則回傳 null
}

// ======== 語系切換功能 ========

// file: 語系對應的 HTML 檔名
// langCode: 語系代碼 (zh/en/ja/ko)
function switchLanguage(file, langCode) {
  // 取得 URL 查詢參數，例如 ?region=高雄
  const params = new URLSearchParams(window.location.search);
  const region = params.get("region"); // 取得地區參數

  // 若有地區參數，保留它；否則直接用語系頁面
  const url = region ? `${file}?region=${encodeURIComponent(region)}` : file;

  // 若使用者已同意 Cookie，則更新偏好語系
  if (getCookie("cookieConsent") === "accepted") {
    setCookie("preferredLang", langCode, 30); // 儲存偏好語系，有效期 30 天
  }

  // 導向新的語系頁面
  window.location.href = url;
}

// ======== Cookie 同意彈窗處理 ========
window.addEventListener("DOMContentLoaded", () => {
  const consentBox = document.getElementById("cookieConsent"); // 彈窗容器
  const acceptBtn = document.getElementById("acceptCookies"); // 同意按鈕
  const rejectBtn = document.getElementById("rejectCookies"); // 不同意按鈕

  const consentStatus = getCookie("cookieConsent"); // 取得使用者的 Cookie 同意狀態

  // 若使用者尚未同意或拒絕 → 顯示彈窗
  if (!consentStatus) {
    consentBox.style.display = "block";
  } else {
    // 已同意或拒絕 → 隱藏彈窗
    consentBox.style.display = "none";

    // 若已同意，且有偏好語系，且非當前頁面 → 自動跳轉到使用者偏好語系頁面
    if (consentStatus === "accepted") {
      const savedLang = getCookie("preferredLang") || "zh"; // 取得偏好語系，預設中文
      const currentPage = window.location.pathname.split("/").pop(); // 取得目前頁面檔名
      const langMap = {
        zh: "index.html",
        en: "index_en.html",
        ja: "index_ja.html",
        ko: "index_ko.html",
      };

      if (langMap[savedLang] && currentPage !== langMap[savedLang]) {
        window.location.href = langMap[savedLang]; // 導向使用者偏好語系
      }
    }
  }

  // 點選「同意」按鈕
  acceptBtn.addEventListener("click", () => {
    setCookie("cookieConsent", "accepted", 30); // 設定已同意 Cookie

    // 儲存當前語系為偏好語系
    const currentPage = window.location.pathname.split("/").pop(); // 取得當前頁面檔名
    const pageLangMap = {
      "index.html": "zh",
      "index_en.html": "en",
      "index_ja.html": "ja",
      "index_ko.html": "ko",
    };
    const langCode = pageLangMap[currentPage] || "zh";
    setCookie("preferredLang", langCode, 30); // 儲存偏好語系

    consentBox.style.display = "none"; // 隱藏彈窗
  });

  // 點選「不同意」按鈕
  rejectBtn.addEventListener("click", () => {
    setCookie("cookieConsent", "rejected", 30); // 設定已拒絕 Cookie
    consentBox.style.display = "none"; // 隱藏彈窗
  });
});
