class PharmacyAPI {
  constructor() {
    this.baseURL = window.APP_CONFIG.API_BASE_URL;
  }

  // Helper method for API calls
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

  // Product APIs
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getCategories() {
    return this.request('/products/categories');
  }
}

// ✅ CREATE GLOBAL INSTANCE (VERY IMPORTANT)
window.pharmacyAPI = new PharmacyAPI();
console.log("✅ pharmacyAPI initialized");
