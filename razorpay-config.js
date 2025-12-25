// Razorpay Configuration
const RAZORPAY_CREDENTIALS = {
    keyId: 'rzp_test_Rt82KwTYuXIf63',
    keySecret: 'v4JhIC4Uw051OjAZMULPVNn3' // Keep this secure - never expose in frontend
};

// Export for backend use only
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAZORPAY_CREDENTIALS;
}