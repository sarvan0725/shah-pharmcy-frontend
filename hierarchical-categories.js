/*************************************************
 HIERARCHICAL CATEGORY SYSTEM
 Shah Pharmacy & Mini Mart
*************************************************/

let categoryTree = [];
let currentCategoryPath = []; // Breadcrumb path
let currentLevel = 1; // Current navigation level
const API_BASE_URL = window.location.origin; // Use current domain

/* ===============================
   LOAD HIERARCHICAL CATEGORIES
================================*/
async function loadHierarchicalCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/categories/tree`);
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
   RENDER CATEGORY NAVIGATION
================================*/
function renderCategoryNavigation() {
  const container = document.getElementById('categoryContainer');
  if (!container) return;

  // Clear existing content
  container.innerHTML = '';

  // Render breadcrumb if we're not at root level
  if (currentCategoryPath.length > 0) {
    renderBreadcrumb();
  }

  // Get current categories to display
  const categoriesToShow = getCurrentCategories();
  
  // Render categories
  categoriesToShow.forEach(category => {
    const categoryElement = createCategoryElement(category);
    container.appendChild(categoryElement);
  });
}

function getCurrentCategories() {
  if (currentCategoryPath.length === 0) {
    // Show root level categories
    return categoryTree;
  } else {
    // Show children of current category
    const currentCategory = getCurrentCategory();
    return currentCategory ? currentCategory.children || [] : [];
  }
}

function getCurrentCategory() {
  if (currentCategoryPath.length === 0) return null;
  
  let current = categoryTree;
  for (const pathItem of currentCategoryPath) {
    current = current.find(cat => cat.id === pathItem.id);
    if (!current) return null;
    current = current.children || [];
  }
  return currentCategoryPath[currentCategoryPath.length - 1];
}

function createCategoryElement(category) {
  const element = document.createElement('div');
  element.className = 'category-item hierarchical';
  element.onclick = () => navigateToCategory(category);
  
  const hasChildren = category.children && category.children.length > 0;
  
  element.innerHTML = `
    <div class="category-icon">${category.icon || getCategoryIcon(category.name)}</div>
    <div class="category-content">
      <span class="category-name">${category.name}</span>
      ${hasChildren ? '<i class="fas fa-chevron-right category-arrow"></i>' : ''}
    </div>
    <div class="category-level-indicator">Level ${category.level}</div>
  `;
  
  return element;
}

function getCategoryIcon(categoryName) {
  const iconMap = {
    'Healthcare': '💊',
    'Medicines': '💉',
    'Medical Devices': '🩺',
    'Health Supplements': '💪',
    'Pain Relief': '🤕',
    'Antibiotics': '🦠',
    'Fever & Cold': '🤒',
    'Diabetes Care': '🩸',
    'Groceries': '🛒',
    'Food Items': '🍚',
    'Beverages': '🥤',
    'Snacks': '🍿',
    'Rice & Grains': '🌾',
    'Cooking Oil': '🫒',
    'Spices': '🌶️',
    'Personal Care': '🧴',
    'Skincare': '✨',
    'Hair Care': '💇',
    'Oral Care': '🦷',
    'Face Wash': '🧼',
    'Moisturizers': '🧴',
    'Sunscreen': '☀️',
    'Baby Care': '👶',
    'Baby Food': '🍼',
    'Diapers': '👶',
    'Baby Health': '🧸'
  };
  return iconMap[categoryName] || '📦';
}

/* ===============================
   BREADCRUMB NAVIGATION
================================*/
function renderBreadcrumb() {
  const container = document.getElementById('categoryContainer');
  
  const breadcrumbElement = document.createElement('div');
  breadcrumbElement.className = 'category-breadcrumb';
  
  let breadcrumbHTML = `
    <div class="breadcrumb-item" onclick="navigateToRoot()">
      <i class="fas fa-home"></i>
      <span>All Categories</span>
    </div>
  `;
  
  currentCategoryPath.forEach((pathItem, index) => {
    breadcrumbHTML += `
      <i class="fas fa-chevron-right breadcrumb-separator"></i>
      <div class="breadcrumb-item" onclick="navigateToBreadcrumb(${index})">
        <span>${pathItem.name}</span>
      </div>
    `;
  });
  
  breadcrumbElement.innerHTML = breadcrumbHTML;
  container.appendChild(breadcrumbElement);
}

/* ===============================
   NAVIGATION FUNCTIONS
================================*/
function navigateToCategory(category) {
  const hasChildren = category.children && category.children.length > 0;
  
  if (hasChildren) {
    // Navigate deeper into hierarchy
    currentCategoryPath.push(category);
    currentLevel = category.level + 1;
    renderCategoryNavigation();
  } else {
    // This is a leaf category - show products
    currentCategoryId = category.id;
    loadProductsByCategory(category.id);
    
    // Update UI to show selected category
    document.querySelectorAll('.category-item').forEach(item => {
      item.classList.remove('active');
    });
    event.target.closest('.category-item').classList.add('active');
  }
}

function navigateToRoot() {
  currentCategoryPath = [];
  currentLevel = 1;
  currentCategoryId = null;
  renderCategoryNavigation();
  loadAllProducts();
}

function navigateToBreadcrumb(index) {
  currentCategoryPath = currentCategoryPath.slice(0, index + 1);
  currentLevel = currentCategoryPath.length + 1;
  renderCategoryNavigation();
}

/* ===============================
   PRODUCT LOADING BY CATEGORY
================================*/
async function loadProductsByCategory(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products?category=${categoryId}`);
    if (response.ok) {
      const data = await response.json();
      displayProducts(data.products);
      updatePagination(data.pagination);
    } else {
      console.error('Failed to load products');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    // Fallback to local products
    const filteredProducts = products.filter(p => p.categoryId === categoryId);
    displayProducts(filteredProducts);
  }
}

async function loadAllProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (response.ok) {
      const data = await response.json();
      displayProducts(data.products);
      updatePagination(data.pagination);
    } else {
      console.error('Failed to load products');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    displayProducts(products);
  }
}

function displayProducts(productList) {
  const container = document.getElementById('productList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (productList.length === 0) {
    container.innerHTML = `
      <div class="no-products">
        <i class="fas fa-box-open"></i>
        <h3>No Products Found</h3>
        <p>No products available in this category yet.</p>
        <button onclick="navigateToRoot()" class="btn-primary">
          <i class="fas fa-arrow-left"></i> Back to Categories
        </button>
      </div>
    `;
    return;
  }
  
  productList.forEach(product => {
    const productElement = createProductElement(product);
    container.appendChild(productElement);
  });
}

function createProductElement(product) {
  const element = document.createElement('div');
  element.className = 'product-card';
  
  if (!quantityMap[product.id]) quantityMap[product.id] = 1;
  
  element.innerHTML = `
    <div class="product-image">
      ${product.image ? `<img src="${product.image}" alt="${product.name}">` : getCategoryIcon(product.category_name)}
    </div>
    <div class="product-info">
      <h4>${product.name}</h4>
      <div class="product-category">${product.category_name}</div>
      <div class="product-price">₹${product.price}</div>
      ${product.discount_price ? `<div class="product-discount">₹${product.discount_price}</div>` : ''}
      ${product.stock <= 10 ? '<div class="low-stock-warning">⚠️ Limited Stock!</div>' : ''}
    </div>
    <div class="quantity-controls">
      <div class="qty-selector">
        <button class="qty-btn" onclick="changeQty(${product.id}, -1)">-</button>
        <span class="qty-display" id="qty-${product.id}">${quantityMap[product.id]}</span>
        <button class="qty-btn" onclick="changeQty(${product.id}, 1)">+</button>
      </div>
    </div>
    <button class="add-to-cart" onclick="addToCart(${product.id})">
      <i class="fas fa-plus"></i> Add to Cart
    </button>
  `;
  
  return element;
}

/* ===============================
   SEARCH WITH HIERARCHY
================================*/
function searchProductsHierarchical() {
  const query = document.getElementById('searchBox').value.toLowerCase().trim();
  
  if (query === '') {
    if (currentCategoryPath.length === 0) {
      loadAllProducts();
    } else {
      const currentCategory = getCurrentCategory();
      loadProductsByCategory(currentCategory.id);
    }
    return;
  }
  
  // Search in current context
  searchInCurrentContext(query);
}

async function searchInCurrentContext(query) {
  try {
    let searchUrl = `${API_BASE_URL}/api/products?search=${encodeURIComponent(query)}`;
    
    // If we're in a specific category, search within that category
    if (currentCategoryPath.length > 0) {
      const currentCategory = getCurrentCategory();
      searchUrl += `&category=${currentCategory.id}`;
    }
    
    const response = await fetch(searchUrl);
    if (response.ok) {
      const data = await response.json();
      displayProducts(data.products);
      updatePagination(data.pagination);
    }
  } catch (error) {
    console.error('Search error:', error);
    // Fallback to local search
    const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(query) &&
      (currentCategoryId ? p.categoryId === currentCategoryId : true)
    );
    displayProducts(filteredProducts);
  }
}

/* ===============================
   CATEGORY PATH DISPLAY
================================*/
function updateCategoryPathDisplay() {
  const pathDisplay = document.getElementById('categoryPath');
  if (!pathDisplay) return;
  
  if (currentCategoryPath.length === 0) {
    pathDisplay.innerHTML = '<i class="fas fa-home"></i> All Categories';
    return;
  }
  
  let pathHTML = '<i class="fas fa-home"></i>';
  currentCategoryPath.forEach((pathItem, index) => {
    pathHTML += ` <i class="fas fa-chevron-right"></i> ${pathItem.name}`;
  });
  
  pathDisplay.innerHTML = pathHTML;
}

/* ===============================
   INITIALIZATION
================================*/
document.addEventListener('DOMContentLoaded', () => {
  // Replace the old category loading with hierarchical system
  loadHierarchicalCategories();
  
  // Update search function
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    searchBox.onkeyup = searchProductsHierarchical;
  }
});

// Export functions for global access
window.navigateToCategory = navigateToCategory;
window.navigateToRoot = navigateToRoot;
window.navigateToBreadcrumb = navigateToBreadcrumb;
window.searchProductsHierarchical = searchProductsHierarchical;
