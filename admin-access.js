// admin-access.js
// This file should run ONLY on admin pages (dashboard)

(function () {
  const isAdminLoggedIn = localStorage.getItem("admin_logged_in");

  if (!isAdminLoggedIn) {
    alert("Admin access only. Please login.");
    window.location.href = "/admin-login.html";
  }
})();
