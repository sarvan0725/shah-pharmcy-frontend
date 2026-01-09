console.log("admin.js loaded");

const API_BASE = "https://shah-pharmacy-backend.onrender.com/api";

// Load products from main app
let products = JSON.parse(localStorage.getItem("products")) || [
  { id: 1, name: "Rice", price: 60, stock: 50, category: "grocery", image: "", weight: "1kg" },
  { id: 2, name: "Sugar", price: 45, stock: 40, category: "grocery", image: "", weight: "1kg" },
  { id: 3, name: "Wheat Flour", price: 55, stock: 35, category: "grocery", image: "", weight: "1kg" },
  { id: 4, name: "Paracetamol", price: 25, stock: 100, category: "medicine", image: "", weight: "10 tablets" },
  { id: 5, name: "Crocin", price: 30, stock: 80, category: "medicine", image: "", weight: "15 tablets" },
  { id: 6, name: "Rice", price: 1350, stock: 10, category: "bulk", image: "", weight: "25kg" },
  { id: 7, name: "Sugar", price: 1120, stock: 8, category: "bulk", image: "", weight: "25kg" },
  { id: 8, name: "Refgine Oil", price: 850, stock: 15, category: "bulk", image: "", weight: "5L" }
];

// Orders data
let orders = JSON.parse(localStorage.getItem("orders")) || [];

// Alert settings
const ALERT_PHONE = "7905190933";
const LOW_STOCK_THRESHOLD = 30;
let alertedProducts = JSON.parse(localStorage.getItem("alertedProducts")) || [];

// Charts
let categoryChart;
let salesChart;

/* ===============================
   SHOP CHAT MANAGEMENT FOR ADMIN
================================*/
function loadChatMessages() {
  const messages = JSON.parse(localStorage.getItem('shopChatMessages')) || [];
  const messagesList = document.getElementById('chatMessagesList');
  if (!messagesList) return;
  
  if (messages.length === 0) {
    messagesList.innerHTML = '<p class="no-messages">No customer messages yet</p>';
    return;
  }
  
  // Update stats
  const totalMessages = messages.length;
  const unreadMessages = messages.filter(m => !m.adminRead).length;
  const activeChats = new Set(messages.map(m => m.userId)).size;
  
  setText('totalChatMessages', totalMessages);
  setText('unreadMessages', unreadMessages);
  setText('activeChats', activeChats);
  
  // Group messages by user
  const groupedMessages = {};
  messages.forEach(msg => {
    if (!groupedMessages[msg.userId]) {
      groupedMessages[msg.userId] = [];
    }
    groupedMessages[msg.userId].push(msg);
  });
  
  messagesList.innerHTML = Object.entries(groupedMessages).map(([userId, userMessages]) => {
    const latestMessage = userMessages[userMessages.length - 1];
    const unreadCount = userMessages.filter(m => !m.adminRead).length;
    
    return `
      <div class="chat-conversation ${unreadCount > 0 ? 'unread' : ''}" onclick="openChatConversation('${userId}')">
        <div class="chat-header">
          <div class="user-info">
            <i class="fas fa-user-circle"></i>
            <span class="user-name">${latestMessage.userName || 'Customer'}</span>
            ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
          </div>
          <div class="chat-time">${new Date(latestMessage.timestamp).toLocaleString()}</div>
        </div>
        <div class="latest-message">
          <p>${latestMessage.message}</p>
        </div>
      </div>
    `;
  }).join('');
}

function filterChatMessages(filter) {
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  const messages = JSON.parse(localStorage.getItem('shopChatMessages')) || [];
  let filteredMessages = messages;
  
  if (filter === 'unread') {
    filteredMessages = messages.filter(m => !m.adminRead);
  } else if (filter === 'today') {
    const today = new Date().toDateString();
    filteredMessages = messages.filter(m => new Date(m.timestamp).toDateString() === today);
  }
  
  // Update display with filtered messages
  displayFilteredMessages(filteredMessages);
}

function displayFilteredMessages(messages) {
  const messagesList = document.getElementById('chatMessagesList');
  if (!messagesList) return;
  
  if (messages.length === 0) {
    messagesList.innerHTML = '<p class="no-messages">No messages found for this filter</p>';
    return;
  }
  
  // Group and display filtered messages
  const groupedMessages = {};
  messages.forEach(msg => {
    if (!groupedMessages[msg.userId]) {
      groupedMessages[msg.userId] = [];
    }
    groupedMessages[msg.userId].push(msg);
  });
  
  messagesList.innerHTML = Object.entries(groupedMessages).map(([userId, userMessages]) => {
    const latestMessage = userMessages[userMessages.length - 1];
    const unreadCount = userMessages.filter(m => !m.adminRead).length;
    
    return `
      <div class="chat-conversation ${unreadCount > 0 ? 'unread' : ''}" onclick="openChatConversation('${userId}')">
        <div class="chat-header">
          <div class="user-info">
            <i class="fas fa-user-circle"></i>
            <span class="user-name">${latestMessage.userName || 'Customer'}</span>
            ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
          </div>
          <div class="chat-time">${new Date(latestMessage.timestamp).toLocaleString()}</div>
        </div>
        <div class="latest-message">
          <p>${latestMessage.message}</p>
        </div>
      </div>
    `;
  }).join('');
}

function openChatConversation(userId) {
  const messages = JSON.parse(localStorage.getItem('shopChatMessages')) || [];
  const userMessages = messages.filter(m => m.userId === userId);
  
  // Mark messages as read by admin
  messages.forEach(msg => {
    if (msg.userId === userId) {
      msg.adminRead = true;
    }
  });
  localStorage.setItem('shopChatMessages', JSON.stringify(messages));
  
  // Create chat modal
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;width:90%;max-width:600px;height:80%;border-radius:15px;display:flex;flex-direction:column;" onclick="event.stopPropagation()">
        <div style="padding:20px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
          <h3><i class="fas fa-comments"></i> Chat with ${userMessages[0]?.userName || 'Customer'}</h3>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
        </div>
        <div style="flex:1;padding:20px;overflow-y:auto;" id="chatConversationMessages">
          ${userMessages.map(msg => `
            <div style="margin:10px 0;padding:10px;border-radius:10px;${msg.isAdmin ? 'background:#e3f2fd;margin-left:20%;' : 'background:#f5f5f5;margin-right:20%;'}">
              <div style="font-weight:bold;color:${msg.isAdmin ? '#1976d2' : '#333'};">${msg.isAdmin ? 'Admin' : msg.userName || 'Customer'}</div>
              <div>${msg.message}</div>
              <div style="font-size:12px;color:#666;margin-top:5px;">${new Date(msg.timestamp).toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
        <div style="padding:20px;border-top:1px solid #eee;">
          <div style="display:flex;gap:10px;">
            <input type="text" id="adminReplyInput" placeholder="Type your reply..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:5px;" onkeypress="if(event.key==='Enter') sendAdminReply('${userId}')">
            <button onclick="sendAdminReply('${userId}')" style="background:#DC2626;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Scroll to bottom
  const messagesContainer = document.getElementById('chatConversationMessages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Refresh the main chat list
  loadChatMessages();
}

function sendAdminReply(userId) {
  const input = document.getElementById('adminReplyInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  const adminMessage = {
    id: Date.now(),
    userId: userId,
    userName: 'Admin',
    message: message,
    timestamp: new Date().toISOString(),
    isAdmin: true,
    adminRead: true
  };
  
  let messages = JSON.parse(localStorage.getItem('shopChatMessages')) || [];
  messages.push(adminMessage);
  localStorage.setItem('shopChatMessages', JSON.stringify(messages));
  
  // Clear input
  input.value = '';
  
  // Refresh conversation
  openChatConversation(userId);
}

function sendQuickResponse(responseText) {
  // This would be used when admin selects a user to send quick response
  alert('Select a customer conversation first, then use this quick response: ' + responseText);
}

// Auto-refresh chat messages every 30 seconds when on chat section
setInterval(() => {
  const currentSection = document.querySelector('.section:not(.hidden)');
  if (currentSection && currentSection.id === 'chat-messages') {
    loadChatMessages();
  }
}, 30000);

/* ===============================
   ADMIN LOGIN
================================*/
// Get admin credentials from localStorage or use defaults
function getAdminCredentials() {
  const saved = localStorage.getItem('adminCredentials');
  return saved ? JSON.parse(saved) : { username: 'admin', password: '1234' };
}

function adminLogin() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;
  const credentials = getAdminCredentials();
  
  if (user === credentials.username && pass === credentials.password) {
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid credentials!");
  }
}

/* ===============================
   ADMIN PASSWORD CHANGE
================================*/
function showPasswordChange() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;max-width:400px;width:90%;" onclick="event.stopPropagation()">
        <h3 style="color:#DC2626;margin-bottom:20px;"><i class="fas fa-key"></i> Change Admin Password</h3>
        <div style="margin:15px 0;">
          <input type="password" id="currentPassword" placeholder="Current Password" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;margin:5px 0;">
          <input type="password" id="newPassword" placeholder="New Password" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;margin:5px 0;">
          <input type="password" id="confirmPassword" placeholder="Confirm New Password" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;margin:5px 0;">
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
          <button onclick="changeAdminPassword()" style="background:#DC2626;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Change Password</button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:#ccc;color:black;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Cancel</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function changeAdminPassword() {
  const currentPass = document.getElementById('currentPassword').value;
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;
  const credentials = getAdminCredentials();
  
  if (!currentPass || !newPass || !confirmPass) {
    alert('Please fill all fields');
    return;
  }
  
  if (currentPass !== credentials.password) {
    alert('Current password is incorrect');
    return;
  }
  
  if (newPass.length < 4) {
    alert('New password must be at least 4 characters');
    return;
  }
  
  if (newPass !== confirmPass) {
    alert('New passwords do not match');
    return;
  }
  
  // Save new credentials
  const newCredentials = {
    username: credentials.username,
    password: newPass
  };
  
  localStorage.setItem('adminCredentials', JSON.stringify(newCredentials));
  
  // Close modal
  document.querySelector('[style*="position:fixed"]').remove();
  
  alert('Password changed successfully! Please login again with new password.');
  
  // Redirect to login
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

function changeAdminUsername() {
  const credentials = getAdminCredentials();
  const newUsername = prompt('Enter new username:', credentials.username);
  
  if (newUsername && newUsername.trim() && newUsername !== credentials.username) {
    const newCredentials = {
      username: newUsername.trim(),
      password: credentials.password
    };
    
    localStorage.setItem('adminCredentials', JSON.stringify(newCredentials));
    alert('Username changed successfully! Please login again.');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

/* ===============================
   LOAD DASHBOARD
================================*/
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("dashboard.html")) {
    loadProducts();
    loadAnalytics();
    loadOrders();
    checkLowStock();
  }
});

/* ===============================
   PRODUCT MANAGEMENT
================================*/
function loadSubcategoryOptions() {
  const categorySelect = document.getElementById('pCategory');
  const subcategorySelect = document.getElementById('pSubcategory');
  const selectedCategory = categorySelect.value;
  
  // Map category names to IDs
  const categoryMap = {
    'medicine': 1,
    'grocery': 2, 
    'personal': 3,
    'bulk': 4
  };
  
  const categoryId = categoryMap[selectedCategory];
  const categories = JSON.parse(localStorage.getItem('categories')) || [];
  const category = categories.find(c => c.id === categoryId);
  
  subcategorySelect.innerHTML = '<option value="">Select Subcategory (Optional)</option>';
  
  if (category && category.subcategories && category.subcategories.length > 0) {
    category.subcategories.forEach(sub => {
      const subName = typeof sub === 'string' ? sub : sub.name || sub;
      subcategorySelect.innerHTML += `<option value="${subName}">${subName}</option>`;
    });
    subcategorySelect.style.display = 'block';
  } else {
    subcategorySelect.style.display = 'none';
  }
}

let currentProductImage = '';

// Product image upload function
function uploadProductImage() {
  const fileInput = document.getElementById('productImageUpload');
  const file = fileInput.files[0];
  
  if (!file) return;
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    currentProductImage = e.target.result;
    
    // Show preview
    const preview = document.getElementById('productImagePreview');
    preview.innerHTML = `
      <div class="image-preview-container">
        <img src="${currentProductImage}" alt="Product Preview" style="max-width: 150px; max-height: 150px; border-radius: 8px; border: 1px solid #ddd;">
        <button onclick="removeProductImage()" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;">Remove Image</button>
      </div>
    `;
  };
  
  reader.readAsDataURL(file);
}

// Remove product image
function removeProductImage() {
  currentProductImage = '';
  document.getElementById('productImagePreview').innerHTML = '';
  document.getElementById('productImageUpload').value = '';
}

// Shop image upload function
function uploadShopImage() {
  const fileInput = document.getElementById('shopImageUpload');
  const file = fileInput.files[0];
  
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    alert('Image size should be less than 10MB');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const imageData = e.target.result;
    
    // Show preview
    const preview = document.getElementById('currentShopImage');
    preview.innerHTML = `
      <img src="${imageData}" alt="Shop Banner" style="max-width: 300px; max-height: 200px; border-radius: 8px; border: 1px solid #ddd;">
    `;
    
    // Show set banner button
    document.getElementById('setBannerBtn').style.display = 'block';
    
    // Store temporarily
    localStorage.setItem('tempShopImage', imageData);
  };
  
  reader.readAsDataURL(file);
}

// Set shop banner
function setAsMainBanner() {
  const tempImage = localStorage.getItem('tempShopImage');
  if (tempImage) {
    localStorage.setItem('shopBannerImage', tempImage);
    localStorage.removeItem('tempShopImage');
    alert('Shop banner updated successfully!');
    document.getElementById('setBannerBtn').style.display = 'none';
  }
}

async function addProduct() {
  try {
    const name = document.getElementById("pName").value.trim();
    const weight = document.getElementById("pWeight").value.trim();
    const price = Number(document.getElementById("pPrice").value);
    const stock = Number(document.getElementById("pStock").value);
    const category = document.getElementById("pCategory").value;

    if (!name || !weight || !price || !stock || !category) {
      alert("Please fill all required fields");
      return;
    }

    // ✅ SINGLE & FINAL PRODUCT OBJECT (API ONLY)
    const product = {
      name: name,
      weight: weight,
      price: price,
      stock: stock,
      category: category,
      image: ""   // image intentionally empty
    };

    const res = await fetch(
      "https://shah-pharmacy-backend.onrender.com/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Backend response:", text);
      throw new Error("API failed");
    }

    alert("✅ Product added successfully");

    // clear form
    document.getElementById("pName").value = "";
    document.getElementById("pWeight").value = "";
    document.getElementById("pPrice").value = "";
    document.getElementById("pStock").value = "";

    // reload products
    if (typeof loadProducts === "function") {
      loadProducts();
    }

  } catch (err) {
    console.error(err);
    alert("❌ Product add failed");
  }
}












function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    products = products.filter(p => p.id !== id);
    localStorage.setItem("products", JSON.stringify(products));
    loadProducts();
    loadAnalytics();
    checkLowStock();
  }
}

function loadProducts(searchQuery = '') {
  const table = document.getElementById("productTable");
  if (!table) return;
  
  table.innerHTML = "";
  
  let displayProducts = products;
  if (searchQuery) {
    displayProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  displayProducts.forEach(p => {
    const subcategoryText = p.subcategory ? ` (${p.subcategory})` : '';
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.weight || 'N/A'}</td>
        <td>₹${p.price}</td>
        <td>${p.stock}</td>
        <td>${p.category}${subcategoryText}</td>
        <td>${p.image ? '✅' : '❌'}</td>
        <td>
          <button class="delete" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* ===============================
   ANALYTICS & CHARTS
================================*/
function loadAnalytics() {
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const grocery = products.filter(p => p.category === "grocery").length;
  const medicine = products.filter(p => p.category === "medicine").length;
  const bulk = products.filter(p => p.category === "bulk").length;

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setText("totalProducts", totalProducts);
  setText("outOfStock", outOfStock);
  setText("groceryCount", grocery);
  setText("medicineCount", medicine);
  setText("bulkCount", bulk);

  // Sales calculation
  let today = 0, week = 0, month = 0;
  let deliveryRevenue = 0;
  const now = new Date();

  orders.forEach(o => {
    const d = new Date(o.date);
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (o.deliveryCharge) deliveryRevenue += o.deliveryCharge;

    if (d.toDateString() === now.toDateString()) today += o.total;
    if (diff <= 7) week += o.total;
    if (diff <= 30) month += o.total;
  });
  
  // Add delivery revenue card
  const deliveryCard = document.getElementById('deliveryRevenue');
  if (deliveryCard) deliveryCard.innerText = '₹' + deliveryRevenue;

  setText("todaySales", "₹" + today);
  setText("weekSales", "₹" + week);
  setText("monthSales", "₹" + month);
  setText("totalOrders", orders.length);

  // Update charts
  updateCharts(grocery, medicine, bulk, today, week, month);
}

function updateCharts(grocery, medicine, bulk, today, week, month) {
  // Category pie chart
  const catCtx = document.getElementById("categoryChart");
  if (catCtx) {
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(catCtx, {
      type: "pie",
      data: {
        labels: ["Grocery", "Medicine", "Bulk"],
        datasets: [{
          data: [grocery, medicine, bulk],
          backgroundColor: ["#00B761", "#16a34a", "#f97316"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Products by Category'
          }
        }
      }
    });
  }

  // Sales bar chart
  const salesCtx = document.getElementById("salesChart");
  if (salesCtx) {
    if (salesChart) salesChart.destroy();
    salesChart = new Chart(salesCtx, {
      type: "bar",
      data: {
        labels: ["Today", "7 Days", "30 Days"],
        datasets: [{
          label: "Sales ₹",
          data: [today, week, month],
          backgroundColor: "#00B761"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Sales Overview'
          }
        }
      }
    });
  }
}

/* ===============================
   ORDERS MANAGEMENT
================================*/
function loadOrders() {
  const orderList = document.getElementById("orderList");
  if (!orderList) return;
  
  if (orders.length === 0) {
    orderList.innerHTML = "<p>No orders yet.</p>";
    return;
  }
  
  orderList.innerHTML = "";
  orders.forEach((order, index) => {
    const hasDeliveryInfo = order.distance !== undefined;
    orderList.innerHTML += `
      <div class="box">
        <h4>Order #${index + 1}</h4>
        <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
        ${hasDeliveryInfo ? `
          <p><strong>Subtotal:</strong> ₹${order.subtotal || order.total}</p>
          <p><strong>Delivery:</strong> ${order.deliveryCharge === 0 ? 'FREE' : '₹' + order.deliveryCharge}</p>
          <p><strong>Distance:</strong> ${order.distance} km</p>
          <p><strong>Address:</strong> ${order.deliveryAddress}</p>
        ` : ''}
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p><strong>Items:</strong> ${order.items.length}</p>
        <details>
          <summary>View Items</summary>
          ${order.items.map(item => `
            <p>• ${item.name} × ${item.qty} = ₹${item.price * item.qty}</p>
          `).join('')}
        </details>
      </div>
    `;
  });
}

/* ===============================
   THEME SETTINGS
================================*/
function saveTheme() {
  const primaryColor = document.getElementById("primaryColor").value;
  const bgColor = document.getElementById("bgColor").value;
  
  localStorage.setItem("adminTheme", JSON.stringify({
    primary: primaryColor,
    background: bgColor
  }));
  
  alert("Theme saved! Refresh to see changes.");
}

/* ===============================
   SECTION NAVIGATION
================================*/
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec =>
    sec.classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");
  
  // Load data when switching sections
  if (id === 'analytics') loadAnalytics();
  if (id === 'products') loadProducts();
  if (id === 'categories') loadCategoryManagement();
  if (id === 'orders') loadOrders();
  if (id === 'ai-insights') loadAIInsights();
  if (id === 'customers') loadCustomerInsights();
  if (id === 'discounts') loadActiveOffers();
  if (id === 'notifications') loadSentNotifications();
  if (id === 'chat-messages') loadChatMessages();
  if (id === 'delivery-settings') loadDeliverySettings();
  if (id === 'admin-settings') loadAdminSettings();
}

/* ===============================
   SIMULATE ORDER (FOR TESTING)
================================*/
/* ===============================
   LOW STOCK ALERT SYSTEM
================================*/
function checkLowStock() {
  const lowStockProducts = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD);
  
  lowStockProducts.forEach(product => {
    if (!alertedProducts.includes(product.id)) {
      sendLowStockAlert(product);
      alertedProducts.push(product.id);
    }
  });
  
  // Remove products from alerted list if stock is replenished
  alertedProducts = alertedProducts.filter(id => {
    const product = products.find(p => p.id === id);
    return product && product.stock <= LOW_STOCK_THRESHOLD;
  });
  
  localStorage.setItem("alertedProducts", JSON.stringify(alertedProducts));
  
  // Update low stock display
  displayLowStockAlerts(lowStockProducts);
}

function sendLowStockAlert(product) {
  const message = `🚨 LOW STOCK ALERT\n\nProduct: ${product.name}\nCurrent Stock: ${product.stock}\nCategory: ${product.category}\nPrice: ₹${product.price}\n\nPlease restock immediately!\n\n- Shah Pharmacy Alert System`;
  
  // WhatsApp API call (you'll need to integrate with a WhatsApp Business API)
  const whatsappUrl = `https://wa.me/${ALERT_PHONE}?text=${encodeURIComponent(message)}`;
  
  // For now, we'll show browser notification and log
  console.log(`LOW STOCK ALERT: ${product.name} - Stock: ${product.stock}`);
  
  // Browser notification
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("Low Stock Alert!", {
        body: `${product.name} is running low (${product.stock} left)`,
        icon: "https://cdn-icons-png.flaticon.com/512/564/564619.png"
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Low Stock Alert!", {
            body: `${product.name} is running low (${product.stock} left)`,
            icon: "https://cdn-icons-png.flaticon.com/512/564/564619.png"
          });
        }
      });
    }
  }
  
  // Store alert for admin dashboard
  let alerts = JSON.parse(localStorage.getItem("stockAlerts")) || [];
  alerts.unshift({
    id: Date.now(),
    product: product.name,
    stock: product.stock,
    category: product.category,
    date: new Date().toISOString(),
    whatsappUrl: whatsappUrl
  });
  
  // Keep only last 50 alerts
  if (alerts.length > 50) alerts = alerts.slice(0, 50);
  
  localStorage.setItem("stockAlerts", JSON.stringify(alerts));
}

function displayLowStockAlerts(lowStockProducts) {
  const alertContainer = document.getElementById("lowStockAlerts");
  if (!alertContainer) return;
  
  if (lowStockProducts.length === 0) {
    alertContainer.innerHTML = "<p style='color: green;'>✅ All products are well stocked!</p>";
    return;
  }
  
  alertContainer.innerHTML = `
    <div style="background: #ffebee; border: 1px solid #f44336; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h4 style="color: #d32f2f; margin-bottom: 10px;">🚨 Low Stock Alerts (${lowStockProducts.length})</h4>
      ${lowStockProducts.map(p => `
        <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 5px; display: flex; justify-content: space-between; align-items: center;">
          <span><strong>${p.name}</strong> - Stock: ${p.stock}</span>
          <button onclick="sendWhatsAppAlert('${p.name}', ${p.stock})" style="background: #25D366; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
            📱 Send WhatsApp
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

function sendWhatsAppAlert(productName, stock) {
  const message = `🚨 LOW STOCK ALERT\n\nProduct: ${productName}\nCurrent Stock: ${stock}\n\nPlease restock immediately!\n\n- Shah Pharmacy Alert System`;
  const whatsappUrl = `https://wa.me/${ALERT_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

/* ===============================
   AI BUSINESS INTELLIGENCE
================================*/
let demandChart;

function loadAIInsights() {
  const salesTrend = calculateSalesTrend();
  const prediction = salesTrend > 0 ? `⬆️ ${Math.abs(salesTrend)}% increase expected` : `⬇️ ${Math.abs(salesTrend)}% decrease expected`;
  setText('salesPrediction', prediction);
  
  const bestProduct = findBestSellingProduct();
  setText('bestSelling', bestProduct);
  
  const reorderCount = products.filter(p => p.stock <= 30).length;
  setText('reorderAlert', `${reorderCount} products need reorder`);
  
  const avgMargin = calculateAverageMargin();
  setText('profitMargin', `${avgMargin}% avg margin`);
  
  generateAIRecommendations();
  createDemandForecastChart();
}

function calculateSalesTrend() {
  if (orders.length < 2) return 0;
  const recent = orders.slice(-7).reduce((sum, o) => sum + o.total, 0);
  const previous = orders.slice(-14, -7).reduce((sum, o) => sum + o.total, 0);
  return previous > 0 ? Math.round(((recent - previous) / previous) * 100) : 0;
}

function findBestSellingProduct() {
  const productSales = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      productSales[item.name] = (productSales[item.name] || 0) + item.qty;
    });
  });
  const best = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];
  return best ? `${best[0]} (${best[1]} sold)` : 'No sales data';
}

function calculateAverageMargin() {
  const margins = products.map(p => {
    const cost = p.price * 0.7;
    return ((p.price - cost) / p.price) * 100;
  });
  return margins.length > 0 ? Math.round(margins.reduce((a, b) => a + b) / margins.length) : 0;
}

function generateAIRecommendations() {
  const recommendations = [];
  const lowStock = products.filter(p => p.stock <= 30);
  if (lowStock.length > 0) {
    recommendations.push(`🚨 Restock ${lowStock.length} products urgently`);
  }
  recommendations.push(`📈 Most sales happen on weekends - plan inventory accordingly`);
  recommendations.push(`🕰️ Peak hours: 6-8 PM - ensure adequate staff`);
  
  const container = document.getElementById('aiRecommendations');
  if (container) {
    container.innerHTML = recommendations.map(rec => 
      `<div class="recommendation-item">${rec}</div>`
    ).join('');
  }
}

function createDemandForecastChart() {
  const ctx = document.getElementById('demandChart');
  if (!ctx) return;
  if (demandChart) demandChart.destroy();
  
  demandChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Predicted'],
      datasets: [{
        label: 'Actual Sales',
        data: [85, 92, 78, 95, 0],
        borderColor: '#00B761',
        backgroundColor: 'rgba(0, 183, 97, 0.1)'
      }, {
        label: 'AI Prediction',
        data: [0, 0, 0, 0, 88],
        borderColor: '#ff9800',
        borderDash: [5, 5]
      }]
    },
    options: { responsive: true }
  });
}

function loadCustomerInsights() {
  const behaviors = JSON.parse(localStorage.getItem('customerBehaviors')) || [];
  const uniqueCustomers = orders.length;
  setText('totalCustomers', uniqueCustomers);
  setText('repeatCustomers', Math.floor(uniqueCustomers * 0.3));
  const avgOrder = orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length) : 0;
  setText('avgOrderValue', `₹${avgOrder}`);
}

function generateWhatsAppCampaign() {
  const campaigns = [
    "🎉 Special Offer! Get 20% off on all medicines this weekend!",
    "💊 Health Alert! Monsoon season - Stock up on immunity boosters!",
    "🛒 Grocery Sale! Buy 2 Get 1 Free on selected items!"
  ];
  const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)];
  const output = document.getElementById('marketingOutput');
  if (output) {
    output.innerHTML = `<div class="campaign-output"><h4>Generated Campaign:</h4><div>${randomCampaign}</div></div>`;
  }
}

function generateSmartOffers() {
  const offers = [
    { product: 'Paracetamol', discount: '15%' },
    { product: 'Rice', discount: '10%' },
    { product: 'Vitamins', discount: '25%' }
  ];
  const output = document.getElementById('marketingOutput');
  if (output) {
    output.innerHTML = `<div><h4>Smart Offers:</h4>${offers.map(o => `<div>${o.product} - ${o.discount} off</div>`).join('')}</div>`;
  }
}

function generateSocialContent() {
  const posts = [
    "🌿 Your health is our priority! Visit Shah Pharmacy #HealthFirst",
    "🚚 Fast delivery in 10-15 minutes! #QuickDelivery",
    "👨‍⚕️ Expert pharmacists available for consultation #ExpertCare"
  ];
  const randomPost = posts[Math.floor(Math.random() * posts.length)];
  const output = document.getElementById('marketingOutput');
  if (output) {
    output.innerHTML = `<div><h4>Social Media Post:</h4><div>${randomPost}</div></div>`;
  }
}

/* ===============================
   DELIVERY SETTINGS MANAGEMENT
================================*/
function loadDeliverySettings() {
  const settings = JSON.parse(localStorage.getItem('deliverySettings')) || {
    freeRadius: 8,
    chargePerKm: 10,
    maxDistance: 25
  };
  
  document.getElementById('freeDeliveryRadius').value = settings.freeRadius;
  document.getElementById('deliveryChargePerKm').value = settings.chargePerKm;
  document.getElementById('maxDeliveryDistance').value = settings.maxDistance;
  
  updateDeliveryPreview();
}

function saveDeliverySettings() {
  const freeRadius = parseInt(document.getElementById('freeDeliveryRadius').value);
  const chargePerKm = parseInt(document.getElementById('deliveryChargePerKm').value);
  const maxDistance = parseInt(document.getElementById('maxDeliveryDistance').value);
  
  if (freeRadius < 1 || chargePerKm < 1 || maxDistance < 5) {
    alert('Please enter valid values!');
    return;
  }
  
  if (freeRadius >= maxDistance) {
    alert('Free delivery radius must be less than maximum delivery distance!');
    return;
  }
  
  const settings = {
    freeRadius: freeRadius,
    chargePerKm: chargePerKm,
    maxDistance: maxDistance
  };
  
  localStorage.setItem('deliverySettings', JSON.stringify(settings));
  updateDeliveryPreview();
  
  alert('Delivery settings saved successfully! Changes will apply to new orders.');
}

function updateDeliveryPreview() {
  const freeRadius = document.getElementById('freeDeliveryRadius').value;
  const chargePerKm = document.getElementById('deliveryChargePerKm').value;
  const maxDistance = document.getElementById('maxDeliveryDistance').value;
  
  document.getElementById('previewFreeRadius').textContent = freeRadius;
  document.getElementById('previewFreeRadius2').textContent = freeRadius;
  document.getElementById('previewChargePerKm').textContent = chargePerKm;
  document.getElementById('previewMaxDistance').textContent = maxDistance;
}

// Add event listeners for real-time preview
document.addEventListener('DOMContentLoaded', () => {
  const inputs = ['freeDeliveryRadius', 'deliveryChargePerKm', 'maxDeliveryDistance'];
  inputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', updateDeliveryPreview);
    }
  });
});

function addTestOrder() {
  const testOrder = {
    date: new Date().toISOString(),
    total: Math.floor(Math.random() * 1000) + 100,
    items: [
      { name: "Rice", qty: 2, price: 60 },
      { name: "Sugar", qty: 1, price: 45 }
    ]
  };
  
  orders.push(testOrder);
  localStorage.setItem("orders", JSON.stringify(orders));
  loadAnalytics();
  loadOrders();
}

/* ===============================
   DISCOUNT MANAGEMENT
================================*/
function createDiscount() {
  const title = document.getElementById('discountTitle').value;
  const type = document.getElementById('discountType').value;
  const amount = document.getElementById('discountValue').value;
  const minOrder = document.getElementById('minOrderAmount').value;
  const autoApply = document.getElementById('autoApply').checked;
  const expiry = document.getElementById('discountExpiry').value;
  
  if (!title || !amount) {
    alert('Please fill all required fields');
    return;
  }
  
  const discount = {
    id: Date.now(),
    title: title,
    type: type,
    amount: parseFloat(amount),
    minOrderAmount: parseFloat(minOrder) || 0,
    autoApply: autoApply,
    expiry: expiry,
    message: `${title} - ${type === 'percentage' ? amount + '%' : '₹' + amount} off`,
    active: true
  };
  
  let discounts = JSON.parse(localStorage.getItem('adminDiscounts')) || [];
  discounts.unshift(discount);
  localStorage.setItem('adminDiscounts', JSON.stringify(discounts));
  
  // Clear form
  document.getElementById('discountTitle').value = '';
  document.getElementById('discountValue').value = '';
  document.getElementById('minOrderAmount').value = '';
  document.getElementById('autoApply').checked = false;
  document.getElementById('discountExpiry').value = '';
  
  loadActiveOffers();
  alert('Discount created successfully!');
}

function createQuickDiscount(percentage, minAmount) {
  const discount = {
    id: Date.now(),
    title: `Shopping Discount ${percentage}%`,
    type: 'percentage',
    amount: percentage,
    minOrderAmount: minAmount,
    autoApply: true,
    expiry: '',
    message: `${percentage}% off on orders above ₹${minAmount}`,
    active: true
  };
  
  let discounts = JSON.parse(localStorage.getItem('adminDiscounts')) || [];
  discounts.unshift(discount);
  localStorage.setItem('adminDiscounts', JSON.stringify(discounts));
  
  loadActiveOffers();
  alert(`${percentage}% discount created for orders above ₹${minAmount}!`);
}

function createCustomDiscount() {
  const orderAmount = prompt('Enter order amount for custom discount:');
  const discountPercent = prompt('Enter discount percentage:');
  const reason = prompt('Enter reason for discount:');
  
  if (orderAmount && discountPercent && reason) {
    const discount = {
      id: Date.now(),
      title: `Custom Discount - ${reason}`,
      type: 'percentage',
      amount: parseFloat(discountPercent),
      minOrderAmount: 0,
      autoApply: false,
      expiry: '',
      message: `${discountPercent}% custom discount - ${reason}`,
      active: true,
      isCustom: true
    };
    
    let discounts = JSON.parse(localStorage.getItem('adminDiscounts')) || [];
    discounts.unshift(discount);
    localStorage.setItem('adminDiscounts', JSON.stringify(discounts));
    
    loadActiveOffers();
    alert(`Custom ${discountPercent}% discount created!`);
  }
}

function loadActiveOffers() {
  const offersList = document.getElementById('offersList');
  if (!offersList) return;
  
  const discounts = JSON.parse(localStorage.getItem('adminDiscounts')) || [];
  
  if (discounts.length === 0) {
    offersList.innerHTML = '<p>No active offers</p>';
    return;
  }
  
  offersList.innerHTML = discounts.map(discount => `
    <div class="offer-item">
      <div class="offer-info">
        <h4>${discount.title}</h4>
        <p>${discount.message}</p>
        <small>Min Order: ₹${discount.minOrderAmount} | Auto Apply: ${discount.autoApply ? 'Yes' : 'No'}</small>
      </div>
      <div class="offer-actions">
        <button onclick="toggleDiscount(${discount.id})" class="${discount.active ? 'deactivate' : 'activate'}-btn">
          ${discount.active ? 'Deactivate' : 'Activate'}
        </button>
        <button onclick="deleteDiscount(${discount.id})" class="delete-btn">Delete</button>
      </div>
    </div>
  `).join('');
}

function toggleDiscount(id) {
  let discounts = JSON.parse(localStorage.getItem('adminDiscounts')) || [];
  const discount = discounts.find(d => d.id === id);
  if (discount) {
    discount.active = !discount.active;
    localStorage.setItem('adminDiscounts', JSON.stringify(discounts));
    loadActiveOffers();
  }
}

function deleteDiscount(id) {
  if (confirm('Are you sure you want to delete this discount?')) {
    let discounts = JSON.parse(localStorage.getItem('adminDiscounts')) || [];
    discounts = discounts.filter(d => d.id !== id);
    localStorage.setItem('adminDiscounts', JSON.stringify(discounts));
    loadActiveOffers();
  }
}
/* ===============================
   CATEGORY MANAGEMENT SYSTEM
================================*/
function loadCategoryManagement() {
  const categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: 'Medicine', subcategories: ['Tablets', 'Syrups', 'Capsules', 'Ointments'] },
    { id: 2, name: 'Grocery', subcategories: ['Rice & Grains', 'Oil & Ghee', 'Spices', 'Pulses'] },
    { id: 3, name: 'Personal Care', subcategories: ['Skincare', 'Hair Care', 'Oral Care', 'Baby Care'] },
    { id: 4, name: 'Bulk', subcategories: ['Wholesale Rice', 'Wholesale Oil', 'Wholesale Sugar'] }
  ];
  
  const container = document.getElementById('categoryList');
  if (!container) return;
  
  container.innerHTML = categories.map(cat => `
    <div class="category-item">
      <div class="category-header">
        <h4>${cat.name}</h4>
        <div class="category-actions">
          <button onclick="editCategory(${cat.id})" class="edit-btn">Edit</button>
          <button onclick="deleteCategory(${cat.id})" class="delete-btn">Delete</button>
        </div>
      </div>
      <div class="subcategories">
        <strong>Subcategories:</strong>
        ${cat.subcategories.map(sub => `
          <span class="subcategory-tag">
            ${sub}
            <button onclick="deleteSubcategory(${cat.id}, '${sub}')" class="remove-sub">×</button>
          </span>
        `).join('')}
        <button onclick="addSubcategory(${cat.id})" class="add-sub-btn">+ Add</button>
      </div>
    </div>
  `).join('');
}

function addCategory() {
  const name = document.getElementById('newCategoryName').value.trim();
  if (!name) {
    alert('Please enter category name');
    return;
  }
  
  let categories = JSON.parse(localStorage.getItem('categories')) || [];
  const newId = Math.max(...categories.map(c => c.id), 0) + 1;
  
  categories.push({
    id: newId,
    name: name,
    subcategories: []
  });
  
  localStorage.setItem('categories', JSON.stringify(categories));
  document.getElementById('newCategoryName').value = '';
  loadCategoryManagement();
  alert('Category added successfully!');
}

function deleteCategory(id) {
  if (!confirm('Are you sure? This will affect products in this category.')) return;
  
  let categories = JSON.parse(localStorage.getItem('categories')) || [];
  categories = categories.filter(c => c.id !== id);
  localStorage.setItem('categories', JSON.stringify(categories));
  loadCategoryManagement();
}

function editCategory(id) {
  const categories = JSON.parse(localStorage.getItem('categories')) || [];
  const category = categories.find(c => c.id === id);
  if (!category) return;
  
  const newName = prompt('Enter new category name:', category.name);
  if (newName && newName.trim()) {
    category.name = newName.trim();
    localStorage.setItem('categories', JSON.stringify(categories));
    loadCategoryManagement();
  }
}

function addSubcategory(categoryId) {
  const subName = prompt('Enter subcategory name:');
  if (!subName || !subName.trim()) return;
  
  let categories = JSON.parse(localStorage.getItem('categories')) || [];
  const category = categories.find(c => c.id === categoryId);
  if (category) {
    if (!category.subcategories.includes(subName.trim())) {
      category.subcategories.push(subName.trim());
      localStorage.setItem('categories', JSON.stringify(categories));
      loadCategoryManagement();
    } else {
      alert('Subcategory already exists!');
    }
  }
}

function deleteSubcategory(categoryId, subName) {
  if (!confirm(`Delete subcategory "${subName}"?`)) return;
  
  let categories = JSON.parse(localStorage.getItem('categories')) || [];
  const category = categories.find(c => c.id === categoryId);
  if (category) {
    category.subcategories = category.subcategories.filter(s => s !== subName);
    localStorage.setItem('categories', JSON.stringify(categories));
    loadCategoryManagement();
  }
}

/* ===============================
   ADMIN NOTIFICATIONS SYSTEM
================================*/
function sendNotificationToUsers() {
  const title = document.getElementById('notificationTitle').value;
  const message = document.getElementById('notificationMessage').value;
  const type = document.getElementById('notificationType').value;
  const expiry = document.getElementById('notificationExpiry').value;
  
  if (!title || !message) {
    alert('Please fill title and message');
    return;
  }
  
  const notification = {
    id: Date.now(),
    title: title,
    message: message,
    type: type,
    expiry: expiry,
    timestamp: new Date().toISOString(),
    active: true
  };
  
  // Store notification for users
  let userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
  userNotifications.unshift(notification);
  localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
  
  // Store in admin sent notifications
  let sentNotifications = JSON.parse(localStorage.getItem('sentNotifications')) || [];
  sentNotifications.unshift(notification);
  localStorage.setItem('sentNotifications', JSON.stringify(sentNotifications));
  
  // Clear form
  document.getElementById('notificationTitle').value = '';
  document.getElementById('notificationMessage').value = '';
  document.getElementById('notificationExpiry').value = '';
  
  loadSentNotifications();
  alert('Notification sent to all users!');
}

function sendQuickNotification(message) {
  const notification = {
    id: Date.now(),
    title: 'Shah Pharmacy Update',
    message: message,
    type: 'info',
    expiry: '',
    timestamp: new Date().toISOString(),
    active: true
  };
  
  // Store notification for users
  let userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
  userNotifications.unshift(notification);
  localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
  
  // Store in admin sent notifications
  let sentNotifications = JSON.parse(localStorage.getItem('sentNotifications')) || [];
  sentNotifications.unshift(notification);
  localStorage.setItem('sentNotifications', JSON.stringify(sentNotifications));
  
  loadSentNotifications();
  alert('Quick notification sent!');
}

function loadSentNotifications() {
  const container = document.getElementById('sentNotificationsList');
  if (!container) return;
  
  const notifications = JSON.parse(localStorage.getItem('sentNotifications')) || [];
  
  if (notifications.length === 0) {
    container.innerHTML = '<p>No notifications sent yet</p>';
    return;
  }
  
  container.innerHTML = notifications.slice(0, 10).map(notif => `
    <div class="notification-item">
      <div class="notification-info">
        <h4>${notif.title}</h4>
        <p>${notif.message}</p>
        <small>Sent: ${new Date(notif.timestamp).toLocaleString()}</small>
      </div>
      <div class="notification-actions">
        <button onclick="deleteNotification(${notif.id})" class="delete-btn">Delete</button>
      </div>
    </div>
  `).join('');
}

function deleteNotification(id) {
  if (confirm('Delete this notification?')) {
    let sentNotifications = JSON.parse(localStorage.getItem('sentNotifications')) || [];
    sentNotifications = sentNotifications.filter(n => n.id !== id);
    localStorage.setItem('sentNotifications', JSON.stringify(sentNotifications));
    loadSentNotifications();
  }
}

// Admin product search
function searchAdminProducts() {
  const query = document.getElementById('adminProductSearch').value;
  loadProducts(query);
}

/* ===============================
   ADMIN SETTINGS FUNCTIONS
================================*/
function exportData() {
  const data = {
    products: JSON.parse(localStorage.getItem('products')) || [],
    orders: JSON.parse(localStorage.getItem('orders')) || [],
    categories: JSON.parse(localStorage.getItem('categories')) || [],
    discounts: JSON.parse(localStorage.getItem('adminDiscounts')) || []
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `shah-pharmacy-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  alert('Data exported successfully!');
}

function clearAllData() {
  if (!confirm('⚠️ WARNING: This will delete ALL data including products, orders, and settings. This action cannot be undone!')) {
    return;
  }
  
  if (!confirm('Are you absolutely sure? Type "DELETE" to confirm:') || prompt('Type DELETE to confirm:') !== 'DELETE') {
    return;
  }
  
  // Clear all localStorage data except admin credentials
  const credentials = localStorage.getItem('adminCredentials');
  localStorage.clear();
  if (credentials) {
    localStorage.setItem('adminCredentials', credentials);
  }
  
  alert('All data cleared successfully! Page will reload.');
  window.location.reload();
}

function updateStockThreshold() {
  const threshold = document.getElementById('stockThreshold').value;
  if (threshold && threshold > 0) {
    localStorage.setItem('stockAlertThreshold', threshold);
    alert('Stock alert threshold updated to ' + threshold);
  }
}

function updateAlertPhone() {
  const phone = document.getElementById('alertPhone').value;
  if (phone && phone.length === 10) {
    localStorage.setItem('alertPhoneNumber', phone);
    alert('Alert phone number updated to ' + phone);
  } else {
    alert('Please enter a valid 10-digit phone number');
  }
}

function loadAdminSettings() {
  // Load current settings
  const threshold = localStorage.getItem('stockAlertThreshold') || '30';
  const phone = localStorage.getItem('alertPhoneNumber') || '7905190933';
  
  const thresholdEl = document.getElementById('stockThreshold');
  const phoneEl = document.getElementById('alertPhone');
  
  if (thresholdEl) thresholdEl.value = threshold;
  if (phoneEl) phoneEl.value = phone;
  
  // Update system info
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  setText('systemProducts', products.length);
  setText('systemOrders', orders.length);
  setText('lastLogin', new Date().toLocaleString());
}
