/*************************************************
 ZOMATO-STYLE SIDE MENU - JavaScript
 Modern slide-out menu with smooth animations
*************************************************/

// Zomato-style menu control
function toggleOverflowMenu() {
  if (window.innerWidth >= 1025) return; // Desktop block
  
  const panel = document.getElementById('overflowMenuPanel');
  const overlay = document.getElementById('overflowMenuOverlay');
  
  if (panel.classList.contains('show')) {
    // Close with Zomato-style animation
    panel.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  } else {
    // Open with smooth slide
    panel.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Update user info
    updateOverflowMenuUserInfo();
    updateOverflowMenuCounts();
  }
}

function closeOverflowMenu() {
  const panel = document.getElementById('overflowMenuPanel');
  const overlay = document.getElementById('overflowMenuOverlay');
  
  panel.classList.remove('show');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
  // Hide on desktop
  if (window.innerWidth >= 1025) {
    const trigger = document.querySelector('.overflow-menu-trigger');
    if (trigger) trigger.style.display = 'none';
  }
});

// Handle resize
window.addEventListener('resize', function() {
  if (window.innerWidth >= 1025) {
    closeOverflowMenu();
    const trigger = document.querySelector('.overflow-menu-trigger');
    if (trigger) trigger.style.display = 'none';
  } else {
    const trigger = document.querySelector('.overflow-menu-trigger');
    if (trigger) trigger.style.display = 'flex';
  }
});