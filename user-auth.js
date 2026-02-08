// =====================================
// USER OTP AUTH SYSTEM
// =====================================

// Global state
let otpSent = false;
let currentUser = null;

// Backend URL
const API_URL = "https://shah-pharmacy-backend.onrender.com";

// =====================================
// OPEN LOGIN MODAL
// =====================================
function openLogin() {
    const section = document.getElementById("auth-section");
    if (section) {
        section.style.display = "block";
    }
}

// =====================================
// CLOSE LOGIN MODAL
// =====================================
function closeLogin() {
    const section = document.getElementById("auth-section");
    if (section) {
        section.style.display = "none";
    }
}

// =====================================
// SEND OTP
// =====================================
async function sendOTP() {
    const phoneInput = document.getElementById("mobile");
    if (!phoneInput) return alert("Mobile input not found");

    const phone = phoneInput.value.trim();

    if (!phone) {
        alert("Enter mobile number");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/otp/send-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ phone })
        });

        const data = await res.json();

        if (data.success) {
            otpSent = true;

            // Show OTP box
            document.getElementById("otp-box").style.display = "block";
            document.getElementById("verify-otp-btn").style.display = "block";
            document.getElementById("send-otp-btn").style.display = "none";

            alert("OTP sent to your phone");
        } else {
            alert(data.message || "OTP failed");
        }

    } catch (err) {
        console.error("OTP send error:", err);
        alert("Server error while sending OTP");
    }
}

// =====================================
// VERIFY OTP
// =====================================
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
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ phone, otp })
        });

        const data = await res.json();

        if (data.success) {
            currentUser = phone;

            alert("Login successful");

            closeLogin();
            showAppSection();

        } else {
            alert("Invalid OTP");
        }

    } catch (err) {
        console.error("OTP verify error:", err);
        alert("Server error while verifying OTP");
    }
}

// =====================================
// AFTER LOGIN SHOW APP
// =====================================
function showAppSection() {
    const auth = document.getElementById("auth-section");
    const app = document.getElementById("app-section");

    if (auth) auth.style.display = "none";
    if (app) app.style.display = "block";
}

// =====================================
// AUTO CHECK USER ON LOAD
// =====================================
document.addEventListener("DOMContentLoaded", () => {
    // Optional: hide app until login
    const app = document.getElementById("app-section");
    if (app) {
        app.style.display = "none";
    }
});
