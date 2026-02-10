// ===============================
// USER OTP AUTH SYSTEM
// ===============================

// Global state
let otpSent = false;

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
  const phone = phoneInput.value.trim();

  if (!phone || phone.length !== 10) {
    alert("Enter valid 10 digit mobile number");
    return;
  }

  try {
    const res = await fetch(API_URL + "/otp/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    if (data.success) {
      otpSent = true;

      // Show OTP box
      document.getElementById("otp-box").style.display = "block";
      document.getElementById("verify-otp-btn").style.display = "block";
      document.getElementById("send-otp-btn").style.display = "none";

      alert("OTP sent successfully");
    } else {
      alert(data.message || "Failed to send OTP");
    }
  } catch (err) {
    console.error(err);
    alert("Server error while sending OTP");
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
    const res = await fetch(API_URL + "/otp/verify-otp", {
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
      localStorage.setItem("currentUser", phone);

      // Close modal
      closeLogin();

      // Reload app
      location.reload();
    } else {
      alert(data.message || "Invalid OTP");
    }
  } catch (err) {
    console.error(err);
    alert("Server error while verifying OTP");
  }
}
