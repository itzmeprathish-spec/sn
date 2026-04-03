const heroBg = document.getElementById("heroBg");
const shopNowBtn = document.getElementById("shopNowBtn");
const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const filterChips = document.querySelectorAll(".filterChip");
const navButtons = document.querySelectorAll(".nav__button");

const bannerDefault = "https://source.unsplash.com/featured/1800x600?fashion,shopping&sig=101";

const fetchJSON = window.apiFetch
  ? (url) => window.apiFetch(url)
  : async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("API error");
      return res.json();
    };

function setHeroImage() {
  if (!heroBg) return;
  heroBg.style.backgroundImage = `url("${bannerDefault}")`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])
  );
}

function formatINR(price) {
  return "₹" + Number(price).toLocaleString("en-IN");
}

function productCardHtml(p) {
  return `
    <article class="productCard">
      <img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" />
      <h3>${escapeHtml(p.name)}</h3>
      <p>${formatINR(p.price)}</p>
      <button data-add-product-id="${p._id || p.id}">Add to Cart</button>
    </article>
  `;
}

async function fetchProducts(category = "All") {
  try {
    const qs = category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    return await fetchJSON(`/api/products${qs}`);
  } catch (err) {
    console.error("Fetch error:", err);
    return { products: [] }; // ✅ prevent crash
  }
}

function setActiveFilter(category) {
  filterChips.forEach((chip) =>
    chip.classList.toggle("is-active", chip.dataset.category === category)
  );
}

async function renderProducts(category = "All") {
  if (!productGrid) return;

  productGrid.innerHTML = "";
  if (emptyState) emptyState.hidden = true;

  const json = await fetchProducts(category);
  const products = Array.isArray(json) ? json : (json.products || []);

  if (products.length === 0) {
    if (emptyState) emptyState.hidden = false;
    return;
  }

  products.forEach((p) => {
    const el = document.createElement("div");
    el.innerHTML = productCardHtml(p);
    productGrid.appendChild(el.firstElementChild);
  });
}

function wireProductAdd() {
  if (!productGrid) return;

  productGrid.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-add-product-id]");
    if (!btn) return;

    const productId = btn.getAttribute("data-add-product-id");

    try {
      if (window.addToCart) {
        await window.addToCart(productId, 1);
      } else {
        alert("Cart system not loaded");
      }
    } catch (err) {
      console.error(err);
    }
  });
}

function wireFilters() {
  filterChips.forEach((chip) => {
    chip.addEventListener("click", async () => {
      const cat = chip.dataset.category;
      setActiveFilter(cat);
      await renderProducts(cat);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  navButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const cat = btn.dataset.category;
      setActiveFilter(cat);
      await renderProducts(cat);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", () => {
      const chip = document.querySelector('[data-category="All"]');
      chip?.click();
      document.querySelector("main")?.scrollIntoView({ behavior: "smooth" });
    });
  }
}

window.addEventListener("load", async () => {
  try {
    setHeroImage();
    wireProductAdd();
    wireFilters();
    await renderProducts("All");
  } catch (err) {
    console.error("Init error:", err);
  }
});