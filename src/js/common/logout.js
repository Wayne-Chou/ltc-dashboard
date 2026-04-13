// src/js/common/logout.js
import { getCookie } from "./cookie.js";
import { BASE_URL } from "./config.js"; // 確保 config.js 裡面有 export BASE_URL

/**
 * 初始化登出按鈕
 */
export function initLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    const token = getCookie("fongai_token");

    try {
      if (token) {
        // 直接使用 import 的 BASE_URL
        const url = `${BASE_URL}/dashboard/logout`;

        await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (err) {
      console.error("登出失敗:", err);
    } finally {
      // 清除 token 並導回登入頁
      document.cookie =
        "fongai_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      globalThis.location.replace("login.html");
    }
  });
}
