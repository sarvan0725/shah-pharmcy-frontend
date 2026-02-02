// ===============================
// USER OTP AUTH SYSTEM (Frontend)
// ===============================

let otpSent = false;

// Backend URL (Render)
const API_URL = "https://shah-pharmacy-backend.onrender.com";

// -----------------------------
// Send OTP
// -----------------------------
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
    corresponding 
    });

    const data = await res.json();

    if (data.message) {
      alert("OTP Sent Successfully ✅");

      otpSent = true;

      // Show OTP input box
      document.getElementById("otpBox").style.display = "block";
    } else {
      alert("OTP Failed ❌");
    }
  } catch (err) {
    console.log(err);
    alert("Server Error");
  }
}

// -----------------------------
// Verify OTP
// -----------------------------
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

      // Save user session
      localStorage.setItem("currentUser", phone);

      // Redirect to Home / Side Menu page
      window.location.href = "index.html";
    } else {
      alert("Invalid OTP ❌");
    }
  } catch (err) {
    console.log(err);
    alert("Verification Failed");
  }
}

// -----------------------------
// Logout
// -----------------------------
function logoutUser() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
