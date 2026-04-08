// logout.js
function initLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    const token =
      typeof getCookie === "function" ? getCookie("fongai_token") : null;

    try {
      if (token) {
        await fetch(`${BASE_URL}/dashboard/logout`, {
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
      window.location.replace("login.html");
    }
  });
}
