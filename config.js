/*************************************************

 CONFIGURATION FILE
 Shah Pharmacy & Mini Mart
 
 
 Update these settings before deployment
*************************************************/

// BACKEND API BASE URL (PRODUCTION)
 
const API_BASE_URL = "https://shah-pharmacy-backend.onrender.com/api";

// PAYMENT CONFIGURATION
// Replace with your actual Razorpay Key ID from dashboard
// BACKEND API BASE URL (PRODUCTION)
const RAZORPAY_KEY_ID = 'rzp_test_Rt82KwTYuXIf63';

// BUSINESS SETTINGS
const BUSINESS_CONFIG = {
  // Minimum order amount for delivery (in rupees)
  minOrderAmount: 500,
  
  // Delivery settings
  maxDeliveryDistance: 20,    // Maximum delivery distance in km
  freeDeliveryDistance: 3,    // Free delivery within this distance
  deliveryChargePerKm: 10,    // Charge per km after free distance
  
  // Business hours (24-hour format)
  deliveryStartHour: 9,       // 9 AM
  deliveryEndHour: 21,        // 9 PM
  
  // Contact information
  phone1: '9369009763',
  phone2: '7905190933',
  whatsappNumber: '919369009763',
  
  // Business address
  address: 'Banjariya Road, Near Naval\'s National Academy Junior, Khalilabad - Sant Kabir Nagar',
  
  // Shop location coordinates (for delivery distance calculation)
  shopLocation: {
    lat: 26.7606,
    lng: 83.0732
  }
};

// FEATURE FLAGS
const FEATURES = {
  enableRazorpayPayment: true,    // Set to false to disable online payments
  enableLocationTracking: true,   // Set to false to disable GPS location
  enableAIAssistant: true,        // Set to false to disable AI chat
  enableQRCodes: true,           // Set to false to disable QR code feature
  enableUserAuth: false,         // Set to true when user system is ready
  enableCoinsSystem: false       // Set to true when coins system is ready
};

// RAZORPAY CONFIGURATION
const RAZORPAY_CONFIG = {
  key: RAZORPAY_KEY_ID,
  currency: 'INR',
  name: 'Shah Pharmacy & Mini Mart',
  description: 'Online Medicine & Grocery Store',
  image: 'https://via.placeholder.com/100x100?text=SP', // Replace with actual logo
  theme: {
    color: '#00B761'
  }
};

// EXPORT FOR USE IN OTHER FILES
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RAZORPAY_KEY_ID,
    BUSINESS_CONFIG,
    FEATURES,
    RAZORPAY_CONFIG
  };
}
