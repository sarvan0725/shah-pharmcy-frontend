// ============================================
// USER OTP AUTH SYSTEM (Frontend)
// Shah Pharmacy & Mini Mart
// ============================================

let otpSent = false;

// Backend URL (Render)
const API_URL = "https://shah-pharmacy-backend.onrender.com";

// ============================================
// AUTO LOGIN CHECK (Page Load)
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("currentUser");

  if (user) {
    showAppSection();
  } else {
    showAuthSection();
  }
});

// ============================================
// UI SECTION CONTROL
// ============================================
function showAuthSection() {
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("app-section").style.display = "none";
}

function showAppSection() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("app-section").style.display = "block";

  // Update Side Menu Name
  const userPhone = localStorage.getItem("currentUser");
  if (userPhone) {
    document.getElementById("guest-name").innerText = userPhone;
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("logout-btn").style.display = "block";
  }
}

// ============================================
// SEND OTP FUNCTION
// ============================================
async function sendOTP() {
  const phone = document.getElementById("mobile").value.trim();

  if (!phone) {
    alert("Enter Mobile Number");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/otp/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    if (data.success) {
      otpSent = true;

      alert("OTP Sent Successfully ✅");

      // Show OTP Input Box
      document.getElementById("otp-box").style.display = "block";
      document.getElementById("send-otp-btn").style.display = "none";
      document.getElementById("verify-otp-btn").style.display = "block";
    } else {
      alert("OTP Failed ❌ " + data.error);
    }
  } catch (err) {
    alert("Server Error ❌");
    console.log(err);
  }
}

// ============================================
// VERIFY OTP FUNCTION
// ============================================
async function verifyOTP() {
  const phone = document.getElementById("mobile").value.trim();
  const otp = document.getElementById("otp").value.trim();

  if (!otp) {
    alert("Enter OTP");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/otp/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Login Successful ✅");

      // Save User Login
      localStorage.setItem("currentUser", phone);

      // Open Main App
      showAppSection();
    } else {
      alert("Invalid OTP ❌");
    }
  } catch (err) {
    alert("Server Error ❌");
    console.log(err);
  }
}

// ============================================
// LOGOUT FUNCTION
// ============================================
function logoutUser() {
  localStorage.removeItem("currentUser");

  alert("Logged Out Successfully ✅");

  // Reset UI
  document.getElementById("otp-box").style.display = "none";
  document.getElementById("send-otp-btn").style.display = "block";
  document.getElementById("verify-otp-btn").style.display = "none";

  document.getElementById("guest-name").innerText = "Guest User";
  document.getElementById("login-btn").style.display = "block";
  document.getElementById("logout-btn").style.display = "none";

  showAuthSection();
}
