// /js/common/url.js

// 取得網址參數函式
window.getPersonParams = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const regionParam = urlParams.get("region") || "0";

  let regionCode = null;
  if (regionParam !== "0") {
    regionCode = window.locationMap?.[regionParam]?.code || regionParam;
  }

  return { id, regionCode };
};

// API 請求函式
window.fetchPersonDetailData = async function (no, code) {
  const getSafeToken = () => {
    if (typeof getCookie === "function") return getCookie("fongai_token");

    const value = `; ${document.cookie}`;
    const parts = value.split(`; fongai_token=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const token = getSafeToken();
  const { BASE_URL } = window.APP_CONFIG || {
    BASE_URL: "https://service.fongai.co/WebAPI/api",
  };

  if (!token) {
    // console.error("Token 遺失，嘗試跳轉登入頁");
    const currentPath = window.location.pathname + window.location.search;

    // 改用 URL 帶參數跳轉，使用 encodeURIComponent 確保特殊符號不會出錯
    window.location.replace(
      `login.html?redirect=${encodeURIComponent(currentPath)}`,
    );
    return null;
  }

  const startTime = new Date("2024-01-01").getTime();
  const endTime = new Date("2026-12-31").getTime();

  try {
    const response = await fetch(`${BASE_URL}/dashboard/site/person`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: String(code),
        no: Number(no),
        startdate: startTime,
        enddate: endTime,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const currentPath = window.location.pathname + window.location.search;
        deleteCookie("fongai_token");

        window.location.replace(
          `login.html?redirect=${encodeURIComponent(currentPath)}`,
        );
      }

      throw new Error(`HTTP 錯誤: ${response.status}`);
    }

    const result = await response.json();
    return result.Data;
  } catch (err) {
    console.error("API 請求異常:", err);
    return null;
  }
};

// 刪除cookie

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
