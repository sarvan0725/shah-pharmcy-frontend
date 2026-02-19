/* ===============================
   USER LOGIN SYSTEM (NO OTP)
================================= */

function userLogin() {
  const name = document.getElementById("uName").value.trim();
  const phone = document.getElementById("uPhone").value.trim();
  const address = document.getElementById("uAddress").value.trim();

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
  window.location.reload();
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function userLogout() {
  localStorage.removeItem("currentUser");
  alert("Logged out successfully");
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  const userDisplay = document.getElementById("userDisplay");

  if (user && userDisplay) {
    userDisplay.innerText = "Hi, " + user.name;
  }
});

function handleUserProfileClick() {
  const user = getCurrentUser();

  if (!user) {
    const modal = document.getElementById("auth-section");
    if (modal) {
      modal.style.display = "flex";
    }
  } else {
    alert("Logged in as: " + user.name);
  }
}
