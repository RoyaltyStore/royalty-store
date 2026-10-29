"use strict";

// Royalty Store product catalogue.
// These are demonstration products, not confirmed stock for sale.
// Replace them with your real products before accepting orders.

const products = [
  {
    id: 1,
    name: "Classic Gold Bracelet",
    category: "Accessories",
    price: 149.00,
    description: "A simple, elegant accessory for everyday style.",
    emoji: "✦",
    image: ""
  },
  {
    id: 2,
    name: "Everyday Tote Bag",
    category: "Lifestyle",
    price: 199.00,
    description: "A versatile bag for your daily essentials.",
    emoji: "▤",
    image: ""
  },
  {
    id: 3,
    name: "Minimalist Sunglasses",
    category: "Accessories",
    price: 179.00,
    description: "A timeless look for sunny days.",
    emoji: "◉",
    image: ""
  },
  {
    id: 4,
    name: "Classic Everyday Cap",
    category: "Fashion",
    price: 129.00,
    description: "An easy addition to your casual outfits.",
    emoji: "⌃",
    image: ""
  },
  {
    id: 5,
    name: "Premium Travel Mug",
    category: "Lifestyle",
    price: 159.00,
    description: "A practical companion for your daily routine.",
    emoji: "♨",
    image: ""
  },
  {
    id: 6,
    name: "Essential Fashion Wallet",
    category: "Fashion",
    price: 189.00,
    description: "Keep your everyday essentials together.",
    emoji: "▰",
    image: ""
  }
];

const productGrid = document.getElementById("product-grid");
const productSearch = document.getElementById("product-search");
const productTotal = document.getElementById("product-total");
const filterContainer = document.getElementById("category-filters");

const cartToggle = document.getElementById("cart-toggle");
const cartClose = document.getElementById("cart-close");
const cartOverlay = document.getElementById("cart-overlay");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartSubtotal = document.getElementById("cart-subtotal");
const checkoutButton = document.getElementById("checkout-button");
const toast = document.getElementById("toast");

let selectedCategory = "All";
let cart = [];
let toastTimeout;

const money = amount =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR"
  }).format(amount);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return replacements[character];
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2500);
}

function renderProducts() {
  const searchTerm = productSearch.value.trim().toLowerCase();

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const searchableText =
      `${product.name} ${product.category} ${product.description}`
        .toLowerCase();

    return matchesCategory && searchableText.includes(searchTerm);
  });

  productTotal.textContent =
    `${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"}`;

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try another search or select a different category.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filteredProducts.map(product => {
    const imageMarkup = product.image
      ? `<img src="${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}"
              loading="lazy"
              onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
         <span class="product-placeholder" style="display:none">
           ${escapeHTML(product.emoji)}
         </span>`
      : `<span class="product-placeholder">${escapeHTML(product.emoji)}</span>`;

    return `
      <article class="product-card">
        <div class="product-image">
          ${imageMarkup}
        </div>

        <div class="product-info">
          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>

          <h3>${escapeHTML(product.name)}</h3>

          <p class="product-description">
            ${escapeHTML(product.description)}
          </p>

          <div class="product-bottom">
            <span class="product-price">${money(product.price)}</span>

            <button
              class="add-button"
              type="button"
              data-add="${product.id}"
              aria-label="Add ${escapeHTML(product.name)} to cart">
              + Add to cart
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);

  if (!product) {
    showToast("Sorry, that product could not be found.");
    return;
  }

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  renderCart();
  showToast(`${product.name} added to your cart.`);
}

function changeQuantity(productId, change) {
  const item = cart.find(product => product.id === productId);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(product => product.id !== productId);
  }

  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(product => product.id !== productId);
  renderCart();
  showToast("Item removed from your cart.");
}

function renderCart() {
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  cartCount.textContent = totalItems;
  cartSubtotal.textContent = money(subtotal);
  checkoutButton.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <p class="cart-empty">
        Your cart is empty. Explore the collection to get started.
      </p>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <article class="cart-item">
      <div>
        <h3>${escapeHTML(item.name)}</h3>
        <p>${money(item.price)} each</p>

        <div class="cart-item-actions">
          <button
            class="quantity-button"
            type="button"
            data-decrease="${item.id}"
            aria-label="Decrease quantity of ${escapeHTML(item.name)}">
            −
          </button>

          <span>${item.quantity}</span>

          <button
            class="quantity-button"
            type="button"
            data-increase="${item.id}"
            aria-label="Increase quantity of ${escapeHTML(item.name)}">
            +
          </button>

          <button
            class="remove-button"
            type="button"
            data-remove="${item.id}">
            Remove
          </button>
        </div>
      </div>

      <strong>${money(item.price * item.quantity)}</strong>
    </article>
  `).join("");
}

function openCart() {
  cartOverlay.hidden = false;
  document.body.classList.add("cart-open");
  cartClose.focus();
}

function closeCart() {
  cartOverlay.hidden = true;
  document.body.classList.remove("cart-open");
  cartToggle.focus();
}

productSearch.addEventListener("input", renderProducts);

filterContainer.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");

  if (!button) return;

  selectedCategory = button.dataset.category;

  filterContainer.querySelectorAll("[data-category]").forEach(filter => {
    const isActive = filter === button;
    filter.classList.toggle("active", isActive);
    filter.setAttribute("aria-pressed", String(isActive));
  });

  renderProducts();
});

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");

  if (!button) return;

  addToCart(Number(button.dataset.add));
});

cartItems.addEventListener("click", event => {
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");
  const removeButton = event.target.closest("[data-remove]");

  if (increaseButton) {
    changeQuantity(Number(increaseButton.dataset.increase), 1);
  } else if (decreaseButton) {
    changeQuantity(Number(decreaseButton.dataset.decrease), -1);
  } else if (removeButton) {
    removeFromCart(Number(removeButton.dataset.remove));
  }
});

cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);

cartOverlay.addEventListener("click", event => {
  if (event.target === cartOverlay) {
    closeCart();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !cartOverlay.hidden) {
    closeCart();
  }
});

checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Your cart is empty.");
    return;
  }

  showToast("Demo only: online checkout is not connected yet.");
});

document.getElementById("current-year").textContent =
  new Date().getFullYear();

renderProducts();
renderCart();
