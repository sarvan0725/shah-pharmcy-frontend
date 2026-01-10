// admin-access.js
// This file protects admin dashboard pages

(function () {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    alert("Please login as admin");
    window.location.href = "./admin-login/index.html";
    return;
  }

  if (user.role !== "admin") {
    alert("Access denied: Admin only");
    localStorage.clear();
    window.location.href = "./admin-login/index.html";
  }
})();
