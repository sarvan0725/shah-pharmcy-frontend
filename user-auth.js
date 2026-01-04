// User Authentication System
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function initializeAuth() {
  if (currentUser) {
    updateUserUI();
  }
}

function updateUserUI() {
  // Update user interface elements
  const userElements = document.querySelectorAll('.user-name');
  userElements.forEach(el => {
    if (currentUser) {
      el.textContent = currentUser.name;
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeAuth);

console.log('✅ user-auth.js loaded');