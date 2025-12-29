
console.log("admin.js loaded");

const API_BASE = "https://shah-pharmacy-backend.onrender.com/api";

// ===== ADD PRODUCT =====
async function addProduct() {
  console.log("🟢 addProduct clicked");

  const name = document.getElementById("pName")?.value;
  const price = Number(document.getElementById("pPrice")?.value);
  const stock = Number(document.getElementById("pStock")?.value);
  const category = document.getElementById("pCategory")?.value;

  if (!name || !price || !stock || !category) {
    alert("Fill all required fields");
    return;
  }

  // 🔥 BACKEND CATEGORY MAP
  const categoryMap = {
    grocery: 1,
    medicine: 2,
    personal: 3,
    bulk: 4
  };

  const payload = {
    name,
    price,
    stock,
    category_id: categoryMap[category]
  };

  console.log("📦 FINAL PAYLOAD:", payload);

  try {
    const res = await fetch(
      "https://shah-pharmacy-backend.onrender.com/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();
    console.log("✅ RESPONSE:", data);

    if (!res.ok) {
      alert(data.error || "Backend error");
      return;
    }

    alert("🎉 Product added successfully");
   loadProducts();
    
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

async function loadProducts() {
  try {
    const res = await fetch(
      "https://shah-pharmacy-backend.onrender.com/api/products"
    );
    const products = await res.json();

    const tbody = document.getElementById("productTableBody");
    if (!tbody) {
      console.error("❌ productTableBody not found");
      return;
    }

    tbody.innerHTML = "";

    products.forEach(p => {
      tbody.innerHTML += `
        <tr>
         <td>

  ${
    (p.image_url || p.image || p.imageUrl || p.secure_url)
      ? `<img src="${p.image_url || p.image || p.imageUrl || p.secure_url}" width="50"/>`
      : ""
  }
</td>
          <td>${p.name}</td>
          <td>${p.price}</td>
          <td>${p.stock}</td>
          <td>${p.category_name || ""}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("❌ Load products error:", err);
  }
}


// 🔴 MUST BE GLOBAL
window.addProduct = addProduct;
