/* ===============================
   USER LOGIN SYSTEM (NO OTP)
================================= */

function userLogin() {
  const nameEl = document.getElementById("uName");
  const phoneEl = document.getElementById("uPhone");
  const addressEl = document.getElementById("uAddress");

  if (!nameEl || !phoneEl || !addressEl) {
    alert("Login fields not found in HTML");
    return;
  }

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const address = addressEl.value.trim();

  if (!name || !phone || !address) {
    alert("Please fill all details");
    return;
  }

  if (phone.length !== 10 || isNaN(phone)) {
    alert("Enter valid 10 digit phone number");
    return;
  }

  const user = {
    name,
    phone,
    address,
    loginTime: new Date().toISOString()
  };

  localStorage.setItem("currentUser", JSON.stringify(user));

  alert("Login successful!");

  // close modal
  const modal = document.getElementById("auth-section");
  if (modal) modal.style.display = "none";

  updateNavbarUser();
}


/* ===============================
   HELPERS
================================= */

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function isUserLoggedIn() {
  return localStorage.getItem("currentUser") !== null;
}

function userLogout() {
  localStorage.removeItem("currentUser");
  alert("Logged out successfully");
  window.location.reload();
}


/* ===============================
   NAVBAR NAME UPDATE
================================= */

function updateNavbarUser() {
  const user = getCurrentUser();
  const userDisplay = document.getElementById("userDisplay");

  if (user && userDisplay) {
    userDisplay.innerText = "Hi, " + user.name;
  }
}

document.addEventListener("DOMContentLoaded", updateNavbarUser);


/* ===============================
   PROFILE CLICK HANDLER
================================= */

function handleUserProfileClick() {
  const user = getCurrentUser();
  const modal = document.getElementById("auth-section");

  if (!user) {
    if (modal) modal.style.display = "flex";
  } else {
    alert("Logged in as: " + user.name);
  }
}
