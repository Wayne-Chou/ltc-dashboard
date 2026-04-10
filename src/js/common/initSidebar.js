// src/js/common/initSidebar.js

/**
 * 側邊欄收合功能初始化
 */
export function initSidebarToggle() {
  const sidebar = document.getElementById("mySidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  const toggleIcon = document.getElementById("toggleIcon");

  if (!sidebar || !toggleBtn) return;

  // 移除可能重複綁定的監聽器（Vite 熱更新時常用技巧）
  toggleBtn.removeEventListener("click", toggleHandler);
  toggleBtn.addEventListener("click", toggleHandler);

  function toggleHandler() {
    sidebar.classList.toggle("collapsed");

    const isCollapsed = sidebar.classList.contains("collapsed");

    // 切換 Bootstrap Icons 圖示
    if (toggleIcon) {
      if (isCollapsed) {
        toggleIcon.classList.replace("bi-chevron-left", "bi-chevron-right");
      } else {
        toggleIcon.classList.replace("bi-chevron-right", "bi-chevron-left");
      }
    }
  }
}

// 導出至 window，讓 main.js 呼叫或 HTML inline script 使用
window.initSidebarToggle = initSidebarToggle;
