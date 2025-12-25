// API Configuration
// Update this URL after backend deployment on Render
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://shah-pharmacy-backend.onrender.com/api';

class PharmacyAPI {
  constructor() {
    this.baseURL = API_BASE;
  }

  // Helper method for API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication APIs
  async sendOTP(phone) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  async verifyOTP(phone, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
  }

  async getUserProfile(userId) {
    return this.request(`/auth/profile/${userId}`);
  }

  async updateUserProfile(userId, profileData) {
    return this.request(`/auth/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Product APIs
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  async getCategories() {
    return this.request('/products/categories');
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async addProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  async bulkImportProducts(products) {
    return this.request('/products/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ products })
    });
  }

  // Order APIs
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getUserOrders(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders/user/${userId}?${queryString}`);
  }

  async getOrderDetails(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async deleteOrder(orderId, userId = null) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/orders/${orderId}${params}`, {
      method: 'DELETE'
    });
  }

  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders?${queryString}`);
  }

  // Admin APIs
  async getDashboardAnalytics() {
    return this.request('/admin/dashboard');
  }

  async getSalesAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/analytics/sales?${queryString}`);
  }

  async getProductAnalytics() {
    return this.request('/admin/analytics/products');
  }

  async getUserAnalytics() {
    return this.request('/admin/analytics/users');
  }

  async getSettings() {
    return this.request('/admin/settings');
  }

  async updateSettings(settings) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async exportData(type, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/admin/export/${type}?${queryString}`);
    return response.blob();
  }

  // Upload APIs
  async uploadImage(file, type = 'products') {
    const formData = new FormData();
    formData.append('image', file);

    return fetch(`${this.baseURL}/upload/${type}`, {
      method: 'POST',
      body: formData
    }).then(res => res.json());
  }

  async uploadMultipleImages(files, type = 'products') {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    return fetch(`${this.baseURL}/upload/${type}/multiple`, {
      method: 'POST',
      body: formData
    }).then(res => res.json());
  }

  async deleteUploadedFile(type, filename) {
    return this.request(`/upload/${type}/${filename}`, {
      method: 'DELETE'
    });
  }

  async getUploadedFiles(type) {
    return this.request(`/upload/${type}`);
  }
}

// Create global API instance
window.pharmacyAPI = new PharmacyAPI();