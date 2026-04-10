// src/js/login/login.js
import { BASE_URL } from "../common/config.js";
import { LANG_DATA } from "./lang.js";

/**
 * Cookie 輔助工具
 */
const CookieHelper = {
  get(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  },
  set(name, value, minutes = 30) {
    const d = new Date();
    d.setTime(d.getTime() + minutes * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  },
  delete(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },
};

// 當前頁面狀態
let currentLang = "zh";
let currentErrorKey = null;

document.addEventListener("DOMContentLoaded", () => {
  // --- UI 元件綁定 ---
  const ui = {
    mainTitle: document.getElementById("mainTitle"),
    loginTitle: document.getElementById("loginTitle"),
    loginBtnText: document.getElementById("loginBtnText"),
    loginBtn: document.getElementById("loginBtn"),
    langTitle: document.getElementById("langTitle"),
    langSelect: document.getElementById("languageSelect"),
    loginForm: document.getElementById("loginForm"),
    usernameInput: document.getElementById("username"),
    passwordInput: document.getElementById("password"),
    loginAlert: document.getElementById("loginAlert"),
    togglePassword: document.getElementById("togglePassword"),
    eyeIcon: document.getElementById("eyeIcon"),
    rememberCheckbox: document.getElementById("rememberMe"),
    labelRemember: document.getElementById("labelRemember"),
    labelAcc: document.getElementById("labelAccount"),
    labelPass: document.getElementById("labelPassword"),
  };

  // --- 初始化作業 ---

  // 1. 檢查是否有逾時跳回的參數
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("reason") === "expired") {
    currentErrorKey = "tokenExpired";
    ui.loginAlert.className = "alert alert-warning d-block";
  }

  // 2. 檢查記住帳號
  const savedUsername = localStorage.getItem("savedUsername");
  if (savedUsername) {
    ui.usernameInput.value = savedUsername;
    ui.rememberCheckbox.checked = true;
  }

  // 3. 檢查現有 Token 有效性 (自動登入)
  validateCurrentToken();

  // 4. 初次文字渲染
  updateTexts();

  // --- 事件監聽 ---

  // 語系切換
  ui.langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    updateTexts();
  });

  // 密碼顯示切換
  ui.togglePassword.addEventListener("click", () => {
    const isPass = ui.passwordInput.type === "password";
    ui.passwordInput.type = isPass ? "text" : "password";
    ui.eyeIcon.classList.replace(
      isPass ? "bi-eye-slash" : "bi-eye",
      isPass ? "bi-eye" : "bi-eye-slash",
    );
  });

  // 登入提交
  ui.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const t = LANG_DATA[currentLang];

    // 重置狀態
    ui.loginAlert.className = "alert d-none";
    currentErrorKey = null;
    ui.loginBtn.disabled = true;
    const originalBtnText = ui.loginBtnText.textContent;
    ui.loginBtnText.textContent = t.verifying;

    try {
      const response = await fetch(`${BASE_URL}/dashboard/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: ui.usernameInput.value.trim(),
          password: ui.passwordInput.value,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.Data) {
          CookieHelper.set("fongai_token", result.Data, 30);
        }

        // 記住帳號邏輯
        if (ui.rememberCheckbox.checked) {
          localStorage.setItem("savedUsername", ui.usernameInput.value.trim());
        } else {
          localStorage.removeItem("savedUsername");
        }

        performRedirect();
      } else if (response.status === 401) {
        CookieHelper.delete("fongai_token");
        ui.loginAlert.className = "alert alert-warning d-block";
        ui.loginAlert.textContent = t.err401;
      } else {
        ui.loginAlert.className = "alert alert-danger d-block";
        ui.loginAlert.textContent = `${t.errServer} (${response.status})`;
      }
    } catch (error) {
      ui.loginAlert.className = "alert alert-danger d-block";
      ui.loginAlert.textContent = t.errNetwork;
    } finally {
      ui.loginBtn.disabled = false;
      ui.loginBtnText.textContent = originalBtnText;
    }
  });

  /**
   * 更新畫面上的多語系文字
   */
  function updateTexts() {
    const t = LANG_DATA[currentLang];
    if (!t) return;

    ui.mainTitle.textContent = t.mainTitle;
    ui.loginTitle.textContent = t.loginTitle;
    ui.loginBtnText.textContent = t.loginBtn;
    ui.langTitle.textContent = t.langTitle;
    ui.labelAcc.textContent = t.labelAccount;
    ui.labelPass.textContent = t.labelPassword;
    ui.labelRemember.textContent = t.labelRemember;
    ui.langSelect.value = currentLang;

    // 如果當前有顯示錯誤提示，同步更新其語言
    if (currentErrorKey && !ui.loginAlert.classList.contains("d-none")) {
      ui.loginAlert.textContent = t[currentErrorKey];
    }
  }

  /**
   * 驗證當前 Token 是否有效，有效則自動跳轉
   */
  async function validateCurrentToken() {
    const token = CookieHelper.get("fongai_token");
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/dashboard/validate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        performRedirect();
      } else {
        CookieHelper.delete("fongai_token");
      }
    } catch (e) {
      console.warn("Token validation failed:", e);
    }
  }

  /**
   * 執行頁面跳轉
   */
  function performRedirect() {
    const redirect = new URLSearchParams(window.location.search).get(
      "redirect",
    );
    const targetUrl = redirect ? decodeURIComponent(redirect) : "index.html";
    window.location.replace(targetUrl);
  }
});
