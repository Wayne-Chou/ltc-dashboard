// src/js/common/cookie.js
import { switchLanguage, currentLang } from "./i18n.js";

// ======== Cookie 基本操作 ========

export function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

export function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ======== Cookie 同意彈窗處理 ========

export function initCookieConsent() {
  const consentBox = document.getElementById("cookieConsent");
  const acceptBtn = document.getElementById("acceptCookies");
  const rejectBtn = document.getElementById("rejectCookies");

  if (!consentBox || !acceptBtn || !rejectBtn) return;

  const consentStatus = getCookie("cookieConsent");

  // 1. 若尚未決定 → 顯示彈窗
  if (!consentStatus) {
    consentBox.style.display = "block";
  } else {
    consentBox.style.display = "none";

    // 2. 若已同意，檢查是否有偏好語系需要自動切換 (不跳轉頁面，只改內容)
    if (consentStatus === "accepted") {
      const savedLang = getCookie("preferredLang");
      // 如果存的語系跟現在渲染的不一樣，就切換它
      if (savedLang && savedLang !== currentLang) {
        switchLanguage(savedLang);
      }
    }
  }

  // 點選「同意」
  acceptBtn.addEventListener("click", () => {
    setCookie("cookieConsent", "accepted", 30);
    // 儲存當前正在使用的語系作為偏好
    setCookie("preferredLang", currentLang, 30);
    consentBox.style.display = "none";
  });

  // 點選「不同意」
  rejectBtn.addEventListener("click", () => {
    setCookie("cookieConsent", "rejected", 30);
    consentBox.style.display = "none";
  });
}
