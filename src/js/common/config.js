// src/js/common/config.js

/**
 * 全站共用設定 (API 基礎路徑)
 * 這裡改為 export const，方便其他模組 import
 */
export const BASE_URL = "https://service.fongai.co/WebAPI/api";

/**
 * 為了讓那些還沒改寫 import 的舊檔案（或 HTML inline script）能動，
 * 我們保留掛載到 window 的動作。
 */
window.APP_CONFIG = {
  BASE_URL: BASE_URL,
};

// 導出一個預設對象，方便整體引入
export default {
  BASE_URL,
};
