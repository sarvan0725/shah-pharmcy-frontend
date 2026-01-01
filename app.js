/***************************************
 * PHASE 1 - STABLE APP.JS
 * Shah Pharmacy & Mini Mart
 * Single Source of Truth = localStorage
 ***************************************/

/* =========================
   GLOBAL STATE
========================= */

let categories = [];
let products = [];
let currentCategoryId = null;

/* =========================
   SAFE HELPERS
========================= */

function safeParse(key, fallback) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return data && Array.isArray(data) ? data : fallback;
  } catch {
    return fallback;
  }
}

/* =========================
   CATEGORY LOGIC (STABLE)
========================= */

function initCategories() {
  categories = safeParse("categories", []);

  if (categories.length === 0) {
    categories = [
      { id: 1, name: "Medicine", active: true },
      { id: 2, name: "Grocery", active: true },
      { id: 3, name: "Personal Care", active: true },
      { id: 4, name: "Bulk", active: true }
    ];
    localStorage.setItem("categories", JSON.stringify(categories));
    console.warn("🟡 Default categories initialized");
  }
}

function loadCategories() {
  const container = document.getElementById("categoryContainer");
  if (!container) return;

  container.innerHTML = "";

  categories.forEach(cat => {
    if (!cat.active) return;

    const div = document.createElement("div");
    div.className = "category-item";
    div.innerText = cat.name;
    div.onclick = () => setCategory(cat.id);
    container.appendChild(div);
  });
}

function setCategory(categoryId) {
  currentCategoryId = categoryId;
  renderProducts();
}

/* =========================
   PRODUCT LOGIC (STABLE)
========================= */

function initProducts() {
  products = safeParse("products", []);
  localStorage.setItem("products", JSON.stringify(products));
}

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function addProduct(product) {
  products.push(product);
  saveProducts();
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById("productContainer");
  if (!container) return;

  container.innerHTML = "";

  const filtered = currentCategoryId
    ? products.filter(p => p.categoryId === currentCategoryId)
    : products;

  if (filtered.length === 0) {
    container.innerHTML = "<p>No products available</p>";
    return;
  }

  filtered.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <h4>${p.name}</h4>
      <p>₹${p.price}</p>
    `;
    container.appendChild(div);
  });
}

/* =========================
   SAFE BUTTON FUNCTIONS
   (PREVENT JS CRASH)
========================= */

function showOrderHistory() {}
function showSettings() {}
function showPaymentMethods() {}
function showAddressBook() {}
function showCurrentLocation() {}
function showColorCustomizer() {}

/* =========================
   APP BOOTSTRAP (ONLY ONCE)
========================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Phase-1 App Loaded");

  initCategories();
  initProducts();

  loadCategories();
  renderProducts();
});


// products.store.js

const PRODUCT_KEY = "products";

export function getProducts() {
  return JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
}

export function saveProducts(products) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}

export function addProduct(product) {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}

export function deleteProduct(id) {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

function loadUserProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  const products = JSON.parse(localStorage.getItem("products")) || [];
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>No products available</p>";
    return;
  }

  products.forEach(p => {
    container.innerHTML += `
      <div class="product-card">
        <h4>${p.name}</h4>
        <p>₹${p.price}</p>
        <button onclick="addToCart(${p.id})">Add</button>
      </div>
    `;
  });
}

const ORDER_KEY = "orders";

function getOrders() {
  return JSON.parse(localStorage.getItem(ORDER_KEY)) || [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

function placeOrder(cartItems) {
  const orders = getOrders();

  const order = {
    id: Date.now(),
    items: cartItems,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  saveOrders(orders);

  alert("✅ Order placed");
}

window.placeOrder = placeOrder;


function loadAdminOrders() {
  const container = document.getElementById("ordersContainer");
  if (!container) return;

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "<p>No orders yet</p>";
    return;
  }

  orders.forEach(o => {
    container.innerHTML += `
      <div class="order-card">
        <h4>Order #${o.id}</h4>
        <p>Status: ${o.status}</p>
        <p>Items: ${o.items.length}</p>
      </div>
    `;
  });
}

window.loadAdminOrders = loadAdminOrders;
