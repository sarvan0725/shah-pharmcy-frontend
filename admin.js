
console.log("admin.js loaded");

const API_BASE = "https://shah-pharmacy-backend.onrender.com/api";

// ===== ADD PRODUCT =====
async function addProduct() {
  console.log("🟢 addProduct clicked");

  const name = document.getElementById("pName")?.value;
  const weight = document.getElementById("pWeight")?.value;
  const price = document.getElementById("pPrice")?.value;
  const stock = document.getElementById("pStock")?.value;
  const category = document.getElementById("pCategory")?.value;

  if (!name || !price || !stock || !category) {
    alert("Fill all required fields");
    return;
  }

  const payload = { name, weight, price, stock, category };
  console.log("📦 SENDING:", payload);

  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("✅ RESPONSE:", data);

    if (!res.ok) {
      alert("Backend error");
      return;
    }

    alert("🎉 Product added successfully");
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

// expose globally
window.addProduct = addProduct;
