
console.log("✅ admin.js loaded");

// ================= CONFIG =================
const API_BASE = "https://shah-pharmacy-backend.onrender.com/api";
let products = [];

// ================= ADD PRODUCT =================
async function addProduct() {
  console.log("🟢 addProduct clicked");

  const name = document.getElementById("pName")?.value;
  const weight = document.getElementById("pWeight")?.value;
  const price = Number(document.getElementById("pPrice")?.value);
  const stock = Number(document.getElementById("pStock")?.value);
  const category = document.getElementById("pCategory")?.value;

  if (!name || !price || !stock || !category) {
    alert("Fill all required fields");
    return;
  }

  const payload = { name, weight, price, stock, category };
  console.log("📦 SENDING TO BACKEND:", payload);

  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Backend error:", data);
      alert("Failed to add product");
      return;
    }

    alert("✅ Product added");
    loadProducts();

  } catch (err) {
    console.error("❌ Network error:", err);
    alert("Server error");
  }
}

// 🔥 REQUIRED FOR HTML onclick
window.addProduct = addProduct;

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  console.log("🔄 loading products");

  try {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    products = data;

    const table = document.getElementById("productTable");
    if (!table) return;

    table.innerHTML = "";

    products.forEach(p => {
      table.innerHTML += `
        <tr>
          <td>${p.name}</td>
          <td>${p.weight || "-"}</td>
          <td>₹${p.price}</td>
          <td>${p.stock}</td>
          <td>${p.category}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("❌ loadProducts failed:", err);
  }
}

// ================= AUTO LOAD =================
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM ready");

  if (window.location.pathname.includes("dashboard.html")) {
    loadProducts();
  }
});v
