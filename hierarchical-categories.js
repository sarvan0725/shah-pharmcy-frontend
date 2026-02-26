/*************************************************
 HIERARCHICAL CATEGORY SYSTEM
 Shah Pharmacy & Mini Mart
*************************************************/

console.log("✅ hierarchical-categories.js loaded");

let categoryTree = [];
let currentCategoryPath = [];
let currentLevel = 1;

/* ===============================
   LOAD HIERARCHICAL CATEGORIES
================================*/
async function loadHierarchicalCategories() {
  try {
    const tree = await window.pharmacyAPI.request('/categories/tree');
    categoryTree = tree;
    console.log("🌳 Category Tree:", categoryTree);
    renderCategoryNavigation();
  } catch (error) {
    console.error('❌ Error loading categories:', error);
    initializeDefaultCategories();
  }
}

/* ===============================
   FALLBACK DATA (SAFE)
================================*/
function initializeDefaultCategories() {
  categoryTree = [
    { id: 1, name: 'Healthcare', level: 1, children: [] },
    { id: 2, name: 'Groceries', level: 1, children: [] },
    { id: 3, name: 'Personal Care', level: 1, children: [] },
    { id: 4, name: 'Baby Care', level: 1, children: [] }
  ];
  renderCategoryNavigation();
}

/* ===============================
   RENDER CATEGORY NAVIGATION
================================*/
function renderCategoryNavigation() {

  // ✅ सही container (categories-scroll के अंदर render होगा)
 const container = document.getElementById("categorySection");

  if (!container) {
    console.error("❌ #categorySection .categories-scroll not found");
    return;
  }

  // पहले साफ करो
  container.innerHTML = "";

  // categories दिखाओ
  const categoriesToShow = getCurrentCategories();

  categoriesToShow.forEach(category => {

    const el = document.createElement("div");
    el.className = "category-card";

    el.innerHTML = `
      <div class="category-icon">${getCategoryIcon(category.name)}</div>
      <div class="category-name">${category.name}</div>
    `;

    el.onclick = () => navigateToCategory(category);

    container.appendChild(el);
  });
}

/* ===============================
   CATEGORY HELPERS
================================*/
function getCurrentCategories() {
  if (currentCategoryPath.length === 0) {
    return categoryTree;
  }

  const current = currentCategoryPath[currentCategoryPath.length - 1];
  return current.children || [];
}

/* ===============================
   NAVIGATION
================================*/
function navigateToCategory(category) {

  console.log("✅ Category Clicked:", category);

  // अगर children हैं → अंदर जाओ
  if (category.children && category.children.length > 0) {

    currentCategoryPath.push(category);

    renderCategoryNavigation();

    return;
  }

  // अगर children नहीं हैं → यही final category है

  // अब products filter करो name से
  if (window.setCategory) {
    window.setCategory(category._id);
  } else {
    console.warn("⚠ setCategory() missing in app.js");
 }
}

function navigateToRoot() {
  currentCategoryPath = [];
  currentLevel = 1;
  currentCategoryId = null;
  renderCategoryNavigation();
  loadAllProducts();
}

/* ===============================
   PRODUCT LOADING (FIXED)
================================*/
async function loadProductsByCategory(categoryId) {
  try {
    console.log("🛒 Loading products for category:", categoryId);

    const products = await window.pharmacyAPI.request(
      `/products?category_id=${categoryId}`
    );

    displayProducts(products);
  } catch (err) {
    console.error("❌ Product load error:", err);
    displayProducts([]);
  }
}

async function loadAllProducts() {
  try {
    const products = await window.pharmacyAPI.getProducts();
    displayProducts(products);
  } catch (err) {
    console.error("❌ Load all products error:", err);
  }
}

/* ===============================
   PRODUCT UI
================================*/
function displayProducts(productList) {
  const container = document.getElementById('productList');
  if (!container) return;

  container.innerHTML = '';

  if (!productList || productList.length === 0) {
    container.innerHTML = `
      <div class="no-products">
        <h3>No products available</h3>
      </div>
    `;
    return;
  }

  productList.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <h4>${product.name}</h4>
      <p>₹${product.price}</p>
    `;
    container.appendChild(div);
  });
}

/* ===============================
   ICON MAP
================================*/
function getCategoryIcon(name) {
  const map = {
    'Healthcare': '💊',
    'Groceries': '🛒',
    'Personal Care': '🧴',
    'Baby Care': '👶',
    'Medicines': '💉',
    'Food Items': '🍚',
    'Skincare': '✨'
  };
  return map[name] || '📦';
}

/* ===============================
   INIT
================================*/
document.addEventListener('DOMContentLoaded', () => {
  loadHierarchicalCategories();
});

/* ===============================
   EXPORTS
================================*/
window.navigateToRoot = navigateToRoot;
window.loadProductsByCategory = loadProductsByCategory;
