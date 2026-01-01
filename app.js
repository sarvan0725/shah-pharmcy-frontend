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



document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 App Loaded");

  if (typeof loadUserProducts === "function") {
    console.log("📦 Loading products...");
    loadUserProducts();
  } else {
    console.error("❌ loadUserProducts not found");
  }
});
