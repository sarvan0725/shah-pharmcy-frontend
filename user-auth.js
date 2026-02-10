// ===============================
// USER OTP AUTH SYSTEM
// ===============================

// Global state
var otpSent = false;

// Backend URL
const API_URL = "https://shah-pharmacy-backend.onrender.com";

// Open login modal
function openLogin() {
  const section = document.getElementById("auth-section");
  if (section) {
    section.style.display = "block";
  }
}

// Close login modal
function closeLogin() {
  const section = document.getElementById("auth-section");
  if (section) {
    section.style.display = "none";
  }
}

// Send OTP
async function sendOTP() {
  const phoneInput = document.getElementById("mobile");
  if (!phoneInput) return;

  const phone = phoneInput.value.trim();

  if (!phone || phone.length < 10) {
    alert("Enter valid mobile number");
    return;
  }

  try {
    const res = await fetch(API_URL + "/api/otp/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    if (data.success) {
      otpSent = true;

      document.getElementById("otp-box").style.display = "block";
      document.getElementById("verify-otp-btn").style.display = "block";

      alert("OTP sent successfully");
    } else {
      alert("Failed to send OTP");
    }
  } catch (err) {
    console.error(err);
    alert("Error sending OTP");
  }
}

// Verify OTP
async function verifyOTP() {
  const phone = document.getElementById("mobile").value.trim();
  const otp = document.getElementById("otp").value.trim();

  if (!otp) {
    alert("Enter OTP");
    return;
  }

  try {
    const res = await fetch(API_URL + "/api/otp/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Login successful");
      closeLogin();
    } else {
      alert("Invalid OTP");
    }
  } catch (err) {
    console.error(err);
    alert("Error verifying OTP");
  }
}
