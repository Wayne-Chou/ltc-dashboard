// 側邊欄收合功能
function initSidebarToggle() {
  const sidebar = document.getElementById("mySidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  const toggleIcon = document.getElementById("toggleIcon");

  if (!sidebar || !toggleBtn) return;

  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");

    const isCollapsed = sidebar.classList.contains("collapsed");

    if (isCollapsed) {
      toggleIcon.classList.replace("bi-chevron-left", "bi-chevron-right");
    } else {
      toggleIcon.classList.replace("bi-chevron-right", "bi-chevron-left");
    }
  });
}
