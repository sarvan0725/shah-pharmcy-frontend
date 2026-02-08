// ================================
// USER OTP AUTH SYSTEM
// ================================

let otpSent = false;

// Backend URL
const API_URL = "https://shah-pharmacy-backend.onrender.com";

// Open login modal
function openLogin() {
  document.getElementById("auth-section").style.display = "block";
}

// Close login modal
function closeLogin() {
  document.getElementById("auth-section").style.display = "none";
}

// Send OTP
async function sendOTP() {
  const phone = document.getElementById("mobile").value.trim();

  if (!phone) {
    alert("Enter mobile number");
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
      alert("OTP sent");

      otpSent = true;

      document.getElementById("otp-box").style.display = "block";
      document.getElementById("verify-otp-btn").style.display = "block";
      document.getElementById("send-otp-btn").style.display = "none";
    } else {
      alert(data.message || "Failed to send OTP");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
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
    const res = await fetch(`${API_URL}/api/otp/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Login successful");

      // Save user
      const user = { phone };
      localStorage.setItem("currentUser", JSON.stringify(user));

      closeLogin();
      location.reload();
    } else {
      alert(data.message || "Invalid OTP");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}
