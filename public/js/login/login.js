const BASE_URL = "https://service.fongai.co/WebAPI/api";
document.addEventListener("DOMContentLoaded", () => {
  async function validateOnLoginPage() {
    const token = getCookie("fongai_token");
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
        // token 還有效去儀錶板
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");

        if (redirect) {
          window.location.replace(decodeURIComponent(redirect));
        } else {
          window.location.replace("index.html");
        }
      }

      if (res.status === 401) {
        // token 已無效 → 清掉，留在 login
        deleteCookie("fongai_token");
        return;
      }
    } catch (e) {
      // validate 失敗時，留在 login
      console.warn("validate failed:", e);
    }
  }
  validateOnLoginPage();
  // --- 1. 自動跳轉檢查 (僅檢查 Cookie) ---
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  // 如果已有 token 且網址不是因為逾時跳回來的，才自動跳轉 index
  const urlParams = new URLSearchParams(window.location.search);
  const reason = urlParams.get("reason");

  // if (getCookie("fongai_token") && reason !== "expired") {
  //   window.location.replace("index.html");
  //   return;
  // }

  // --- 2. UI 元件定義 ---
  const langSelect = document.getElementById("languageSelect");
  const mainTitle = document.getElementById("mainTitle");
  const loginTitle = document.getElementById("loginTitle");
  const loginBtnText = document.getElementById("loginBtnText");
  const loginBtn = document.getElementById("loginBtn");
  const langTitle = document.getElementById("langTitle");
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginAlert = document.getElementById("loginAlert");
  const togglePassword = document.querySelector("#togglePassword");
  const eyeIcon = document.querySelector("#eyeIcon");
  const rememberCheckbox = document.getElementById("rememberMe");
  const savedUsername = localStorage.getItem("savedUsername");

  if (savedUsername) {
    usernameInput.value = savedUsername;
    rememberCheckbox.checked = true;
  }
  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    if (type === "password") {
      eyeIcon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
      eyeIcon.classList.replace("bi-eye-slash", "bi-eye");
    }
  });
  const labelAcc = document.getElementById("labelAccount");
  const labelPass = document.getElementById("labelPassword");

  let currentErrorKey = null;

  if (reason === "expired") {
    currentErrorKey = "tokenExpired";
    if (loginAlert) {
      loginAlert.className = "alert alert-warning d-block";
    }
  }

  // --- 3. 工具函式：設定 30 分鐘過期的 Cookie ---
  function setCookie(name, value, minutes = 30) {
    const d = new Date();
    d.setTime(d.getTime() + minutes * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }

  // --- 4. 多語系更新邏輯 ---
  function updateTexts() {
    const current = window.currentLang || "zh";
    const t = window.LANG[current];
    const labelRemember = document.getElementById("labelRemember");
    if (labelRemember) labelRemember.textContent = t.labelRemember;
    if (!t) return;

    if (mainTitle) mainTitle.textContent = t.mainTitle;
    if (loginTitle) loginTitle.textContent = t.loginTitle;
    if (loginBtnText) loginBtnText.textContent = t.loginBtn;
    if (langTitle) langTitle.textContent = t.langTitle;

    if (labelAcc) labelAcc.textContent = t.labelAccount;
    if (labelPass) labelPass.textContent = t.labelPassword;

    if (usernameInput) usernameInput.placeholder = "";
    if (passwordInput) passwordInput.placeholder = "";

    if (langSelect) langSelect.value = current;

    // 確保逾時訊息或錯誤訊息能根據語言變換文字
    if (currentErrorKey && !loginAlert.classList.contains("d-none")) {
      loginAlert.textContent = t[currentErrorKey];
    }
  }

  updateTexts();

  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      window.currentLang = e.target.value;
      updateTexts();
    });
  }

  // --- 5. 登入表單提交 ---
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const current = window.currentLang || "zh";
    const t = window.LANG[current];

    loginAlert.className = "alert d-none";
    currentErrorKey = null;

    loginBtn.disabled = true;
    const originalBtnText = loginBtnText.textContent;
    loginBtnText.textContent = t.verifying;

    try {
      const response = await fetch(`${BASE_URL}/dashboard/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: usernameInput.value.trim(),
          password: passwordInput.value,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.Data) {
          setCookie("fongai_token", result.Data, 30);
        }
        // ===== 記住帳號 =====
        if (rememberCheckbox.checked) {
          localStorage.setItem("savedUsername", usernameInput.value.trim());
        } else {
          localStorage.removeItem("savedUsername");
        }
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get("redirect");

        if (redirect) {
          window.location.replace(decodeURIComponent(redirect));
        } else {
          window.location.replace("index.html");
        }
      } else if (response.status === 401) {
        deleteCookie("fongai_token");
        currentErrorKey = "err401";
        loginAlert.className = "alert alert-warning d-block";
        loginAlert.textContent = t.err401;
      } else {
        currentErrorKey = "errServer";
        loginAlert.className = "alert alert-danger d-block";
        loginAlert.textContent = `${t.errServer} (${response.status})`;
      }
    } catch (error) {
      currentErrorKey = "errNetwork";
      loginAlert.className = "alert alert-danger d-block";
      loginAlert.textContent = t.errNetwork;
    } finally {
      loginBtn.disabled = false;
      loginBtnText.textContent = originalBtnText;
    }
  });
});

// 刪除cookie

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
