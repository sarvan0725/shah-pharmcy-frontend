/*************************************************
 FULL & FINAL USER WEBSITE LOGIC
 Shah Pharmacy & Mini Mart
*************************************************/

/* ===============================
   CONFIGURATION (from config.js)
================================*/




const CATEGORY_MAP = {
  1: "Grocery",
  2: "Medicine",
  3: "Personal Care",
  4: "Bulk"
};

let products = [];

// ===============================
// THEME HANDLER (SAFE)
// ===============================
function applyTheme() {
  try {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
    console.log("🎨 Theme applied:", savedTheme);
  } catch (err) {
    console.warn("Theme error ignored:", err);
  }
}

async function loadUserProducts() {
  try {
    console.log("🟢 Loading products via pharmacyAPI...");

    products = await window.pharmacyAPI.getProducts();

    const container = document.getElementById("productList");
    if (!container) {
      console.error("❌ productList not found");
      return;
    }

    container.innerHTML = "";
    renderProducts(products);

  } catch (err) {
    console.error("❌ Backend error", err);
  }
}






// Configuration is now loaded from config.js
// Update config.js file for deployment settings
const RAZORPAY_KEY = RAZORPAY_KEY_ID;
const MIN_ORDER_AMOUNT = BUSINESS_CONFIG.minOrderAmount;
// Load delivery settings from localStorage or config
let MAX_DELIVERY_DISTANCE = parseFloat(localStorage.getItem('maxDeliveryDistance')) || BUSINESS_CONFIG.maxDeliveryDistance;
let FREE_DELIVERY_DISTANCE = parseFloat(localStorage.getItem('freeDeliveryDistance')) || 3;
let DELIVERY_CHARGE_PER_KM = parseFloat(localStorage.getItem('deliveryChargePerKm')) || BUSINESS_CONFIG.deliveryChargePerKm;

/* ===============================
   CATEGORY & PRODUCT DATA
================================*/
let defaultCategories = [
  { id: 1, name: "Medicine", icon: "💊", active: true, subcategories: [
    { id: 11, name: "Pain Relief", parentId: 1 },
    { id: 12, name: "Cold & Flu", parentId: 1 }
  ]},
  { id: 2, name: "Grocery", icon: "🛒", active: true, subcategories: [
    { id: 21, name: "Rice & Grains", parentId: 2 },
    { id: 22, name: "Oil & Spices", parentId: 2 }
  ]},
  { id: 3, name: "Personal Care", icon: "🧴", active: true, subcategories: [] },
  { id: 4, name: "Bulk", icon: "📦", active: true, subcategories: [] }
];

// ===============================
// LOAD PRODUCTS FROM BACKEND
// ===============================
//async function loadBackendProducts() {
//  try {
//    const res = await fetch("https://shah-pharmacy-backend.onrender.com/api/products");
//    const data = await res.json();

 //   products = data.map(p => ({
 //     id: p.id,
//name: p.name,
  //    price: p.price,
  //    stock: p.stock,
  //    weight: p.weight || "",
   //   image: p.image_url || p.image || p.imageUrl || p.secure_url,
   //   categoryId: p.category_id,
  //    subcategoryId: p.subcategory_id || null
    //}));

 
//let defaultProducts = [
 // { id: 1, name: "Paracetamol", price: 25, stock: 100, categoryId: 1, subcategoryId: 11, image: "", weight: "10 tablets" },
  //{ id: 2, name: "Crocin", price: 30, stock: 80, categoryId: 1, subcategoryId: 11, image: "", weight: "15 tablets" },
  //{ id: 3, name: "Rice", price: 60, stock: 50, categoryId: 2, subcategoryId: 21, image: "", weight: "1kg" },
//  { id: 4, name: "Sugar", price: 45, stock: 40, categoryId: 2, subcategoryId: 21, image: "", weight: "1kg" },
 // { id: 5, name: "Coconut Oil", price: 120, stock: 25, categoryId: 2, subcategoryId: 22, image: "", weight: "500ml" },
//  { id: 6, name: "Face Cream", price: 85, stock: 15, categoryId: 3, subcategoryId: null, image: "", weight: "50g" },
  //{ id: 7, name: "Rice Bulk", price: 1350, stock: 10, categoryId: 4, subcategoryId: null, image: "", weight: "25kg" },
  //{ id: 8, name: "Sugar Bulk", price: 1120, stock: 8, categoryId: 4, subcategoryId: null, image: "", weight: "25kg" },
 // { id: 9, name: "Oil Bulk", price: 850, stock: 15, categoryId: 4, subcategoryId: null, image: "", weight: "5L" }
//];

// Initialize data properly
let categories, products;
try {
  categories = JSON.parse(localStorage.getItem("categories")) || defaultCategories;
  products = JSON.parse(localStorage.getItem("products")) || defaultProducts;
} catch (e) {
  categories = defaultCategories;
  products = defaultProducts;
}

// Ensure we have data
if (!categories || categories.length === 0) categories = defaultCategories;
if (!products || products.length === 0) products = defaultProducts;

localStorage.setItem("categories", JSON.stringify(categories));
localStorage.setItem("products", JSON.stringify(products));

let cart = [];
let quantityMap = {};
let currentCategoryId = 1;

// Force reload data on startup
// forceReloadData() {
  // Don't overwrite existing data, just ensure we have defaults if empty
 // const existingProducts = JSON.parse(localStorage.getItem("products")) || [];
//  const existingCategories = JSON.parse(localStorage.getItem("categories")) || [];
  
//  if (existingProducts.length === 0) {
//    products = defaultProducts;
//    localStorage.setItem("products", JSON.stringify(products));
//  } else {
//    products = existingProducts;
//  }
  
//  if (existingCategories.length === 0) {
    //categories = defaultCategories;
  //  localStorage.setItem("categories", JSON.stringify(categories));
 // } else {
//    categories = existingCategories;
  //}
//}
//let currentSubcategoryId = null;
//let currentPage = 1;
//const ITEMS_PER_PAGE = 20;

// Shop location from configuration
const SHOP_LOCATION = BUSINESS_CONFIG.shopLocation;

let customerLocation = null;
let deliveryDistance = 0;
let deliveryCharge = 0;

/* ===============================
   LOAD
================================*/


document.addEventListener("DOMContentLoaded", () => {
  // forceReloadData(); ❌ OFF
   applyTheme(); // ✅ YAHI HOGA (ONLY ONCE)
  loadCustomColors();

  loadCategories();
  loadBackendProducts(); // ✅ BACKEND SE PRODUCTS
  renderProducts();
  updateCart();

  initializeUser();
  loadUserTheme();
  loadShopBanner();
  initializeContactInfo();
  checkDeliveryHours();
});


/* ===============================
   INITIALIZE CONTACT INFO
================================*/
function initializeContactInfo() {
  const contactNumbers = document.getElementById('contactNumbers');
  if (contactNumbers) {
    contactNumbers.textContent = `${BUSINESS_CONFIG.phone1} | ${BUSINESS_CONFIG.phone2}`;
  }
}

/* ===============================
   SHOP BANNER SYSTEM
================================*/
function loadShopBanner() {
  const bannerImage = localStorage.getItem('shopBannerImage');
  const bannerElement = document.getElementById('shopBanner');
  
  if (bannerImage && bannerElement) {
    bannerElement.style.backgroundImage = `url(${bannerImage})`;
    bannerElement.style.display = 'flex';
    
    // Hide regular header when banner is active
    document.querySelector('.header').style.display = 'none';
  }
}

/* ===============================
   RENDER PRODUCTS
================================*/
function renderProducts() {
  const list = document.getElementById("productList");
  if (!list) return;
  
  list.innerHTML = "";

  let filteredProducts = products.filter(p => p.categoryId === currentCategoryId);
  if (currentSubcategoryId) {
    filteredProducts = filteredProducts.filter(p => 
      p.subcategoryId === currentSubcategoryId || 
      p.subcategory === currentSubcategoryId
    );
  }

  const currentCategory = categories.find(c => c.id === currentCategoryId);
  const categoryIcon = currentCategory ? currentCategory.icon : '📦';

  if (filteredProducts.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">No products found in this category</div>';
    const pagination = document.getElementById('pagination');
    if (pagination) pagination.style.display = 'none';
    return;
  }

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  renderPagination(totalPages, filteredProducts.length);

  paginatedProducts.forEach(p => {
    if (!quantityMap[p.id]) quantityMap[p.id] = 1;

    list.innerHTML += `
      <div class="product-card">
        <div class="product-image">
          ${p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
          <div class="product-emoji" ${p.image ? 'style="display:none;"' : ''}>${categoryIcon}</div>
        </div>
        <div class="product-info">
          <h4>${p.name}</h4>
          <div class="product-weight">${p.weight || 'N/A'}</div>
          <div class="product-price">₹${p.price}</div>
          ${p.stock <= 10 ? '<div class="low-stock-warning">⚠️ Limited Stock!</div>' : ''}
        </div>
        <div class="quantity-controls">
          <div class="qty-selector">
            <button class="qty-btn" onclick="changeQty(${p.id}, -1)">-</button>
            <span class="qty-display" id="qty-${p.id}">${quantityMap[p.id]}</span>
            <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
          </div>
        </div>
        <div class="product-actions">
          <button class="add-to-cart" onclick="addToCart(${p.id})">
            <i class="fas fa-plus"></i> Add to Cart
          </button>
          <button class="add-to-wishlist" onclick="addToWishlist(${p.id})">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="product-rating">
          <div class="stars" onclick="showRatingModal(${p.id})">
            ⭐⭐⭐⭐⭐
          </div>
          <small>Click to rate</small>
        </div>
      </div>
    `;
  });
}

/* ===============================
   QUANTITY
================================*/
function changeQty(id, delta) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  quantityMap[id] += delta;
  if (quantityMap[id] < 1) quantityMap[id] = 1;
  if (quantityMap[id] > product.stock) quantityMap[id] = product.stock;

  document.getElementById("qty-" + id).innerText = quantityMap[id];
}

/* ===============================
   ADD TO CART (FIXED)
================================*/
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const qty = quantityMap[id] || 1;
  
  if (qty > product.stock) {
    alert('Not enough stock available!');
    return;
  }

  let item = cart.find(c => c.id === id);

  if (item) {
    if (item.qty + qty > product.stock) {
      alert('Not enough stock available!');
      return;
    }
    item.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: qty
    });
  }
  
  // AI Features
  trackCustomerBehavior('add_to_cart', { product: product.name, category: product.category });
  showSmartSuggestion(product.name);
  
  // Show success feedback
  const button = event.target.closest('.add-to-cart');
  if (button) {
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.background = '#28a745';
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.background = '';
    }, 1500);
  }
  
  updateCart();
}

/* ===============================
   LOCATION & DELIVERY SYSTEM
================================*/
function getCurrentLocation() {
  const locationBtn = document.querySelector('.location-btn');
  locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
  locationBtn.disabled = true;
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        customerLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        calculateDeliveryDistance();
        document.getElementById('deliveryAddress').value = `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        locationBtn.innerHTML = '<i class="fas fa-check"></i> Location Set';
        locationBtn.disabled = false;
      },
      (error) => {
        locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
        locationBtn.disabled = false;
        alert('Unable to get location. Please enter address manually.');
      }
    );
  } else {
    locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
    locationBtn.disabled = false;
    alert('Geolocation not supported. Please enter address manually.');
  }
}

function calculateDelivery() {
  const address = document.getElementById('deliveryAddress').value;
  if (address && !address.startsWith('Location:')) {
    // Simulate coordinates for entered address
    const addressVariations = {
      'khalilabad': { lat: 26.7606, lng: 83.0732 },
      'sant kabir nagar': { lat: 26.7606, lng: 83.0732 },
      'gorakhpur': { lat: 26.7588, lng: 83.3697 },
      'basti': { lat: 26.7928, lng: 82.7644 },
      'maharajganj': { lat: 27.1433, lng: 83.5619 }
    };
    
    const lowerAddress = address.toLowerCase();
    let foundLocation = null;
    
    for (const [key, coords] of Object.entries(addressVariations)) {
      if (lowerAddress.includes(key)) {
        foundLocation = coords;
        break;
      }
    }
    
    if (foundLocation) {
      customerLocation = foundLocation;
    } else {
      // Default to nearby location with some variation
      customerLocation = {
        lat: SHOP_LOCATION.lat + (Math.random() - 0.5) * 0.1,
        lng: SHOP_LOCATION.lng + (Math.random() - 0.5) * 0.1
      };
    }
    
    calculateDeliveryDistance();
    updateDeliverySummary();
  }
}

function calculateDeliveryDistance() {
  if (!customerLocation) return;
  
  // Calculate distance using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (customerLocation.lat - SHOP_LOCATION.lat) * Math.PI / 180;
  const dLng = (customerLocation.lng - SHOP_LOCATION.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(SHOP_LOCATION.lat * Math.PI / 180) * Math.cos(customerLocation.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  deliveryDistance = R * c;
  
  // Check if delivery is possible
  if (deliveryDistance > MAX_DELIVERY_DISTANCE) {
    deliveryCharge = -1; // Special value to indicate no delivery
  } else if (deliveryDistance <= FREE_DELIVERY_DISTANCE) {
    deliveryCharge = 0; // Free delivery within free distance
  } else {
    deliveryCharge = Math.ceil((deliveryDistance - FREE_DELIVERY_DISTANCE) * DELIVERY_CHARGE_PER_KM);
  }
  
  updateDeliveryInfo();
  updateCart();
}

function updateDeliveryInfo() {
  const deliveryInfo = document.getElementById('deliveryInfo');
  if (!deliveryInfo || !customerLocation) return;
  
  const distanceText = deliveryDistance.toFixed(1);
  
  if (deliveryDistance > MAX_DELIVERY_DISTANCE) {
    deliveryInfo.innerHTML = `
      <div class="distance-info">
        <i class="fas fa-route"></i> Distance: ${distanceText} km
      </div>
      <div class="delivery-not-possible">
        <i class="fas fa-times-circle"></i> Delivery not possible beyond ${MAX_DELIVERY_DISTANCE}km
      </div>
      <small>We deliver within ${MAX_DELIVERY_DISTANCE}km radius only</small>
    `;
  } else {
    const isFree = deliveryDistance <= FREE_DELIVERY_DISTANCE;
    deliveryInfo.innerHTML = `
      <div class="distance-info">
        <i class="fas fa-route"></i> Distance: ${distanceText} km
      </div>
      <div class="${isFree ? 'delivery-free' : 'delivery-paid'}">
        ${isFree ? 
          '<i class="fas fa-gift"></i> Free Delivery!' : 
          `<i class="fas fa-truck"></i> Delivery Charge: ₹${deliveryCharge}`
        }
      </div>
      ${!isFree ? `<small>₹${DELIVERY_CHARGE_PER_KM} per km beyond ${FREE_DELIVERY_DISTANCE}km radius</small>` : ''}
    `;
  }
}

/* ===============================
   CART UI
================================*/
function updateCart() {
  const items = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const subtotalEl = document.getElementById("cartSubtotal");
  const deliveryChargeEl = document.getElementById("deliveryChargeText");
  const cartCount = document.getElementById("cartCount");

  if (!items || !totalEl) return;

  items.innerHTML = "";
  
  let subtotal = 0;
  let itemCount = 0;

  if (cart.length === 0) {
    items.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
        <small>Add items to get started</small>
      </div>
    `;
  } else {
    cart.forEach((i, index) => {
      subtotal += i.price * i.qty;
      itemCount += i.qty;
      
      items.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name">${i.name}</div>
            <div class="cart-item-price">₹${i.price} × ${i.qty} = ₹${i.price * i.qty}</div>
          </div>
          <button class="remove-item" onclick="removeFromCart(${index})">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    });
  }

  // Check for auto discounts
  checkAutoDiscount(subtotal);
  
  // Calculate discounts and coins
  let currentDiscount = 0;
  if (activeDiscount) {
    currentDiscount = activeDiscount.type === 'percentage' ? 
      Math.floor(subtotal * activeDiscount.amount / 100) : activeDiscount.amount;
  }
  
  autoDiscountAmount = 0;
  if (autoDiscount) {
    autoDiscountAmount = autoDiscount.type === 'percentage' ? 
      Math.floor(subtotal * autoDiscount.amount / 100) : autoDiscount.amount;
  }
  
  const coinsDiscount = coinsUsed * 100;
  const actualDeliveryCharge = deliveryCharge === -1 ? 0 : deliveryCharge;
  const finalTotal = subtotal + actualDeliveryCharge - currentDiscount - autoDiscountAmount - coinsDiscount;
  
  // Update display
  if (subtotalEl) subtotalEl.innerText = subtotal;
  if (deliveryChargeEl) {
    if (deliveryCharge === -1) {
      deliveryChargeEl.innerText = 'Not Available';
      deliveryChargeEl.style.color = '#e74c3c';
    } else {
      deliveryChargeEl.innerText = deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`;
      deliveryChargeEl.style.color = deliveryCharge === 0 ? 'green' : '#ff9800';
    }
  }
  
  // Show/hide discount lines
  const discountLine = document.getElementById('discountLine');
  const autoDiscountLine = document.getElementById('autoDiscountLine');
  const coinsLine = document.getElementById('coinsLine');
  
  if (currentDiscount > 0) {
    discountLine.style.display = 'flex';
    document.getElementById('discountAmount').textContent = `-₹${currentDiscount}`;
  } else {
    discountLine.style.display = 'none';
  }
  
  if (autoDiscountAmount > 0) {
    autoDiscountLine.style.display = 'flex';
    document.getElementById('autoDiscountAmount').textContent = `-₹${autoDiscountAmount}`;
    document.getElementById('autoDiscountLabel').textContent = `${autoDiscount.title}:`;
  } else {
    autoDiscountLine.style.display = 'none';
  }
  
  if (coinsUsed > 0) {
    coinsLine.style.display = 'flex';
    document.getElementById('coinsUsedAmount').textContent = `-₹${coinsDiscount}`;
  } else {
    coinsLine.style.display = 'none';
  }
  
  totalEl.innerText = Math.max(0, finalTotal);
  if (cartCount) {
    cartCount.innerText = itemCount;
    cartCount.style.display = itemCount > 0 ? 'flex' : 'none';
  }
}

/* ===============================
   REMOVE FROM CART
================================*/
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

/* ===============================
   CART OPTIONS BOTTOM SHEET
================================*/
function toggleCartOptions() {
  const sheet = document.getElementById('cartOptionsSheet');
  const overlay = document.getElementById('cartOptionsOverlay');
  
  sheet.classList.add('show');
  overlay.classList.add('show');
  
  // Update detailed total
  const cartTotal = document.getElementById('cartTotal').textContent;
  const cartTotalDetailed = document.getElementById('cartTotalDetailed');
  if (cartTotalDetailed) cartTotalDetailed.textContent = cartTotal;
}

function closeCartOptions() {
  const sheet = document.getElementById('cartOptionsSheet');
  const overlay = document.getElementById('cartOptionsOverlay');
  
  sheet.classList.remove('show');
  overlay.classList.remove('show');
}

function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    cart = [];
    updateCart();
    closeCartOptions();
  }
}

function saveCartForLater() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  localStorage.setItem('savedCart', JSON.stringify(cart));
  alert('Cart saved for later!');
  closeCartOptions();
}

function updateDeliverySummary() {
  const deliverySummary = document.getElementById('deliverySummary');
  const deliveryAddress = document.getElementById('deliveryAddress').value;
  
  if (deliveryAddress && deliverySummary) {
    const shortAddress = deliveryAddress.length > 30 ? 
      deliveryAddress.substring(0, 30) + '...' : deliveryAddress;
    deliverySummary.innerHTML = `<span>${shortAddress}</span>`;
  }
}

/* ===============================
   CART TOGGLE
================================*/
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

/* ===============================
   AI ASSISTANT FEATURES
================================*/
let aiChatOpen = false;
let customerData = JSON.parse(localStorage.getItem("customerData")) || {
  purchaseHistory: [],
  preferences: [],
  healthConditions: []
};

// AI Knowledge Base
const aiKnowledge = {
  symptoms: {
    fever: ["Paracetamol", "Crocin", "Dolo"],
    headache: ["Paracetamol", "Aspirin", "Ibuprofen"],
    cough: ["Benadryl", "Ascoril", "Glycodin"],
    cold: ["Sinarest", "Wikoryl", "Cetrizine"],
    diabetes: ["Metformin", "Insulin", "Glucometer"],
    bp: ["Amlodipine", "Telmisartan", "BP Monitor"]
  },
  smartSuggestions: {
    "Rice": ["Dal", "Oil", "Salt"],
    "Sugar": ["Tea", "Milk", "Biscuits"],
    "Paracetamol": ["Thermometer", "ORS", "Vitamin C"]
  }
};

function toggleAIChat() {
  const chatbot = document.getElementById('aiChatbot');
  const overlay = document.getElementById('aiOverlay');
  
  aiChatOpen = !aiChatOpen;
  
  if (aiChatOpen) {
    chatbot.classList.add('open');
    overlay.classList.add('active');
  } else {
    chatbot.classList.remove('open');
    overlay.classList.remove('active');
  }
}

function handleAIEnter(event) {
  if (event.key === 'Enter') {
    sendAIMessage();
  }
}

function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  addChatMessage(message, 'user');
  input.value = '';
  
  // Process AI response
  setTimeout(() => {
    const response = processAIQuery(message);
    addChatMessage(response, 'ai');
  }, 1000);
}

function quickAIQuery(query) {
  const responses = {
    fever: "For fever, I recommend Paracetamol or Crocin. Both are effective and safe. Would you like me to add them to your cart?",
    headache: "For headaches, try Paracetamol or Aspirin. If it's severe, consult a doctor. Shall I show you these medicines?",
    diabetes: "For diabetes management, we have Metformin and blood glucose monitors. Regular monitoring is important!",
    vitamins: "Great choice! We have Vitamin D, B-Complex, and Multivitamins. Which specific vitamin are you looking for?"
  };
  
  addChatMessage(responses[query], 'ai');
}

function addChatMessage(message, sender) {
  const chatBody = document.getElementById('aiChatBody');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = sender === 'user' ? 'ai-message user-message' : 'ai-message';
  
  if (sender === 'ai') {
    messageDiv.innerHTML = `
      <div class="ai-avatar">🤖</div>
      <div class="message-content">
        <p>${message}</p>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${message}</p>
      </div>
    `;
  }
  
  chatBody.appendChild(messageDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function processAIQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Symptom-based recommendations
  for (const [symptom, medicines] of Object.entries(aiKnowledge.symptoms)) {
    if (lowerQuery.includes(symptom)) {
      return `For ${symptom}, I recommend: ${medicines.join(', ')}. These are available in our store. Would you like me to add any to your cart?`;
    }
  }
  
  // Product search
  const matchingProducts = products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) || 
    p.category.toLowerCase().includes(lowerQuery)
  );
  
  if (matchingProducts.length > 0) {
    const productNames = matchingProducts.slice(0, 3).map(p => p.name).join(', ');
    return `I found these products: ${productNames}. Check them out in the ${matchingProducts[0].category} section!`;
  }
  
  // General health advice
  if (lowerQuery.includes('health') || lowerQuery.includes('tip')) {
    const tips = [
      "Drink 8 glasses of water daily for better health!",
      "Take your medicines on time for best results.",
      "Regular exercise boosts immunity naturally.",
      "Eat fruits and vegetables for essential vitamins."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }
  
  return "I'm here to help with medicines, health advice, and shopping suggestions. Try asking about symptoms like 'fever' or 'headache', or ask for health tips!";
}

// Smart Suggestions System
function showSmartSuggestion(productName) {
  const suggestions = aiKnowledge.smartSuggestions[productName];
  if (!suggestions) return;
  
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  const suggestionText = document.getElementById('suggestionText');
  const suggestionBanner = document.getElementById('smartSuggestions');
  
  suggestionText.textContent = `💡 AI Tip: People who buy ${productName} also buy ${randomSuggestion}!`;
  suggestionBanner.classList.add('show');
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    suggestionBanner.classList.remove('show');
  }, 5000);
}

function hideSuggestion() {
  document.getElementById('smartSuggestions').classList.remove('show');
}

/* ===============================
   WISHLIST & RATING SYSTEM
================================*/
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let productRatings = JSON.parse(localStorage.getItem('productRatings')) || {};

function addToWishlist(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  if (!wishlist.find(w => w.id === id)) {
    wishlist.push({
      id: product.id,
      name: product.name,
      price: product.price
    });
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    
    // Show brief success message without blocking
    const button = event.target.closest('.add-to-wishlist');
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.background = '#28a745';
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.background = '';
    }, 1500);
  } else {
    // Item already in wishlist - show feedback
    const button = event.target.closest('.add-to-wishlist');
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-heart"></i> In Wishlist';
    button.style.background = '#ffc107';
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.background = '';
    }, 1500);
  }
}

function toggleWishlist() {
  const sidebar = document.getElementById('wishlistSidebar');
  const overlay = document.getElementById('wishlistOverlay');
  
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
  
  if (sidebar.classList.contains('open')) {
    loadWishlistItems();
  }
}

function addAllToCart() {
  if (wishlist.length === 0) {
    alert('Your wishlist is empty!');
    return;
  }
  
  wishlist.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product && product.stock > 0) {
      addToCart(item.id);
    }
  });
  
  alert(`Added ${wishlist.length} items to cart!`);
  toggleWishlist();
}

function loadWishlistItems() {
  const container = document.getElementById('wishlistItems');
  if (!container) return;
  
  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-heart"></i>
        <p>Your wishlist is empty</p>
        <small>Add items you love to see them here</small>
      </div>
    `;
    return;
  }
  
  container.innerHTML = wishlist.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price}</div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="add-to-cart" onclick="addToCart(${item.id}); removeFromWishlist(${item.id});" style="padding: 8px 12px; font-size: 12px;">
          <i class="fas fa-plus"></i>
        </button>
        <button class="remove-item" onclick="removeFromWishlist(${item.id})">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function removeFromWishlist(id) {
  wishlist = wishlist.filter(w => w.id !== id);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  loadWishlistItems();
  updateWishlistCount();
}

function updateWishlistCount() {
  const count = document.getElementById('wishlistCount');
  if (count) {
    count.textContent = wishlist.length;
    count.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
}

function showRatingModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;text-align:center;max-width:400px;width:90%;" onclick="event.stopPropagation()">
        <h3>Rate ${product.name}</h3>
        <div class="rating-stars" style="font-size:30px;margin:20px 0;">
          <span onclick="setRating(${productId}, 1)" style="cursor:pointer;">⭐</span>
          <span onclick="setRating(${productId}, 2)" style="cursor:pointer;">⭐</span>
          <span onclick="setRating(${productId}, 3)" style="cursor:pointer;">⭐</span>
          <span onclick="setRating(${productId}, 4)" style="cursor:pointer;">⭐</span>
          <span onclick="setRating(${productId}, 5)" style="cursor:pointer;">⭐</span>
        </div>
        <textarea id="reviewText" placeholder="Write a review (optional)" rows="3" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;"></textarea>
        <div style="margin-top:15px;">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:#ccc;color:black;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Cancel</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function setRating(productId, rating) {
  const reviewText = document.getElementById('reviewText').value;
  productRatings[productId] = {
    rating: rating,
    review: reviewText,
    date: new Date().toISOString()
  };
  localStorage.setItem('productRatings', JSON.stringify(productRatings));
  document.querySelector('[style*="position:fixed"]').remove();
  alert(`Thank you for rating! ${rating} stars given.`);
}

/* ===============================
   SHOP CHAT SYSTEM
================================*/
function showShopChat() {
  closeOverflowMenu(); // Close overflow menu first
  document.getElementById('shopChatModal').style.display = 'flex';
  loadShopChatHistory();
}

function hideShopChat() {
  document.getElementById('shopChatModal').style.display = 'none';
}

function handleShopChatEnter(event) {
  if (event.key === 'Enter') {
    sendShopMessage();
  }
}

function sendShopMessage() {
  const input = document.getElementById('shopChatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  addShopChatMessage(message, 'user');
  input.value = '';
  
  // Save message
  saveShopChatMessage(message, 'user');
  
  // Auto-reply from shop
  setTimeout(() => {
    const reply = generateShopReply(message);
    addShopChatMessage(reply, 'shop');
    saveShopChatMessage(reply, 'shop');
  }, 1000);
}

function quickShopMessage(message) {
  document.getElementById('shopChatInput').value = message;
  sendShopMessage();
}

function addShopChatMessage(message, sender) {
  const chatBody = document.getElementById('shopChatMessages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = sender === 'user' ? 'user-chat-message' : 'shop-message';
  
  if (sender === 'shop') {
    messageDiv.innerHTML = `
      <div class="shop-avatar">🏪</div>
      <div class="message-content">
        <p>${message}</p>
        <small>${new Date().toLocaleTimeString()}</small>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${message}</p>
        <small>${new Date().toLocaleTimeString()}</small>
      </div>
      <div class="user-avatar">👤</div>
    `;
  }
  
  chatBody.appendChild(messageDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function generateShopReply(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('order') && lowerMessage.includes('status')) {
    return 'Please share your Order ID and we\'ll check the status for you. You can find it in your order confirmation message.';
  }
  
  if (lowerMessage.includes('delivery') || lowerMessage.includes('when')) {
    return 'Our delivery time is 10-15 minutes within 3km radius. For farther locations, it may take 30-45 minutes. What\'s your location?';
  }
  
  if (lowerMessage.includes('medicine') || lowerMessage.includes('available')) {
    return 'Please tell us the medicine name and we\'ll check availability. You can also search in our app or call us at 9369009763.';
  }
  
  if (lowerMessage.includes('prescription')) {
    return 'You can upload your prescription using the "Upload Prescription" option in your profile. We\'ll prepare your medicines and contact you.';
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return 'All our prices are displayed on the app. We offer competitive rates and regular discounts. What specific item are you looking for?';
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello! Welcome to Shah Pharmacy. How can we assist you today? You can ask about orders, medicines, or any health-related queries.';
  }
  
  return 'Thank you for contacting us! For immediate assistance, please call us at 9369009763 or WhatsApp us. Our team will help you right away.';
}

function saveShopChatMessage(message, sender) {
  let chatHistory = JSON.parse(localStorage.getItem('shopChatHistory')) || [];
  let shopChatMessages = JSON.parse(localStorage.getItem('shopChatMessages')) || [];
  
  const chatMessage = {
    id: Date.now(),
    message: message,
    sender: sender,
    timestamp: new Date().toISOString(),
    userId: currentUser ? currentUser.phone : 'guest_' + Date.now(),
    userName: currentUser ? currentUser.name : 'Guest User',
    isAdmin: sender === 'shop',
    adminRead: sender === 'shop' // Admin messages are automatically marked as read
  };
  
  // Save to chat history (for user)
  chatHistory.push(chatMessage);
  
  // Save to shop chat messages (for admin)
  shopChatMessages.push(chatMessage);
  
  // Keep only last 50 messages in history
  if (chatHistory.length > 50) {
    chatHistory = chatHistory.slice(-50);
  }
  
  // Keep only last 100 messages for admin
  if (shopChatMessages.length > 100) {
    shopChatMessages = shopChatMessages.slice(-100);
  }
  
  localStorage.setItem('shopChatHistory', JSON.stringify(chatHistory));
  localStorage.setItem('shopChatMessages', JSON.stringify(shopChatMessages));
}

function loadShopChatHistory() {
  const chatHistory = JSON.parse(localStorage.getItem('shopChatHistory')) || [];
  const chatBody = document.getElementById('shopChatMessages');
  
  // Clear existing messages except welcome message
  const welcomeMessage = chatBody.querySelector('.shop-message');
  chatBody.innerHTML = '';
  if (welcomeMessage) {
    chatBody.appendChild(welcomeMessage);
  }
  
  // Load recent messages (last 10)
  const recentMessages = chatHistory.slice(-10);
  recentMessages.forEach(msg => {
    if (msg.user === (currentUser ? currentUser.name : 'Guest')) {
      addShopChatMessage(msg.message, msg.sender);
    }
  });
}

function callShop() {
  window.location.href = 'tel:9369009763';
}

/* ===============================
   SIDE MENU SYSTEM
================================*/
function toggleSideMenu() {
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('sideMenuOverlay');
  
  sideMenu.classList.toggle('open');
  overlay.classList.toggle('active');
  
  // Update user info in side menu
  updateSideMenuUserInfo();
  updateSideMenuCounts();
}

function updateSideMenuUserInfo() {
  const userInfoSection = document.getElementById('sideMenuUserInfo');
  
  if (currentUser) {
    userInfoSection.innerHTML = `
      <div class="logged-user-info">
        <i class="fas fa-user-circle"></i>
        <div class="user-details">
          <span class="user-name">${currentUser.name}</span>
          <span class="user-phone">${currentUser.phone}</span>
        </div>
        <button onclick="logoutUser()" class="logout-btn">Logout</button>
      </div>
    `;
  } else {
    userInfoSection.innerHTML = `
      <div class="guest-info">
        <i class="fas fa-user-circle"></i>
        <span>Guest User</span>
        <button onclick="showLogin()" class="login-link">Login</button>
      </div>
    `;
  }
}

function updateSideMenuCounts() {
  const wishlistCount = document.getElementById('sideWishlistCount');
  const coinsCount = document.getElementById('sideCoinsCount');
  
  if (wishlistCount) {
    wishlistCount.textContent = wishlist.length;
    wishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
  
  if (coinsCount) {
    coinsCount.textContent = userCoins;
    coinsCount.style.display = userCoins > 0 ? 'flex' : 'none';
  }
}

function showCoinsInfo() {
  toggleSideMenu(); // Close side menu
  
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;text-align:center;max-width:400px;width:90%;" onclick="event.stopPropagation()">
        <h3 style="color:var(--primary-color);margin-bottom:20px;"><i class="fas fa-coins"></i> My Coins</h3>
        <div style="text-align:center;margin:20px 0;">
          <div style="font-size:48px;color:var(--primary-color);margin-bottom:10px;">${userCoins}</div>
          <p><strong>Available Coins</strong></p>
          <p style="font-size:14px;color:#666;">1 Coin = ₹100 discount</p>
        </div>
        <div style="background:var(--light-color);padding:15px;border-radius:8px;margin:15px 0;">
          <h4 style="color:var(--primary-color);margin-bottom:10px;">How to Earn Coins:</h4>
          <ul style="text-align:left;font-size:14px;">
            <li>Place orders (1 coin per ₹100 spent)</li>
            <li>Refer friends to our pharmacy</li>
            <li>Write product reviews</li>
            <li>Complete your profile</li>
          </ul>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background:var(--primary-color);color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function whatsappShop() {
  const message = currentUser ? 
    `Hi, I'm ${currentUser.name}. I need help with my order/query.` : 
    'Hi, I need help with my order/query.';
  
  const whatsappUrl = `https://wa.me/919369009763?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

/* ===============================
   BOTTOM SHEET MENU
================================*/
function toggleBottomSheet() {
  const bottomSheet = document.getElementById('bottomSheet');
  const overlay = document.getElementById('bottomSheetOverlay');
  
  bottomSheet.classList.add('show');
  overlay.classList.add('show');
}

function closeBottomSheet() {
  const bottomSheet = document.getElementById('bottomSheet');
  const overlay = document.getElementById('bottomSheetOverlay');
  
  bottomSheet.classList.remove('show');
  overlay.classList.remove('show');
}

/* ===============================
   PRESCRIPTION UPLOAD
================================*/
function showPrescriptionUpload() {
  closeOverflowMenu(); // Close the overflow menu first
  
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;max-width:500px;width:90%;" onclick="event.stopPropagation()">
        <h3 style="color:var(--primary-color);margin-bottom:20px;"><i class="fas fa-prescription"></i> Upload Prescription</h3>
        
        <div style="margin:20px 0;">
          <label style="display:block;margin-bottom:10px;font-weight:600;">Select Prescription Image:</label>
          <input type="file" id="prescriptionFile" accept="image/*" onchange="handlePrescriptionUpload()" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;margin-bottom:15px;">
          
          <div id="prescriptionPreview" style="margin:15px 0;text-align:center;min-height:100px;border:2px dashed #ddd;border-radius:8px;padding:20px;">
            <p style="color:#666;margin:0;">📷 Image preview will appear here</p>
          </div>
          
          <label style="display:block;margin-bottom:5px;font-weight:600;">Additional Notes (Optional):</label>
          <textarea id="prescriptionNotes" placeholder="Any special instructions or notes..." rows="3" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;resize:vertical;"></textarea>
        </div>
        
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
          <button onclick="submitPrescription()" style="background:var(--primary-color);color:white;border:none;padding:12px 20px;border-radius:5px;cursor:pointer;font-weight:600;">
            <i class="fas fa-upload"></i> Submit Prescription
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:#ccc;color:black;border:none;padding:12px 20px;border-radius:5px;cursor:pointer;">
            Cancel
          </button>
        </div>
        
        <div style="background:#e8f5e8;padding:15px;border-radius:8px;margin-top:15px;">
          <p style="margin:0;font-size:14px;color:#2d5a2d;">
            <i class="fas fa-info-circle"></i> <strong>Note:</strong> We will review your prescription and contact you within 30 minutes with medicine availability and pricing.
          </p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function hidePrescriptionUpload() {
  document.getElementById('prescriptionModal').style.display = 'none';
}

function handlePrescriptionUpload() {
  const file = document.getElementById('prescriptionFile').files[0];
  const preview = document.getElementById('prescriptionPreview');
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `
        <img src="${e.target.result}" style="max-width:100%;max-height:200px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <p style="margin:10px 0 0 0;color:#666;font-size:12px;">File: ${file.name}</p>
      `;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = '<p style="color:#666;margin:0;">📷 Image preview will appear here</p>';
  }
}

function submitPrescription() {
  const file = document.getElementById('prescriptionFile').files[0];
  const notes = document.getElementById('prescriptionNotes').value;
  
  if (!file) {
    alert('Please upload prescription image');
    return;
  }
  
  const prescription = {
    id: Date.now(),
    fileName: file.name,
    fileSize: file.size,
    notes: notes,
    customerName: currentUser ? currentUser.name : 'Guest User',
    customerPhone: currentUser ? currentUser.phone : 'Not provided',
    date: new Date().toISOString(),
    status: 'Submitted'
  };
  
  let prescriptions = JSON.parse(localStorage.getItem('prescriptions')) || [];
  prescriptions.push(prescription);
  localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
  
  // Close modal
  document.querySelector('[style*="position:fixed"]').remove();
  
  // Show success message
  const successModal = document.createElement('div');
  successModal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;text-align:center;max-width:400px;width:90%;" onclick="event.stopPropagation()">
        <div style="color:#28a745;font-size:48px;margin-bottom:15px;">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3 style="color:#28a745;margin-bottom:15px;">Prescription Submitted!</h3>
        <p style="margin-bottom:20px;color:#666;">We have received your prescription. Our pharmacist will review it and contact you within 30 minutes.</p>
        <div style="background:#e8f5e8;padding:15px;border-radius:8px;margin:15px 0;text-align:left;">
          <p style="margin:0;font-size:14px;color:#2d5a2d;">
            <strong>What happens next:</strong><br>
            • Pharmacist reviews your prescription<br>
            • We check medicine availability<br>
            • You receive a call with pricing<br>
            • Confirm order and delivery details
          </p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background:#28a745;color:white;border:none;padding:12px 24px;border-radius:5px;cursor:pointer;font-weight:600;">
          Got it!
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(successModal);
}

function showOrderHistory() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const userOrders = orders.filter(order => currentUser && order.customerName === currentUser.name);
  
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="color:var(--primary-color);margin:0;"><i class="fas fa-history"></i> Order History</h3>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:none;border:none;font-size:20px;cursor:pointer;">×</button>
        </div>
        <div>
          ${userOrders.length === 0 ? '<p>No orders found</p>' : userOrders.map(order => `
            <div style="border:1px solid #ddd;border-radius:8px;padding:15px;margin:10px 0;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <strong>Order #${order.id}</strong>
                <span style="color:var(--primary-color);font-weight:600;">₹${order.total}</span>
              </div>
              <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${getOrderStatus(order)}</p>
              <p><strong>Items:</strong> ${order.items.length}</p>
              <p><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              <div style="margin-top:10px;">
                <button onclick="downloadInvoice(${order.id})" style="background:var(--primary-color);color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:12px;margin-right:5px;">Download Invoice</button>
                <button onclick="trackSpecificOrder(${order.id})" style="background:#2196F3;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:12px;">Ask About Order</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function trackSpecificOrder(orderId) {
  document.querySelector('[style*="position:fixed"]').remove();
  showShopChat();
  
  // Auto-send order inquiry message
  setTimeout(() => {
    const message = `Hi, I want to check the status of my Order #${orderId}. Can you please help?`;
    document.getElementById('shopChatInput').value = message;
    sendShopMessage();
  }, 500);
}
function addCategory() {
  const name = prompt('Category Name:');
  const icon = prompt('Category Icon (emoji):');
  
  if (!name || !icon) return;
  
  const newId = Math.max(...categories.map(c => c.id)) + 1;
  categories.push({
    id: newId,
    name: name,
    icon: icon,
    active: true,
    subcategories: []
  });
  
  localStorage.setItem('categories', JSON.stringify(categories));
  loadCategories();
  alert('Category added successfully!');
}

function deleteCategory() {
  if (categories.length <= 1) {
    alert('Cannot delete the last category!');
    return;
  }
  
  const currentCategory = categories.find(c => c.id === currentCategoryId);
  if (!confirm(`Delete "${currentCategory?.name}" category?`)) return;
  
  categories = categories.filter(c => c.id !== currentCategoryId);
  products = products.filter(p => p.categoryId !== currentCategoryId);
  
  currentCategoryId = categories[0].id;
  localStorage.setItem('categories', JSON.stringify(categories));
  localStorage.setItem('products', JSON.stringify(products));
  
  loadCategories();
  renderProducts();
  alert('Category deleted successfully!');
}

function addSubcategory() {
  // Show category selection modal
  const categoryOptions = categories.map(c => `${c.id}: ${c.name}`).join('\n');
  const selectedCategoryId = prompt(`Select Category ID:\n${categoryOptions}\n\nEnter Category ID:`);
  
  if (!selectedCategoryId) return;
  
  const categoryId = parseInt(selectedCategoryId);
  const category = categories.find(c => c.id === categoryId);
  
  if (!category) {
    alert('Invalid category ID!');
    return;
  }
  
  const name = prompt(`Add subcategory to "${category.name}":\n\nSubcategory Name:`);
  if (!name) return;
  
  const newId = Math.max(0, ...categories.flatMap(c => c.subcategories || []).map(s => s.id)) + 1;
  
  if (!category.subcategories) category.subcategories = [];
  category.subcategories.push({
    id: newId,
    name: name,
    parentId: categoryId
  });
  
  localStorage.setItem('categories', JSON.stringify(categories));
  alert(`Subcategory "${name}" added to "${category.name}" successfully!`);
  
  // Reload if viewing this category
  if (currentCategoryId === categoryId) {
    loadSubcategories(categoryId);
  }
}

// Admin delivery settings
// Pagination functions
function renderPagination(totalPages, totalItems) {
  const pagination = document.getElementById('pagination');
  if (!pagination || totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }

  pagination.style.display = 'flex';
  pagination.innerHTML = `
    <div class="pagination-info">Page ${currentPage} of ${totalPages} (${totalItems} items)</div>
    <div class="pagination-controls">
      <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
      <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;
}

function changePage(page) {
  if (page < 1) return;
  currentPage = page;
  renderProducts();
}

function changeDeliverySettings() {
  const freeDistance = prompt('Free delivery distance (km):', FREE_DELIVERY_DISTANCE);
  const chargePerKm = prompt('Charge per km after free distance (₹):', DELIVERY_CHARGE_PER_KM);
  const maxDistance = prompt('Maximum delivery distance (km):', MAX_DELIVERY_DISTANCE);
  
  if (freeDistance && chargePerKm && maxDistance) {
    localStorage.setItem('freeDeliveryDistance', freeDistance);
    localStorage.setItem('deliveryChargePerKm', chargePerKm);
    localStorage.setItem('maxDeliveryDistance', maxDistance);
    
    FREE_DELIVERY_DISTANCE = parseFloat(freeDistance);
    DELIVERY_CHARGE_PER_KM = parseFloat(chargePerKm);
    MAX_DELIVERY_DISTANCE = parseFloat(maxDistance);
    
    alert('Delivery settings updated successfully!');
    
    if (customerLocation) {
      calculateDeliveryDistance();
    }
  }
}

/* ===============================
   COLOR CUSTOMIZATION SYSTEM
================================*/
function showColorCustomizer() {
  const modal = document.getElementById('colorCustomizer');
  modal.classList.add('show');
  
  // Load current color
  const currentColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
  document.getElementById('primaryColorInput').value = currentColor;
  document.getElementById('primaryColorPreview').textContent = currentColor;
}

function hideColorCustomizer() {
  document.getElementById('colorCustomizer').classList.remove('show');
}

function updatePrimaryColor() {
  const colorInput = document.getElementById('primaryColorInput');
  const preview = document.getElementById('primaryColorPreview');
  preview.textContent = colorInput.value;
}

function setColorPreset(color, name) {
  document.getElementById('primaryColorInput').value = color;
  document.getElementById('primaryColorPreview').textContent = color;
}

function applyColors() {
  const primaryColor = document.getElementById('primaryColorInput').value;
  
  // Calculate darker shade for hover effects
  const darkColor = adjustBrightness(primaryColor, -20);
  
  // Calculate lighter shade for backgrounds
  const lightColor = adjustBrightness(primaryColor, 80);
  
  // Update CSS variables
  document.documentElement.style.setProperty('--primary-color', primaryColor);
  document.documentElement.style.setProperty('--dark-color', darkColor);
  document.documentElement.style.setProperty('--light-color', lightColor);
  
  // Save to localStorage
  localStorage.setItem('customPrimaryColor', primaryColor);
  localStorage.setItem('customDarkColor', darkColor);
  localStorage.setItem('customLightColor', lightColor);
  
  hideColorCustomizer();
  alert('Colors updated successfully!');
}

function resetColors() {
  // Reset to default red theme
  document.documentElement.style.setProperty('--primary-color', '#DC2626');
  document.documentElement.style.setProperty('--dark-color', '#B91C1C');
  document.documentElement.style.setProperty('--light-color', '#FEE2E2');
  
  // Remove from localStorage
  localStorage.removeItem('customPrimaryColor');
  localStorage.removeItem('customDarkColor');
  localStorage.removeItem('customLightColor');
  
  document.getElementById('primaryColorInput').value = '#DC2626';
  document.getElementById('primaryColorPreview').textContent = '#DC2626';
  
  alert('Colors reset to default!');
}

function adjustBrightness(hex, percent) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Adjust brightness
  const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
  const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
  const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));
  
  // Convert back to hex
  return '#' + 
    Math.round(newR).toString(16).padStart(2, '0') +
    Math.round(newG).toString(16).padStart(2, '0') +
    Math.round(newB).toString(16).padStart(2, '0');
}

function loadCustomColors() {
  const primaryColor = localStorage.getItem('customPrimaryColor');
  const darkColor = localStorage.getItem('customDarkColor');
  const lightColor = localStorage.getItem('customLightColor');
  
  if (primaryColor && darkColor && lightColor) {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--dark-color', darkColor);
    document.documentElement.style.setProperty('--light-color', lightColor);
  }
}

// Auto Discount System
function checkAutoDiscount(subtotal) {
  // Auto discount rules
  if (subtotal >= 1000) {
    autoDiscount = {
      title: 'Shopping Discount 3%',
      type: 'percentage',
      amount: 3
    };
    showAutoDiscountInfo('3% discount applied on orders above ₹1000!');
  } else if (subtotal >= 500) {
    autoDiscount = {
      title: 'Shopping Discount 2%', 
      type: 'percentage',
      amount: 2
    };
    showAutoDiscountInfo('2% discount applied on orders above ₹500!');
  } else {
    autoDiscount = null;
    hideAutoDiscountInfo();
  }
}

function showAutoDiscountInfo(message) {
  const autoDiscountInfo = document.getElementById('autoDiscountInfo');
  const autoDiscountText = document.getElementById('autoDiscountText');
  
  if (autoDiscountInfo && autoDiscountText) {
    autoDiscountText.textContent = message;
    autoDiscountInfo.style.display = 'flex';
  }
}

function hideAutoDiscountInfo() {
  const autoDiscountInfo = document.getElementById('autoDiscountInfo');
  if (autoDiscountInfo) {
    autoDiscountInfo.style.display = 'none';
  }
}

// AI-Powered Analytics for Customer Behavior
function trackCustomerBehavior(action, data) {
  const behavior = {
    timestamp: new Date().toISOString(),
    action: action,
    data: data
  };
  
  let behaviors = JSON.parse(localStorage.getItem('customerBehaviors')) || [];
  behaviors.push(behavior);
  
  // Keep only last 100 behaviors
  if (behaviors.length > 100) behaviors = behaviors.slice(-100);
  
  localStorage.setItem('customerBehaviors', JSON.stringify(behaviors));
}

function showAdminLogin() {
  const password = prompt('🔐 Enter Admin Password:');
  if (password === 'ShahPharmacy@2024!') {
    window.open('js/admin/dashboard.html', '_blank');
  } else if (password !== null) {
    alert('❌ Invalid password!');
  }
}

/* ===============================
   ZOMATO-STYLE OVERFLOW MENU
================================*/
function toggleOverflowMenu() {
  const panel = document.getElementById('overflowMenuPanel');
  const overlay = document.getElementById('overflowMenuOverlay');
  
  panel.classList.add('show');
  overlay.classList.add('show');
  
  // Update user info in overflow menu
  updateOverflowMenuUserInfo();
  updateOverflowMenuCounts();
}

function closeOverflowMenu() {
  const panel = document.getElementById('overflowMenuPanel');
  const overlay = document.getElementById('overflowMenuOverlay');
  
  panel.classList.remove('show');
  overlay.classList.remove('show');
}

function updateOverflowMenuUserInfo() {
  const userName = document.getElementById('overflowUserName');
  const userPhone = document.getElementById('overflowUserPhone');
  const editBtn = document.getElementById('overflowEditBtn');
  const logoutSection = document.getElementById('overflowLogoutSection');
  
  if (currentUser) {
    userName.textContent = currentUser.name;
    userPhone.textContent = currentUser.phone;
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = () => showEditProfile();
    logoutSection.style.display = 'block';
  } else {
    userName.textContent = 'Guest User';
    userPhone.textContent = 'Not logged in';
    editBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i>';
    editBtn.onclick = () => { showLogin(); closeOverflowMenu(); };
    logoutSection.style.display = 'none';
  }
}

function updateOverflowMenuCounts() {
  const coinsEl = document.getElementById('overflowCoins');
  const wishlistEl = document.getElementById('overflowWishlist');
  
  if (coinsEl) coinsEl.textContent = userCoins;
  if (wishlistEl) wishlistEl.textContent = wishlist.length;
}

function showEditProfile() {
  closeOverflowMenu();
  
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;text-align:center;max-width:400px;width:90%;" onclick="event.stopPropagation()">
        <h3 style="color:var(--primary-color);margin-bottom:20px;"><i class="fas fa-user-edit"></i> Edit Profile</h3>
        <div style="margin:15px 0;text-align:left;">
          <label style="display:block;margin-bottom:5px;font-weight:600;">Name:</label>
          <input type="text" id="editName" value="${currentUser.name}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;margin-bottom:15px;">
          <label style="display:block;margin-bottom:5px;font-weight:600;">Phone:</label>
          <input type="tel" id="editPhone" value="${currentUser.phone}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;">
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
          <button onclick="saveProfileChanges()" style="background:var(--primary-color);color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Save Changes</button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:#ccc;color:black;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Cancel</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function saveProfileChanges() {
  const name = document.getElementById('editName').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  
  if (!name || !phone) {
    alert('Please fill all fields');
    return;
  }
  
  currentUser.name = name;
  currentUser.phone = phone;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Update UI
  document.getElementById('userName').textContent = name;
  
  // Close modal
  document.querySelector('[style*="position:fixed"]').remove();
  
  alert('Profile updated successfully!');
}

function showPaymentMethods() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;max-width:400px;width:90%;" onclick="event.stopPropagation()">
        <h3 style="color:var(--primary-color);margin-bottom:20px;"><i class="fas fa-credit-card"></i> Payment Methods</h3>
        <div style="text-align:left;">
          <div style="padding:15px;border:1px solid #ddd;border-radius:8px;margin:10px 0;">
            <div style="display:flex;align-items:center;gap:10px;">
              <i class="fas fa-money-bill-wave" style="color:var(--primary-color);"></i>
              <div>
                <div style="font-weight:600;">Cash on Delivery</div>
                <div style="font-size:12px;color:#666;">Pay when your order arrives</div>
              </div>
            </div>
          </div>
          <div style="padding:15px;border:1px solid #ddd;border-radius:8px;margin:10px 0;">
            <div style="display:flex;align-items:center;gap:10px;">
              <i class="fas fa-credit-card" style="color:var(--primary-color);"></i>
              <div>
                <div style="font-weight:600;">Online Payment</div>
                <div style="font-size:12px;color:#666;">UPI, Cards, Net Banking, Wallets</div>
              </div>
            </div>
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background:var(--primary-color);color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;margin-top:15px;width:100%;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function showSettings() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;max-width:400px;width:90%;" onclick="event.stopPropagation()">
        <h3 style="color:var(--primary-color);margin-bottom:20px;"><i class="fas fa-cog"></i> Settings</h3>
        <div style="text-align:left;">
          <div class="setting-item" style="padding:15px 0;border-bottom:1px solid #f0f0f0;cursor:pointer;" onclick="showColorCustomizer(); this.parentElement.parentElement.parentElement.remove();">
            <div style="display:flex;align-items:center;gap:15px;">
              <i class="fas fa-palette" style="color:var(--primary-color);width:20px;"></i>
              <div>
                <div style="font-weight:600;">Theme Colors</div>
                <div style="font-size:12px;color:#666;">Customize app appearance</div>
              </div>
            </div>
          </div>
          <div class="setting-item" style="padding:15px 0;border-bottom:1px solid #f0f0f0;cursor:pointer;" onclick="toggleNotifications()">
            <div style="display:flex;align-items:center;gap:15px;">
              <i class="fas fa-bell" style="color:var(--primary-color);width:20px;"></i>
              <div>
                <div style="font-weight:600;">Notifications</div>
                <div style="font-size:12px;color:#666;">Order updates & offers</div>
              </div>
            </div>
          </div>
          <div class="setting-item" style="padding:15px 0;cursor:pointer;" onclick="showAbout()">
            <div style="display:flex;align-items:center;gap:15px;">
              <i class="fas fa-info-circle" style="color:var(--primary-color);width:20px;"></i>
              <div>
                <div style="font-weight:600;">About App</div>
                <div style="font-size:12px;color:#666;">Version & information</div>
              </div>
            </div>
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background:var(--primary-color);color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;margin-top:15px;width:100%;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function showAddressBook() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;max-width:500px;width:90%;max-height:70vh;overflow-y:auto;" onclick="event.stopPropagation()">
        <h3 style="color:var(--primary-color);margin-bottom:20px;"><i class="fas fa-map-marker-alt"></i> Address Book</h3>
        <div style="text-align:left;">
          <div style="padding:15px;border:1px solid #ddd;border-radius:8px;margin:10px 0;">
            <div style="font-weight:600;margin-bottom:5px;">Current Delivery Address</div>
            <div style="color:#666;font-size:14px;">${document.getElementById('deliveryAddress')?.value || 'No address set'}</div>
          </div>
          <button onclick="getCurrentLocation(); this.parentElement.parentElement.parentElement.remove();" style="background:var(--primary-color);color:white;border:none;padding:10px 15px;border-radius:5px;cursor:pointer;margin:5px;">
            <i class="fas fa-crosshairs"></i> Use Current Location
          </button>
          <button onclick="addNewAddress()" style="background:#2196F3;color:white;border:none;padding:10px 15px;border-radius:5px;cursor:pointer;margin:5px;">
            <i class="fas fa-plus"></i> Add New Address
          </button>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background:#ccc;color:black;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;margin-top:15px;width:100%;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function addNewAddress() {
  const address = prompt('Enter new delivery address:');
  if (address) {
    document.getElementById('deliveryAddress').value = address;
    calculateDelivery();
    alert('Address added successfully!');
  }
}

function toggleNotifications() {
  const enabled = localStorage.getItem('notificationsEnabled') !== 'false';
  localStorage.setItem('notificationsEnabled', (!enabled).toString());
  alert(enabled ? 'Notifications disabled' : 'Notifications enabled');
}

function showAbout() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;max-width:400px;width:90%;text-align:center;" onclick="event.stopPropagation()">
        <h3 style="color:var(--primary-color);margin-bottom:20px;"><i class="fas fa-pills"></i> Shah Pharmacy & Mini Mart</h3>
        <div style="text-align:left;margin:20px 0;">
          <p><strong>Version:</strong> 2.0.0</p>
          <p><strong>Location:</strong> Khalilabad, Sant Kabir Nagar</p>
          <p><strong>Contact:</strong> 9792997667 | 7905190933</p>
          <p><strong>Services:</strong> Medicine & Grocery Delivery</p>
          <p><strong>Delivery Hours:</strong> 8 AM - 9 PM</p>
        </div>
        <div style="background:var(--light-color);padding:15px;border-radius:8px;margin:15px 0;">
          <p style="margin:0;font-size:14px;color:var(--primary-color);font-weight:600;">Developed by LaxRani AI Labs</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background:var(--primary-color);color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;width:100%;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

/* ===============================
   USER AUTHENTICATION SYSTEM
================================*/
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
let userCoins = parseInt(localStorage.getItem('userCoins')) || 0;
let coinsUsed = 0;
let activeDiscount = JSON.parse(localStorage.getItem('activeDiscount')) || null;
let autoDiscount = null;
let discountAmount = 0;
let autoDiscountAmount = 0;

function initializeUser() {
  if (currentUser) {
    showUserProfile();
    updateUserStats();
    updateCoinsDisplay();
    checkActiveDiscount();
  }
}

function showLogin() {
  const loginModal = document.createElement('div');
  loginModal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;text-align:center;max-width:400px;width:90%;" onclick="event.stopPropagation()">
        <h3 style="color:#00B761;margin-bottom:20px;"><i class="fas fa-user"></i> Login with OTP</h3>
        
        <!-- Login Type Selection -->
        <div style="margin:15px 0;">
          <div style="display:flex;gap:10px;margin-bottom:15px;">
            <button id="phoneLoginBtn" onclick="selectLoginType('phone')" style="flex:1;padding:10px;border:2px solid #00B761;background:#00B761;color:white;border-radius:5px;cursor:pointer;">📱 Phone</button>
            <button id="emailLoginBtn" onclick="selectLoginType('email')" style="flex:1;padding:10px;border:2px solid #ddd;background:white;color:#666;border-radius:5px;cursor:pointer;">📧 Email</button>
          </div>
          
          <input type="text" id="loginName" placeholder="Your Name" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;margin:5px 0;">
          <input type="text" id="loginContact" placeholder="Phone Number" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;margin:5px 0;">
          
          <div id="otpSection" style="display:none;margin:10px 0;">
            <input type="text" id="otpInput" placeholder="Enter OTP" maxlength="6" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;margin:5px 0;">
            <div id="otpDisplay" style="background:#e8f5e8;padding:10px;border-radius:5px;margin:5px 0;display:none;">
              <strong>Your OTP: <span id="otpCode"></span></strong>
            </div>
          </div>
        </div>
        
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
          <button id="sendOtpBtn" onclick="sendOTP()" style="background:#00B761;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Send OTP</button>
          <button id="verifyOtpBtn" onclick="verifyOTP()" style="background:#2196F3;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;display:none;">Verify & Login</button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:#ccc;color:black;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Cancel</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(loginModal);
  
  // Set default login type
  window.currentLoginType = 'phone';
}

function selectLoginType(type) {
  window.currentLoginType = type;
  const phoneBtn = document.getElementById('phoneLoginBtn');
  const emailBtn = document.getElementById('emailLoginBtn');
  const contactInput = document.getElementById('loginContact');
  
  if (type === 'phone') {
    phoneBtn.style.background = '#00B761';
    phoneBtn.style.color = 'white';
    emailBtn.style.background = 'white';
    emailBtn.style.color = '#666';
    contactInput.placeholder = 'Phone Number';
    contactInput.type = 'tel';
  } else {
    emailBtn.style.background = '#00B761';
    emailBtn.style.color = 'white';
    phoneBtn.style.background = 'white';
    phoneBtn.style.color = '#666';
    contactInput.placeholder = 'Email Address';
    contactInput.type = 'email';
  }
}

function sendOTP() {
  const name = document.getElementById('loginName').value.trim();
  const contact = document.getElementById('loginContact').value.trim();
  
  if (!name || !contact) {
    alert('Please enter both name and contact');
    return;
  }
  
  if (window.currentLoginType === 'phone' && contact.length < 10) {
    alert('Please enter a valid phone number');
    return;
  }
  
  if (window.currentLoginType === 'email' && !contact.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }
  
  // For local testing - simulate OTP
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Local testing mode
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    localStorage.setItem('testOTP_' + contact, otp);
    
    document.getElementById('otpSection').style.display = 'block';
    document.getElementById('sendOtpBtn').style.display = 'none';
    document.getElementById('verifyOtpBtn').style.display = 'inline-block';
    
    // Always show OTP for local testing
    document.getElementById('otpDisplay').style.display = 'block';
    document.getElementById('otpCode').textContent = otp;
    
    alert('OTP sent! (Local testing mode)');
    return;
  }
  
  // Production mode - send to backend
  const apiUrl = `${API_BASE_URL}/auth/send-otp`;
 
  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contact: contact, 
      type: window.currentLoginType 
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      document.getElementById('otpSection').style.display = 'block';
      document.getElementById('sendOtpBtn').style.display = 'none';
      document.getElementById('verifyOtpBtn').style.display = 'inline-block';
      
      // Show OTP directly for phone (simple approach)
      if (data.showOTP && data.otp) {
        document.getElementById('otpDisplay').style.display = 'block';
        document.getElementById('otpCode').textContent = data.otp;
      }
      
      alert(data.message);
    } else {
      alert(data.error || 'Failed to send OTP');
    }
  })
  .catch(error => {
    console.error('API Error:', error);
    alert('Network error. Please check if backend server is running.');
  });
}

function verifyOTP() {
  const contact = document.getElementById('loginContact').value.trim();
  const otp = document.getElementById('otpInput').value.trim();
  const name = document.getElementById('loginName').value.trim();
  
  if (!otp) {
    alert('Please enter OTP');
    return;
  }
  
  // For local testing
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const storedOTP = localStorage.getItem('testOTP_' + contact);
    
    if (otp === storedOTP) {
      // Login successful
      currentUser = {
        id: Date.now(),
        name: name,
        phone: window.currentLoginType === 'phone' ? contact : null,
        email: window.currentLoginType === 'email' ? contact : null,
        coins: 0,
        loginDate: new Date().toISOString()
      };
      
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.removeItem('testOTP_' + contact);
      
      // Update UI
      document.getElementById('loginBtn').style.display = 'none';
      document.getElementById('userProfile').style.display = 'flex';
      document.getElementById('userName').textContent = currentUser.name;
      
      // Update coins
      userCoins = currentUser.coins;
      updateCoinsDisplay();
      
      // Close modal
      document.querySelector('[style*="position:fixed"]').remove();
      
      alert(`Welcome ${currentUser.name}! You are now logged in. (Local testing mode)`);
    } else {
      alert('Invalid OTP');
    }
    return;
  }
  
  // Production mode - verify with backend
    const apiUrl = `${API_BASE_URL}/auth/verify-otp`;
  
  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contact: contact, 
      otp: otp 
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Login successful
      currentUser = {
        id: data.user.id,
        name: data.user.name || name,
        phone: data.user.phone,
        email: data.user.email,
        coins: data.user.coins || 0,
        loginDate: new Date().toISOString()
      };
      
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update UI
      document.getElementById('loginBtn').style.display = 'none';
      document.getElementById('userProfile').style.display = 'flex';
      document.getElementById('userName').textContent = currentUser.name;
      
      // Update coins
      userCoins = currentUser.coins;
      updateCoinsDisplay();
      
      // Close modal
      document.querySelector('[style*="position:fixed"]').remove();
      
      alert(`Welcome ${currentUser.name}! You are now logged in.`);
    } else {
      alert(data.error || 'Invalid OTP');
    }
  })
  .catch(error => {
    console.error('API Error:', error);
    alert('Network error. Please check if backend server is running.');
  });
}

function toggleUserMenu() {
  // Redirect to overflow menu
  toggleOverflowMenu();
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  
  // Update UI
  document.getElementById('loginBtn').style.display = 'flex';
  document.getElementById('userProfile').style.display = 'none';
  
  // Close modal
  document.querySelector('[style*="position:fixed"]').remove();
  
  alert('You have been logged out successfully.');
}

function showUserProfile() {
  if (currentUser) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('userProfile').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.name;
  }
}

function updateUserStats() {
  // Award coins for orders (1 coin per ₹100 spent)
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  let totalSpent = 0;
  orders.forEach(order => {
    totalSpent += order.total;
  });
  
  const earnedCoins = Math.floor(totalSpent / 100);
  if (earnedCoins > userCoins) {
    userCoins = earnedCoins;
    localStorage.setItem('userCoins', userCoins.toString());
  }
}

function updateCoinsDisplay() {
  const coinsEl = document.getElementById('userCoins');
  if (coinsEl) coinsEl.textContent = userCoins;
}

function toggleCoins() {
  if (userCoins === 0) {
    alert('You have no coins to use. Earn coins by placing orders!');
    return;
  }
  
  const maxCoinsToUse = Math.min(userCoins, Math.floor(Number(document.getElementById('cartSubtotal').innerText) / 100));
  
  if (maxCoinsToUse === 0) {
    alert('Cart total too low to use coins. Minimum ₹100 required.');
    return;
  }
  
  const coinsModal = document.createElement('div');
  coinsModal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;text-align:center;max-width:400px;width:90%;" onclick="event.stopPropagation()">
        <h3 style="color:#00B761;margin-bottom:20px;"><i class="fas fa-coins"></i> Use Coins</h3>
        <p>Available Coins: <strong>${userCoins}</strong></p>
        <p>Max Coins You Can Use: <strong>${maxCoinsToUse}</strong></p>
        <p style="font-size:12px;color:#666;">1 Coin = ₹100 discount</p>
        <div style="margin:15px 0;">
          <input type="range" id="coinsSlider" min="0" max="${maxCoinsToUse}" value="${coinsUsed}" style="width:100%;" oninput="updateCoinsPreview()">
          <p>Using: <span id="coinsPreview">${coinsUsed}</span> coins (₹<span id="discountPreview">${coinsUsed * 100}</span> discount)</p>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
          <button onclick="applyCoins()" style="background:#00B761;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Apply</button>
          <button onclick="this.parentElement.parentElement.remove()" style="background:#ccc;color:black;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Cancel</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(coinsModal);
}

function updateCoinsPreview() {
  const slider = document.getElementById('coinsSlider');
  const preview = document.getElementById('coinsPreview');
  const discountPreview = document.getElementById('discountPreview');
  
  if (slider && preview && discountPreview) {
    preview.textContent = slider.value;
    discountPreview.textContent = slider.value * 100;
  }
}

function applyCoins() {
  const slider = document.getElementById('coinsSlider');
  coinsUsed = parseInt(slider.value);
  
  // Close modal
  document.querySelector('[style*="position:fixed"]').remove();
  
  // Update cart display
  updateCart();
  
  if (coinsUsed > 0) {
    alert(`Applied ${coinsUsed} coins for ₹${coinsUsed * 100} discount!`);
  }
}

function checkActiveDiscount() {
  // Discount checking
}

/* ===============================
   SEARCH
================================*/
function searchProducts() {
  const q = document.getElementById("searchBox").value.toLowerCase();
  const list = document.getElementById("productList");
  
  if (q.trim() === '') {
    renderProducts();
    return;
  }
  
  list.innerHTML = "";

  products.filter(p => p.name.toLowerCase().includes(q)).forEach(p => {
    if (!quantityMap[p.id]) quantityMap[p.id] = 1;
    
    const category = categories.find(c => c.id === p.categoryId);
    const categoryIcon = category ? category.icon : '📦';

    list.innerHTML += `
      <div class="product-card">
        <div class="product-image">
          ${p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
          <div class="product-emoji" ${p.image ? 'style="display:none;"' : ''}>${categoryIcon}</div>
        </div>
        <div class="product-info">
          <h4>${p.name}</h4>
          <div class="product-weight">${p.weight || 'N/A'}</div>
          <div class="product-price">₹${p.price}</div>
          ${p.stock <= 10 ? '<div class="low-stock-warning">⚠️ Limited Stock!</div>' : ''}
        </div>
        <div class="quantity-controls">
          <div class="qty-selector">
            <button class="qty-btn" onclick="changeQty(${p.id}, -1)">-</button>
            <span class="qty-display" id="qty-${p.id}">${quantityMap[p.id]}</span>
            <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
          </div>
        </div>
        <button class="add-to-cart" onclick="addToCart(${p.id})">
          <i class="fas fa-plus"></i> Add to Cart
        </button>
      </div>
    `;
  });
}

/* ===============================
   PAYMENT SYSTEM
================================*/


function placeOrder() {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const subtotal = Number(document.getElementById("cartSubtotal").innerText);
  const deliveryAddress = document.getElementById('deliveryAddress').value;
  
  if (!deliveryAddress) {
    alert("Please provide delivery address");
    return;
  }

  if (subtotal < MIN_ORDER_AMOUNT) {
    alert(`Minimum order ₹${MIN_ORDER_AMOUNT} required for delivery`);
    return;
  }

  if (deliveryCharge === -1) {
    alert("Delivery not available to this location");
    return;
  }

  // Check if order is for next day
  const now = new Date();
  const currentHour = now.getHours();
  const isNextDayOrder = currentHour >= 21 || currentHour < 8; // After 9 PM or before 8 AM
  
  let deliveryDate = new Date();
  if (isNextDayOrder) {
    deliveryDate.setDate(deliveryDate.getDate() + 1); // Next day
    
    // Show confirmation for next day delivery
    const confirmNextDay = confirm(
      `🕘 Order placed outside delivery hours (8 AM - 9 PM)\n\n` +
      `✅ Your order will be processed for NEXT DAY delivery\n` +
      `📅 Delivery Date: ${deliveryDate.toLocaleDateString()}\n\n` +
      `Continue with payment?`
    );
    
    if (!confirmNextDay) return;
  }

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const actualDeliveryCharge = deliveryCharge === -1 ? 0 : deliveryCharge;
  const total = subtotal + actualDeliveryCharge;
  
  const order = {
    id: Date.now(),
    date: new Date().toISOString(),
    deliveryDate: deliveryDate.toISOString(),
    isNextDayOrder: isNextDayOrder,
    items: [...cart],
    subtotal: subtotal,
    deliveryCharge: actualDeliveryCharge,
    total: total,
    deliveryAddress: deliveryAddress,
    paymentMethod: paymentMethod,
    status: isNextDayOrder ? 'Next Day Delivery' : 'Placed'
  };
  
  if (paymentMethod === 'razorpay') {
    initiateRazorpayPayment(order);
  } else {
    processOrder(order);
  }
}

function initiateRazorpayPayment(order) {
  if (!FEATURES.enableRazorpayPayment) {
    alert('Online payment is currently unavailable. Please use Cash on Delivery.');
    return;
  }
  
  const options = {
    key: RAZORPAY_CONFIG.key,
    amount: order.total * 100,
    currency: RAZORPAY_CONFIG.currency,
    name: RAZORPAY_CONFIG.name,
    description: `Order #${order.id}`,
    handler: function(response) {
      order.paymentId = response.razorpay_payment_id;
      order.status = order.isNextDayOrder ? 'Next Day Delivery - Paid' : 'Paid';
      processOrder(order);
    },
    prefill: {
      name: currentUser ? currentUser.name : 'Customer',
      contact: currentUser ? currentUser.phone : BUSINESS_CONFIG.phone1
    },
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true
    },
    theme: RAZORPAY_CONFIG.theme,
    modal: {
      ondismiss: function() {
        alert('Payment cancelled. You can try again or use Cash on Delivery.');
      }
    }
  };
  
  try {
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      alert(`Payment failed. Please try again or use Cash on Delivery.`);
    });
    rzp.open();
  } catch (error) {
    alert('Payment gateway error. Please try Cash on Delivery.');
  }
}

function processOrder(order) {
  // Save order
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Generate invoice
  generateInvoice(order);
  
  // Award coins (1 coin per ₹100 spent)
  const coinsEarned = Math.floor(order.total / 100);
  if (coinsEarned > 0) {
    userCoins += coinsEarned;
    localStorage.setItem('userCoins', userCoins.toString());
    updateCoinsDisplay();
  }
  
  // Deduct used coins from user balance
  if (coinsUsed > 0) {
    userCoins -= coinsUsed;
    localStorage.setItem('userCoins', userCoins.toString());
    coinsUsed = 0;
    updateCoinsDisplay();
  }
  
  // Send notification
  sendOrderNotification(order);
  
  // Clear cart
  cart = [];
  updateCart();
  toggleCart();
  
  // Show success message
  const paymentText = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
    order.paymentMethod === 'razorpay' ? `Online Payment (ID: ${order.paymentId || 'Processing'})` : 'Unknown';
  
  let successMessage = `Order placed successfully!\nOrder ID: ${order.id}\nTotal: ₹${order.total}\nPayment: ${paymentText}`;
  
  if (order.isNextDayOrder) {
    const deliveryDate = new Date(order.deliveryDate).toLocaleDateString();
    successMessage += `\n\n📅 NEXT DAY DELIVERY\nDelivery Date: ${deliveryDate}\n⏰ Will be processed tomorrow morning`;
  } else {
    successMessage += `\nDelivery Address: ${order.deliveryAddress}`;
  }
  
  if (coinsEarned > 0) {
    successMessage += `\n\n🎉 You earned ${coinsEarned} coins!`;
  }
  
  alert(successMessage);
}

/* ===============================
   THEME & OTHER FUNCTIONS
================================*/
function loadUserTheme() {
  // Theme loading
}

/* ===============================
   DYNAMIC CATEGORY SYSTEM
================================*/
function loadCategories() {
  const container = document.getElementById('categoryContainer');
  if (!container) return;
  
  // Load categories from localStorage (updated by admin)
  const adminCategories = JSON.parse(localStorage.getItem('categories')) || [];
  
  // If admin categories exist, use them; otherwise use default
  if (adminCategories.length > 0) {
    categories = adminCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: getDefaultIcon(cat.name),
      active: true,
      subcategories: cat.subcategories ? cat.subcategories.map(sub => ({
        id: sub.id || Date.now() + Math.random(),
        name: sub,
        parentId: cat.id
      })) : []
    }));
  }
  
  container.innerHTML = '';
  
  categories.filter(cat => cat.active).forEach((cat, index) => {
    const isActive = cat.id === currentCategoryId ? 'active' : '';
    container.innerHTML += `
      <div class="category-item ${isActive}" onclick="setCategory(${cat.id})">
        <div class="category-icon">${cat.icon}</div>
        <span>${cat.name}</span>
      </div>
    `;
  });
}

function getDefaultIcon(categoryName) {
  const iconMap = {
    'Medicine': '💊',
    'Grocery': '🛒', 
    'Personal Care': '🧴',
    'Bulk': '📦',
    'Electronics': '📱',
    'Books': '📚',
    'Clothing': '👕',
    'Home & Garden': '🏠',
    'Sports': '⚽',
    'Toys': '🧸'
  };
  return iconMap[categoryName] || '📦';
}

function setCategory(categoryId) {
  currentCategoryId = categoryId;
  currentSubcategoryId = null;
  
  // Update active category
  document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
  if (event && event.target) {
    event.target.closest('.category-item').classList.add('active');
  }
  
  loadSubcategories(categoryId);
  renderProducts();
}

function loadSubcategories(categoryId) {
  const category = categories.find(cat => cat.id === categoryId);
  const container = document.getElementById('subcategoryContainer');
  
  if (!category || !category.subcategories || category.subcategories.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  container.innerHTML = `
    <div class="subcategory-scroll">
      <div class="subcategory-item active" onclick="setSubcategory(null)">
        <span>All ${category.name}</span>
      </div>
      ${category.subcategories.map(sub => `
        <div class="subcategory-item" onclick="setSubcategory(${sub.id})">
          <span>${typeof sub === 'string' ? sub : sub.name}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function setSubcategory(subcategoryId) {
  currentSubcategoryId = subcategoryId;
  currentPage = 1; // Reset to first page
  
  // Update active subcategory
  document.querySelectorAll('.subcategory-item').forEach(item => item.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  renderProducts();
}

/* ===============================
   QR CODE SYSTEM
================================*/
function showQRCodes() {
  const qrModal = document.createElement('div');
  qrModal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
      <div style="background:white;padding:30px;border-radius:15px;text-align:center;max-width:400px;" onclick="event.stopPropagation()">
        <h3 style="color:#00B761;margin-bottom:20px;"><i class="fas fa-qrcode"></i> QR Codes</h3>
        <div style="margin:20px 0;">
          <h4>Website QR Code</h4>
          <div style="width:200px;height:200px;background:#f0f0f0;margin:10px auto;display:flex;align-items:center;justify-content:center;border-radius:10px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}" alt="Website QR" style="max-width:100%;max-height:100%;">
          </div>
          <p style="font-size:12px;color:#666;margin:10px 0;">Scan to visit our website</p>
        </div>
        <div style="margin:20px 0;">
          <h4>Download Mobile App</h4>
          <div style="width:200px;height:200px;background:#f0f0f0;margin:10px auto;display:flex;align-items:center;justify-content:center;border-radius:10px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://play.google.com/store/apps/details?id=com.shahpharmacy.app')}" alt="Play Store QR" style="max-width:100%;max-height:100%;">
          </div>
          <p style="font-size:12px;color:#666;margin:10px 0;">Scan to download from Play Store</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background:#00B761;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;margin-top:15px;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(qrModal);
}
/* ===============================
   DELIVERY HOURS CHECK
================================*/
function checkDeliveryHours() {
  const now = new Date();
  const currentHour = now.getHours();
  const isDeliveryTime = currentHour >= 8 && currentHour < 21; // 8 AM to 9 PM
  const isNextDayOrderTime = currentHour >= 21 || currentHour < 8; // After 9 PM or before 8 AM
  
  const deliveryHoursElement = document.getElementById('deliveryHours');
  const checkoutBtn = document.querySelector('.checkout-btn');
  const deliveryNotice = document.getElementById('deliveryNotice');
  
  if (isDeliveryTime) {
    // Normal delivery hours
    deliveryHoursElement.innerHTML = `<i class="fas fa-clock"></i> Delivery: 8 AM - 9 PM (Open Now)`;
    deliveryHoursElement.style.color = '#27ae60';
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = '<i class="fas fa-shopping-bag"></i> Place Order';
    }
    if (deliveryNotice) deliveryNotice.style.display = 'none';
  } else if (isNextDayOrderTime) {
    // Next day order time
    deliveryHoursElement.innerHTML = `<i class="fas fa-clock"></i> Next Day Orders Available (Current: ${currentHour}:00)`;
    deliveryHoursElement.style.color = '#f39c12';
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> Order for Tomorrow';
    }
    if (deliveryNotice) {
      deliveryNotice.innerHTML = '<i class="fas fa-info-circle"></i> Orders placed now will be delivered tomorrow';
      deliveryNotice.style.display = 'block';
      deliveryNotice.style.background = '#fff3cd';
      deliveryNotice.style.color = '#856404';
      deliveryNotice.style.borderColor = '#ffeaa7';
    }
  }
  
  return isDeliveryTime || isNextDayOrderTime;
}

/* ===============================
   BUSINESS FEATURES
================================*/
function generateInvoice(order) {
  const invoice = {
    id: `INV-${order.id}`,
    orderId: order.id,
    date: new Date().toISOString(),
    customerName: currentUser ? currentUser.name : 'Customer',
    customerPhone: currentUser ? currentUser.phone : '',
    items: order.items,
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge,
    total: order.total,
    paymentMethod: order.paymentMethod
  };
  
  let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
  invoices.push(invoice);
  localStorage.setItem('invoices', JSON.stringify(invoices));
}

function downloadInvoice(orderId) {
  const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
  const invoice = invoices.find(inv => inv.orderId.toString() === orderId.toString());
  
  if (!invoice) {
    alert('Invoice not found');
    return;
  }
  
  const invoiceHTML = `
    <html>
    <head><title>Invoice ${invoice.id}</title></head>
    <body style="font-family:Arial;padding:20px;">
      <h2>Shah Pharmacy & Mini Mart</h2>
      <p>Invoice: ${invoice.id}</p>
      <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
      <p>Customer: ${invoice.customerName}</p>
      <hr>
      <table style="width:100%;border-collapse:collapse;">
        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${invoice.items.map(item => `
          <tr><td>${item.name}</td><td>${item.qty}</td><td>₹${item.price}</td><td>₹${item.price * item.qty}</td></tr>
        `).join('')}
      </table>
      <hr>
      <p>Subtotal: ₹${invoice.subtotal}</p>
      <p>Delivery: ₹${invoice.deliveryCharge}</p>
      <p><strong>Total: ₹${invoice.total}</strong></p>
    </body>
    </html>
  `;
  
  const blob = new Blob([invoiceHTML], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${invoice.id}.html`;
  a.click();
}

function sendOrderNotification(order) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Order Confirmed!', {
      body: `Order #${order.id} for ₹${order.total} has been placed successfully.`,
      icon: '/favicon.ico'
    });
  }
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

/* ===============================
   TECHNICAL ENHANCEMENTS
================================*/
// SEO Meta Tags
function updateSEOTags() {
  document.title = 'Shah Pharmacy & Mini Mart - Online Medicine & Grocery Store';
  
  const metaTags = [
    {name: 'description', content: 'Order medicines and groceries online from Shah Pharmacy. Fast delivery in Khalilabad, Sant Kabir Nagar. Best prices guaranteed.'},
    {name: 'keywords', content: 'pharmacy, medicine, grocery, online, delivery, Khalilabad, Sant Kabir Nagar'},
    {property: 'og:title', content: 'Shah Pharmacy & Mini Mart'},
    {property: 'og:description', content: 'Your trusted online pharmacy and grocery store'},
    {property: 'og:type', content: 'website'}
  ];
  
  metaTags.forEach(tag => {
    let meta = document.querySelector(`meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      if (tag.name) meta.name = tag.name;
      if (tag.property) meta.property = tag.property;
      document.head.appendChild(meta);
    }
    meta.content = tag.content;
  });
}

// Performance Optimization
function optimizeImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.loading = 'lazy';
    img.onerror = function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    };
  });
}

// Analytics Integration
function trackEvent(eventName, data) {
  const event = {
    name: eventName,
    data: data,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  let analytics = JSON.parse(localStorage.getItem('analytics')) || [];
  analytics.push(event);
  
  // Keep only last 1000 events
  if (analytics.length > 1000) {
    analytics = analytics.slice(-1000);
  }
  
  localStorage.setItem('analytics', JSON.stringify(analytics));
}

// PWA Support
function initializePWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service Worker registration failed');
    });
  }
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
  updateSEOTags();
  optimizeImages();
  requestNotificationPermission();
  initializePWA();
  updateWishlistCount();
  
  // Track page view
  trackEvent('page_view', {page: 'home'});
  
  // Admin shortcut: Ctrl+Shift+A
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      showAdminLogin();
    }
  });
});



const API_BASE_URL = "https://shah-pharmacy-backend.onrender.com/api";

//====================================================
 //==USER SITE - LOAD PRODUCTS 
//===================================================

 async function loadUserProducts() {
  try {
    console.log("🟢 Loading products via pharmacyAPI...");

    const products = await window.pharmacyAPI.getProducts();

    const container = document.getElementById("productList");
    if (!container) {
      console.error("❌ productList not found");
      return;
    }

    container.innerHTML = "";

    products.forEach(p => {
      container.innerHTML += `
        <div class="product-card">
          <h4>${p.name}</h4>
          <p>₹${p.price}</p>
          <p>Stock: ${p.stock}</p>
          <p>Category: ${CATEGORY_MAP[p.category_id] || "N/A"}</p>
          <button>Add to Cart</button>
        </div>
      `;
    });

  } catch (err) {
    console.error("❌ Backend error", err);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  applyTheme();

  const productContainer = document.getElementById("productList");

  if (productContainer) {
    console.log("🟢 productList found, loading products...");
    loadUserProducts();
  } else {
    console.log("⚠️ productList not on this page, skipping product load");
  }
});


