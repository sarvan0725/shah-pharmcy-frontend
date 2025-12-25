// Fixed overflow menu toggle with proper class handling
function toggleOverflowMenu() {
  const overlay = document.getElementById('overflowMenuOverlay');
  const panel = document.getElementById('overflowMenuPanel');
  
  if (!overlay || !panel) return;
  
  if (panel.classList.contains('show')) {
    closeOverflowMenu();
  } else {
    openOverflowMenu();
  }
}

function openOverflowMenu() {
  const overlay = document.getElementById('overflowMenuOverlay');
  const panel = document.getElementById('overflowMenuPanel');
  
  if (overlay && panel) {
    overlay.classList.add('show');
    panel.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeOverflowMenu() {
  const overlay = document.getElementById('overflowMenuOverlay');
  const panel = document.getElementById('overflowMenuPanel');
  
  if (overlay && panel) {
    overlay.classList.remove('show');
    panel.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

// Close on escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeOverflowMenu();
  }
});

// Ensure menu is properly initialized
document.addEventListener('DOMContentLoaded', function() {
  const trigger = document.querySelector('.overflow-menu-trigger');
  if (trigger) {
    trigger.style.display = 'flex';
  }
});