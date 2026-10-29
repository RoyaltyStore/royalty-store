"use strict";

/*
  ROYALTY STORE CATALOGUE

  Only add products after verifying the real product, price,
  comparison price, image and availability.

  IMPORTANT:
  Never put supplier URLs, supplier costs or profit margins here.
  This JavaScript is public and visitors can inspect it.
*/

const products = [
  /*
  ADD VERIFIED PRODUCTS HERE USING THIS FORMAT:

  {
    id: "rs-001",
    name: "Verified product name",
    category: "Electronics",
    description: "An accurate description of the product.",
    price: 399.00,
    compareAt: 499.00,
    image: "https://example.com/authorised-product-image.jpg",
    featured: true,
    verified: true
  },

  The example above is a TEMPLATE, not a real product listing.
  Replace all example details with verified information.
  Do not remove the comma between product objects when adding more.
  */
];

const categories = [
  "All",
  "Electronics",
  "Home & Kitchen",
  "Fashion",
  "Beauty",
  "Automotive",
  "Sports & Fitness",
  "Gifts & Lifestyle"
];

const money = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR"
});

const elements = {
  search: document.getElementById("product-search"),
  clearSearch: document.getElementById("clear-search"),
  categoryList: document.getElementById("category-list"),
  sort: document.getElementById("sort-products"),
  productGrid: document.getElementById("product-grid"),
  productCount: document.getElementById("product-count"),
  emptyState: document.getElementById("empty-state"),
  emptyTitle: document.getElementById("empty-title"),
  emptyMessage: document.getElementById("empty-message"),
  resetFilters: document.getElementById("reset-filters"),
  cartCount: document.getElementById("cart-count"),
  cartOverlay: document.getElementById("cart-overlay"),
  openCart: document.getElementById("open-cart"),
  closeCart: document.getElementById("close-cart"),
  cartItems: document.getElementById("cart-items"),
  cartEmpty: document.getElementById("cart-empty"),
  cartSummary: document.getElementById("cart-summary"),
  cartSubtotal: document.getElementById("cart-subtotal"),
  checkout: document.getElementById("checkout-button"),
  checkoutNotice: document.getElementById("checkout-notice"),
  continueShopping: document.getElementById("continue-shopping"),
  searchToggle: document.getElementById("search-toggle"),
  toast: document.getElementById("toast")
};

let selectedCategory = "All";
let cart = loadCart();
let toastTimer;

document.getElementById("current-year").textContent =
  new Date().getFullYear();

/* Basic safety checks for public product data. */
function getVerifiedProducts() {
  return products.filter(product => {
    return product.verified === true
      && product.id
      && product.name
      && categories.includes(product.category)
      && Number.isFinite(product.price)
      && product.price > 0
      && Number.isFinite(product.compareAt)
      && product.compareAt >= product.price
      && typeof product.description === "string"
      && typeof product.image === "string"
      && /^https:\/\//i.test(product.image);
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatMoney(value) {
  return money.format(value);
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("royaltyStoreCart") || "[]");
    return Array.isArray(saved)
      ? saved.filter(item =>
          item
          && typeof item.id === "string"
          && Number.isInteger(item.quantity)
          && item.quantity > 0
        )
      : [];
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("royaltyStoreCart", JSON.stringify(cart));
  } catch {
    showToast("Your browser could not save the shopping bag.");
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.hidden = true;
  }, 2600);
}

/* Build category buttons. */
function renderCategories() {
  elements.categoryList.innerHTML = categories.map(category => `
    <button
      class="category-button ${category === selectedCategory ? "active" : ""}"
      type="button"
      data-category="${escapeHTML(category)}"
      aria-pressed="${category === selectedCategory}">
      ${escapeHTML(category)}
    </button>
  `).join("");
}

/* Filter products by category and search phrase. */
function getVisibleProducts() {
  const verifiedProducts = getVerifiedProducts();
  const query = elements.search.value.trim().toLowerCase();

  let visible = verifiedProducts.filter(product => {
    const matchesCategory =
      selectedCategory === "All"
      || product.category === selectedCategory;

    const searchableText =
      `${product.name} ${product.category} ${product.description}`
        .toLowerCase();

    return matchesCategory && searchableText.includes(query);
  });

  switch (elements.sort.value) {
    case "price-low":
      visible.sort((a, b) => a.price - b.price);
      break;

    case "price-high":
      visible.sort((a, b) => b.price - a.price);
      break;

    case "name":
      visible.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case "discount":
      visible.sort((a, b) => {
        const savingA = a.compareAt - a.price;
        const savingB = b.compareAt - b.price;
        return savingB - savingA;
      });
      break;

    default:
      visible.sort((a, b) => Number(b.featured === true)
        - Number(a.featured === true));
  }

  return visible;
}

/* Display product cards. */
function renderProducts() {
  const visible = getVisibleProducts();
  const allProducts = getVerifiedProducts();

  elements.productCount.textContent =
    `${visible.length} ${visible.length === 1 ? "product" : "products"}`;

  elements.clearSearch.hidden = !elements.search.value;

  if (visible.length === 0) {
    elements.productGrid.innerHTML = "";
    elements.emptyState.hidden = false;

    if (allProducts.length === 0) {
      elements.emptyTitle.textContent =
        "Your next great find is on its way.";

      elements.emptyMessage.textContent =
        "We're preparing our catalogue. Verified products will appear here once their details and prices have been checked.";
    } else {
      elements.emptyTitle.textContent = "No products found.";

      elements.emptyMessage.textContent =
        "Try another search or choose a different department.";
    }

    return;
  }

  elements.emptyState.hidden = true;

  elements.productGrid.innerHTML = visible.map(product => {
    const saving = product.compareAt - product.price;
    const hasSaving = saving > 0;

    return `
      <article class="product-card">
        <div class="product-image-wrap">
          ${hasSaving ? '<span class="sale-label">SPECIAL</span>' : ""}
          <img
            class="product-image"
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.hidden=false;">
          <div class="product-image-placeholder" hidden aria-hidden="true">♛</div>
        </div>

        <div class="product-info">
          <p class="product-category">${escapeHTML(product.category)}</p>
          <h3 class="product-name">${escapeHTML(product.name)}</h3>
          <p class="product-description">${escapeHTML(product.description)}</p>

          <div class="product-prices">
            <span class="product-price">${formatMoney(product.price)}</span>
            ${hasSaving
              ? `<span class="old-price">${formatMoney(product.compareAt)}</span>`
              : ""}
          </div>

          ${hasSaving
            ? `<p class="saving-label">Save ${formatMoney(saving)}</p>`
            : ""}

          <button class="add-button" type="button"
            data-add="${escapeHTML(product.id)}">
            Add to bag
          </button>
        </div>
      </article>
    `;
  }).join("");
}

/* Cart helpers. */
function getCartProducts() {
  const verifiedProducts = getVerifiedProducts();

  return cart.map(item => {
    const product = verifiedProducts.find(p => p.id === item.id);
    return product ? { ...product, quantity: item.quantity } : null;
  }).filter(Boolean);
}

function addToCart(id) {
  const product = getVerifiedProducts().find(p => p.id === id);

  if (!product) {
    showToast("This product is not currently available.");
    return;
  }

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast("Added to your shopping bag.");
}

function changeQuantity(id, amount) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry.id !== id);
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const items = getCartProducts();
  const quantity = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity, 0
  );

  elements.cartCount.textContent = quantity;
  elements.cartItems.innerHTML = "";

  elements.cartEmpty.hidden = items.length > 0;
  elements.cartSummary.hidden = items.length === 0;

  if (items.length === 0) {
    elements.cartSubtotal.textContent = formatMoney(0);
    return;
  }

  elements.cartItems.innerHTML = items.map(item => `
    <div class="cart-line">
      <div class="cart-thumb">
        <img src="${escapeHTML(item.image)}"
          alt="" onerror="this.style.display='none';">
      </div>

      <div>
        <h3>${escapeHTML(item.name)}</h3>
        <p>${formatMoney(item.price)}</p>

        <div class="quantity-controls">
          <button type="button" data-quantity="${escapeHTML(item.id)}"
            data-change="-1" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity="${escapeHTML(item.id)}"
            data-change="1" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <button class="remove-item" type="button"
        data-remove="${escapeHTML(item.id)}">Remove</button>
    </div>
  `).join("");

  elements.cartSubtotal.textContent = formatMoney(subtotal);
}

/* Open and close the shopping bag. */
function openCart() {
  elements.cartOverlay.hidden = false;
  document.body.classList.add("cart-open");
  elements.closeCart.focus();
}

function closeCart() {
  elements.cartOverlay.hidden = true;
  document.body.classList.remove("cart-open");
  elements.openCart.focus();
}

elements.openCart.addEventListener("click", openCart);
elements.closeCart.addEventListener("click", closeCart);
elements.continueShopping.addEventListener("click", closeCart);

elements.cartOverlay.addEventListener("click", event => {
  if (event.target === elements.cartOverlay) {
    closeCart();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !elements.cartOverlay.hidden) {
    closeCart();
  }
});

/* Search and category controls. */
elements.search.addEventListener("input", renderProducts);
elements.sort.addEventListener("change", renderProducts);

elements.searchToggle.addEventListener("click", () => {
  elements.search.focus();
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
});

elements.clearSearch.addEventListener("click", () => {
  elements.search.value = "";
  renderProducts();
  elements.search.focus();
});

elements.categoryList.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  selectedCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

elements.resetFilters.addEventListener("click", () => {
  selectedCategory = "All";
  elements.search.value = "";
  elements.sort.value = "featured";
  renderCategories();
  renderProducts();
});

elements.productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  addToCart(button.dataset.add);
});

elements.cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    changeQuantity(
      quantityButton.dataset.quantity,
      Number(quantityButton.dataset.change)
    );
  }

  if (removeButton) {
    removeFromCart(removeButton.dataset.remove);
  }
});

/* Checkout is deliberately disabled until a real order system is connected. */
elements.checkout.addEventListener("click", () => {
  elements.checkoutNotice.textContent =
    "Checkout is not live yet. No order or payment has been submitted.";

  showToast("Online checkout is not active yet.");
});

/* Initial page setup. */
renderCategories();
renderProducts();
renderCart();
