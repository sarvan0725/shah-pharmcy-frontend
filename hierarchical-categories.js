/*************************************************
 HIERARCHICAL CATEGORY SYSTEM
 Shah Pharmacy & Mini Mart
*************************************************/

// API base from config.js
console.log("✅ hierarchical-categories.js loaded");

const API_BASE_URL =
 window.APP_CONFIG.API_BASE_URL;

//let products = [];   // ✅ GLOBAL PRODUCTS CACHE
//let quantityMap = {};
let cart = [];

//////////////////////////////////////////
let categoryTree = [];
let currentCategoryPath = []; // Breadcrumb path
let currentLevel = 1; // Current navigation level

// DOM Containers (FIX for "container is not defined")
const categoryContainer = document.getElementById("categoryContainer");
const breadcrumbContainer = document.getElementById("breadcrumbContainer");



/* ===============================
   LOAD HIERARCHICAL CATEGORIES
================================*/
async function loadHierarchicalCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/products/categories/tree`);
    if (response.ok) {
      categoryTree = await response.json();
      renderCategoryNavigation();
    } else {
      // Fallback to default categories
      initializeDefaultCategories();
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    initializeDefaultCategories();
  }
}

function initializeDefaultCategories() {
  categoryTree = [
    {
      id: 1,
      name: 'Healthcare',
      level: 1,
      icon: '💊',
      children: [
        {
          id: 11,
          name: 'Medicines',
          level: 2,
          parent_id: 1,
          children: [
            { id: 111, name: 'Pain Relief', level: 3, parent_id: 11 },
            { id: 112, name: 'Antibiotics', level: 3, parent_id: 11 },
            { id: 113, name: 'Fever & Cold', level: 3, parent_id: 11 },
            { id: 114, name: 'Diabetes Care', level: 3, parent_id: 11 }
          ]
        },
        {
          id: 12,
          name: 'Medical Devices',
          level: 2,
          parent_id: 1,
          children: []
        },
        {
          id: 13,
          name: 'Health Supplements',
          level: 2,
          parent_id: 1,
          children: []
        }
      ]
    },
    {
      id: 2,
      name: 'Groceries',
      level: 1,
      icon: '🛒',
      children: [
        {
          id: 21,
          name: 'Food Items',
          level: 2,
          parent_id: 2,
          children: [
            { id: 211, name: 'Rice & Grains', level: 3, parent_id: 21 },
            { id: 212, name: 'Cooking Oil', level: 3, parent_id: 21 },
            { id: 213, name: 'Spices', level: 3, parent_id: 21 }
          ]
        },
        {
          id: 22,
          name: 'Beverages',
          level: 2,
          parent_id: 2,
          children: []
        },
        {
          id: 23,
          name: 'Snacks',
          level: 2,
          parent_id: 2,
          children: []
        }
      ]
    },
    {
      id: 3,
      name: 'Personal Care',
      level: 1,
      icon: '🧴',
      children: [
        {
          id: 31,
          name: 'Skincare',
          level: 2,
          parent_id: 3,
          children: [
            { id: 311, name: 'Face Wash', level: 3, parent_id: 31 },
            { id: 312, name: 'Moisturizers', level: 3, parent_id: 31 },
            { id: 313, name: 'Sunscreen', level: 3, parent_id: 31 }
          ]
        },
        {
          id: 32,
          name: 'Hair Care',
          level: 2,
          parent_id: 3,
          children: []
        },
        {
          id: 33,
          name: 'Oral Care',
          level: 2,
          parent_id: 3,
          children: []
        }
      ]
    },
    {
      id: 4,
      name: 'Baby Care',
      level: 1,
      icon: '👶',
      children: [
        {
          id: 41,
          name: 'Baby Food',
          level: 2,
          parent_id: 4,
          children: []
        },
        {
          id: 42,
          name: 'Diapers',
          level: 2,
          parent_id: 4,
          children: []
        },
        {
          id: 43,
          name: 'Baby Health',
          level: 2,
          parent_id: 4,
          children: []
        }
      ]
    }
  ];
  renderCategoryNavigation();
}

/* ===============================
   RENDER CATEGORY NAVIGATION (CLEAN)
================================*/

function renderCategoryNavigation() {
  if (!categoryContainer) return;

  categoryContainer.innerHTML = "";
  if (breadcrumbContainer) breadcrumbContainer.innerHTML = "";

  // Breadcrumb
  if (currentCategoryPath.length > 0 && breadcrumbContainer) {
    breadcrumbContainer.innerHTML = `
      <span style="cursor:pointer;color:#0a7;" onclick="navigateToRoot()">
        All Categories
      </span>
      ${currentCategoryPath.map(c => " > " + c.name).join("")}
    `;
  }

  const categories =
    currentCategoryPath.length === 0
      ? categoryTree
      : currentCategoryPath[currentCategoryPath.length - 1].children || [];

  categories.forEach(category => {
    const div = document.createElement("div");
    div.className = "category-item";
    div.innerText = category.name;
    div.onclick = () => navigateToCategory(category);
    categoryContainer.appendChild(div);
  });
}

/* ===============================
   NAVIGATION
================================*/

function navigateToCategory(category) {
  if (category.children && category.children.length > 0) {
    currentCategoryPath.push(category);
    renderCategoryNavigation();
  } else {
    // leaf category → PRODUCTS
    if (window.loadProductsByCategory) {
      window.loadProductsByCategory(category.id);
    }
  }
}

function navigateToRoot() {
  currentCategoryPath = [];
  renderCategoryNavigation();

  if (window.loadAllProducts) {
    window.loadAllProducts();
  }
}

/* ===============================
   INIT
================================*/

document.addEventListener("DOMContentLoaded", () => {
  loadHierarchicalCategories();
});

window.navigateToRoot = navigateToRoot;
window.navigateToCategory = navigateToCategory;
