function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

function setCart(items) {
  localStorage.setItem("cart", JSON.stringify(items || []));
}

function getCartCount(items) {
  return (items || []).reduce((sum, i) => sum + Number(i.quantity || 1), 0);
}

function getCartTotal(items) {
  return (items || []).reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1), 0);
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCountBadge = document.getElementById("cartCountBadge");
  const cartTotalStrong = document.getElementById("cartTotalStrong");
  if (!cartItems || !cartCountBadge || !cartTotalStrong) return;

  const items = getCart();
  cartCountBadge.textContent = String(getCartCount(items));
  cartTotalStrong.textContent = formatINR(getCartTotal(items));

  cartItems.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "lineRow";
    row.innerHTML = `
      <span>${item.name || "Product"} x ${item.quantity || 1}</span>
      <strong>${formatINR((item.price || 0) * (item.quantity || 1))}</strong>
    `;
    cartItems.appendChild(row);
  });
}

window.addToCart = async function addToCart(productId, quantity) {
  try {
    const product = await apiFetch(`/api/products`);
    const allProducts = Array.isArray(product) ? product : (product.products || []);
    const selected = allProducts.find((p) => String(p._id || p.id) === String(productId));
    if (!selected) throw new Error("Product not found");

    const items = getCart();
    const existing = items.find((i) => String(i.productId) === String(productId));
    if (existing) {
      existing.quantity = Number(existing.quantity || 0) + Number(quantity || 1);
    } else {
      items.push({
        productId: selected._id || selected.id,
        name: selected.name,
        price: selected.price,
        quantity: Number(quantity || 1)
      });
    }

    setCart(items);
    renderCart();
    if (typeof showToast === "function") showToast("Added to cart");
  } catch (err) {
    if (typeof showToast === "function") showToast(err.message || "Failed to add");
  }
};

window.addEventListener("load", () => {
  const cartDrawer = document.getElementById("cartDrawer");
  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartOverlay = document.getElementById("cartOverlay");
  const goToCheckoutBtn = document.getElementById("goToCheckoutBtn");

  openCartBtn?.addEventListener("click", () => cartDrawer?.classList.add("is-open"));
  closeCartBtn?.addEventListener("click", () => cartDrawer?.classList.remove("is-open"));
  cartOverlay?.addEventListener("click", () => cartDrawer?.classList.remove("is-open"));
  goToCheckoutBtn?.addEventListener("click", () => {
    window.location.href = "/checkout";
  });

  renderCart();
});