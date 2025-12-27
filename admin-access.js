// Admin access via keyboard shortcut (Ctrl + Shift + A)
document.addEventListener('keydown', function (event) {
  if (
    event.ctrlKey &&
    event.shiftKey &&
    event.key.toLowerCase() === 'a'
  ) {
    event.preventDefault();
    adminAccess();
  }
});

function adminAccess() {
  const password = prompt('Enter admin password:');
  if (!password) return;

  // passwords (temporary – frontend only)
  if (password === 'admin123' || password === 'shah2024') {
    window.location.href = '/dashboard.html';
  } else {
    alert('❌ Invalid password');
  }
}
