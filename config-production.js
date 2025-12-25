// Production Configuration
const PRODUCTION_CONFIG = {
  // API Base URL (Update with your backend URL)
  API_BASE_URL: 'https://shah-pharmacy-backend.onrender.com/api',
  
  // Razorpay Configuration
  RAZORPAY_KEY_ID: 'rzp_test_Rt82KwTYuXIf63',
  
  // Business Settings
  BUSINESS_CONFIG: {
    minOrderAmount: 500,
    maxDeliveryDistance: 20,
    freeDeliveryDistance: 3,
    deliveryChargePerKm: 10,
    deliveryStartHour: 9,
    deliveryEndHour: 21,
    phone1: '9792997667',
    phone2: '7905190933',
    whatsappNumber: '919792997667',
    address: 'Banjariya Road, Near Naval\'s National Academy Junior, Khalilabad - Sant Kabir Nagar',
    shopLocation: {
      lat: 26.7606,
      lng: 83.0732
    }
  },
  
  // Feature Flags
  FEATURES: {
    enableRazorpayPayment: true,
    enableLocationTracking: true,
    enableAIAssistant: true,
    enableQRCodes: true,
    enableUserAuth: true,
    enableCoinsSystem: true
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRODUCTION_CONFIG;
}