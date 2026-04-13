// src/js/common/locale.js
/** 純翻譯與語系狀態（不依賴 personCard / table 等，避免循環 import） */
import { LANG } from "./lang.js";

export let currentLang =
  localStorage.getItem("lang") ||
  (navigator.language.startsWith("en")
    ? "en"
    : navigator.language.startsWith("ja")
      ? "ja"
      : "zh");

export function setCurrentLang(lang) {
  currentLang = lang;
}

function getNestedValue(obj, path) {
  if (!obj || !path) return null;
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
}

export function t(key) {
  const langDict = (typeof LANG !== "undefined" ? LANG[currentLang] : {}) || {};
  return getNestedValue(langDict, key) ?? key;
}

export function tLocation(key) {
  return LANG[currentLang]?.locations?.[key] || key;
}

export function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
    el.removeAttribute("data-original-text");
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.setAttribute("alt", t(el.dataset.i18nAlt));
  });
}
