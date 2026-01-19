class PharmacyAPI {
  constructor() {
    this.baseURL = window.APP_CONFIG.API_BASE_URL;
  }

  // =====================
  // Helper method for API calls
  // =====================
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // =====================
  // PRODUCT APIs
  // =====================
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  // 🔥 FIXED CATEGORY API (IMPORTANT)
  async getCategories() {
    return this.request('/products/categories/tree');
  }

  // =====================
  // USER APIs
  // =====================
  async getUserStats(userId) {
    return this.request(`/users/${userId}/stats`);
  }

  async getUserWallet(userId) {
    return this.request(`/users/${userId}/wallet`);
  }

  async getActiveDiscount(userId) {
    return this.request(`/users/${userId}/active-discount`);
  }
}

// ✅ CREATE GLOBAL INSTANCE (VERY IMPORTANT)
window.pharmacyAPI = new PharmacyAPI();
console.log("✅ pharmacyAPI initialized");
