// Security utilities for Shah Pharmacy website

// Utility function to sanitize HTML content
function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Secure modal creation and management
function createSecureModal(content, options = {}) {
  const modal = document.createElement('div');
  modal.className = 'secure-modal';
  modal.innerHTML = `
    <div class="modal-overlay" data-action="close">
      <div class="modal-content" onclick="event.stopPropagation()">
        ${content}
      </div>
    </div>
  `;
  
  // Add secure event handling
  modal.addEventListener('click', function(e) {
    if (e.target.dataset.action === 'close' || e.target.classList.contains('modal-overlay')) {
      modal.remove();
    }
    
    // Handle button actions
    const button = e.target.closest('[data-action]');
    if (button && options.handlers && options.handlers[button.dataset.action]) {
      options.handlers[button.dataset.action](e, modal);
    }
  });
  
  return modal;
}

// Replace alert with secure notification
function showSecureNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `secure-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${sanitizeHTML(message)}</span>
      <button onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
    color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// CSRF token generation (simple client-side approach)
function generateCSRFToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Validate form inputs
function validateInput(input, type) {
  const value = input.trim();
  
  switch(type) {
    case 'name':
      return /^[a-zA-Z\s]{2,50}$/.test(value);
    case 'phone':
      return /^[6-9]\d{9}$/.test(value);
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    default:
      return value.length > 0;
  }
}