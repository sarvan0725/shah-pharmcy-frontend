// admin-access.js
// This file protects admin dashboard pages

(function () {
    const isAdmin = localStorage.getItem("isAdmin");

    if (isAdmin !== "true") {
        alert("Please login as admin");
        window.location.href = "/admin-login.html";
        return;
    }
})();
