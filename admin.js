
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
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

// 🔴 MUST BE GLOBAL
window.addProduct = addProduct;
