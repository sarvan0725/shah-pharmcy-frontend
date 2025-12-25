// Admin access via keyboard shortcut (Shift + Ctrl + A)
document.addEventListener('keydown', function(event) {
  // Check for Shift + Ctrl + A
  if (event.shiftKey && event.ctrlKey && event.key === 'A') {
    event.preventDefault();
    adminAccess();
  }
});

function adminAccess() {
  const password = prompt('Enter admin password:');
  if (password) {
    // You can customize this password check
    if (password === 'admin123' || password === 'shah2024') {
      window.location.href = '/admin';
    } else {
      alert('Invalid password!');
    }
  }
}