// ================================
// PRODUCTION CONFIG (SINGLE SOURCE)
// ================================

// Global App Config
window.APP_CONFIG = {

  API_BASE_URL: "https://shah-pharmacy-backend.onrender.com/api",

  RAZORPAY_KEY_ID: "rzp_live_xxxxx", // <-- Apna live key daal

  BUSINESS_CONFIG: {
    minOrderAmount: 500,
    maxDeliveryDistance: 20,
    freeDeliveryDistance: 3,
    deliveryChargePerKm: 10,
    deliveryStartHour: 9,
    deliveryEndHour: 21,
    phone1: "9792997667",
    phone2: "7905190933",
    whatsappNumber: "919792997667",
    address: "BanjarIya Road, Near Naval's National Academy Junior, Khalilabad - Sant Kabir Nagar",
    shopLocation: {
      lat: 26.7606,
      lng: 83.0732
    }
  },

  FEATURES: {
    enableRazorpayPayment: true,
    enableLocationTracking: true,
    enableAIAssistant: true,
    enableQRCodes: true,
    enableUserAuth: true,
    enableCoinsSystem: true
  }

};

// Short global aliases
window.API_BASE_URL = window.APP_CONFIG.API_BASE_URL;
window.BUSINESS_CONFIG = window.APP_CONFIG.BUSINESS_CONFIG;
window.RAZORPAY_KEY_ID = window.APP_CONFIG.RAZORPAY_KEY_ID;

console.log("Config loaded successfully");
