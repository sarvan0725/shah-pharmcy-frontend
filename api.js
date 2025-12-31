// API Configuration
class PharmacyAPI {
  constructor() {
    this.baseURL = window.APP_CONFIG.API_BASE_URL;
  }

  // =========================
  // Helper method for API calls
  // =========================
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

  // =========================
  // Authentication APIs
  // =========================
  sendOTP(phone) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  verifyOTP(phone, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
  }

  getUserProfile(userId) {
    return this.request(`/auth/profile/${userId}`);
  }

  updateUserProfile(userId, profileData) {
    return this.request(`/auth/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // =========================
  // Product APIs
  // =========================
  getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  getCategories() {
    return this.request('/products/categories');
  }

  getProduct(id) {
    return this.request(`/products/${id}`);
  }

  addProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  bulkImportProducts(products) {
    return this.request('/products/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ products })
    });
  }

  // =========================
  // Order APIs
  // =========================
  createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  getUserOrders(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders/user/${userId}?${queryString}`);
  }

  getOrderDetails(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  deleteOrder(orderId, userId = null) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/orders/${orderId}${params}`, {
      method: 'DELETE'
    });
  }

  getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders?${queryString}`);
  }

  // =========================
  // Admin APIs
  // =========================
  getDashboardAnalytics() {
    return this.request('/admin/dashboard');
  }

  getSalesAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/analytics/sales?${queryString}`);
  }

  getProductAnalytics() {
    return this.request('/admin/analytics/products');
  }

  getUserAnalytics() {
    return this.request('/admin/analytics/users');
  }

  getSettings() {
    return this.request('/admin/settings');
  }

  updateSettings(settings) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // =========================
  // Upload APIs
  // =========================
  uploadImage(file, type = 'products') {
    const formData = new FormData();
    formData.append('image', file);

    return fetch(`${this.baseURL}/upload/${type}`, {
      method: 'POST',
      body: formData
    }).then(res => res.json());
  }

  uploadMultipleImages(files, type = 'products') {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    return fetch(`${this.baseURL}/upload/${type}/multiple`, {
      method: 'POST',
      body: formData
    }).then(res => res.json());
  }

  deleteUploadedFile(type, filename) {
    return this.request(`/upload/${type}/${filename}`, {
      method: 'DELETE'
    });
  }

  getUploadedFiles(type) {
    return this.request(`/upload/${type}`);
  }
}

// ✅ GLOBAL INSTANCE (VERY IMPORTANT)
window.pharmacyAPI = new PharmacyAPI();
