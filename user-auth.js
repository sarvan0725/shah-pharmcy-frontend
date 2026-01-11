// ===============================
// USER AUTH SYSTEM (FRONTEND)
// ===============================

let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  updateUI();
  console.log("✅ user-auth.js loaded");
});

// ---------- REGISTER ----------
function register() {
  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !mobile || !password) {
    alert("❌ All fields required");
    return;
  }

  const user = { name, mobile, password };

  localStorage.setItem("currentUser", JSON.stringify(user));
  currentUser = user;

  alert("✅ Registered successfully");
  updateUI();
}

// ---------- LOGIN ----------
function login() {
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();

  const savedUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!savedUser) {
    alert("❌ No user found. Please register first");
    return;
  }

  if (
    savedUser.mobile === mobile &&
    savedUser.password === password
  ) {
    currentUser = savedUser;
    alert("✅ Login successful");
    updateUI();
  } else {
    alert("❌ Invalid credentials");
  }
}

// ---------- LOGOUT ----------
function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  updateUI();
}

// ---------- UI CONTROL ----------
function updateUI() {
  const authSection = document.getElementById("auth-section");
  const mainContent = document.querySelector(".main-content");

  if (currentUser) {
    authSection.style.display = "none";
    mainContent.style.display = "block";

    document
      .querySelectorAll(".user-name")
      .forEach(el => (el.textContent = currentUser.name));
  } else {
    authSection.style.display = "block";
    mainContent.style.display = "none";
  }
}
