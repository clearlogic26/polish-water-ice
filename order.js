const NJ_TAX_RATE = 0.06625;

const state = {
  size: null,
  sizePrice: 0,
  flavor: null,
  toppings: [],
  toppingsPrice: 0,
  qty: 1,
  order: []
};

// --- DOM refs ---
const sizeButtons = document.querySelectorAll('.size-btn');
const flavorButtons = document.querySelectorAll('.flavor-btn');
const toppingButtons = document.querySelectorAll('.topping-btn');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const qtyValue = document.getElementById('qtyValue');
const addBtn = document.getElementById('addToOrder');
const orderItemsEl = document.getElementById('orderItems');
const orderTotalsEl = document.getElementById('orderTotals');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const clearBtn = document.getElementById('clearOrder');

// --- Size selection ---
sizeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sizeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.size = btn.dataset.size;
    state.sizePrice = parseFloat(btn.dataset.price);
    updateAddBtn();
  });
});

// --- Flavor selection ---
flavorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    flavorButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.flavor = btn.dataset.flavor;
    updateAddBtn();
  });
});

// --- Topping toggles ---
toppingButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const topping = btn.dataset.topping;
    const price = parseFloat(btn.dataset.price);

    if (btn.classList.contains('active')) {
      state.toppings.push({ name: topping, price });
    } else {
      state.toppings = state.toppings.filter(t => t.name !== topping);
    }
    state.toppingsPrice = state.toppings.reduce((sum, t) => sum + t.price, 0);
  });
});

// --- Quantity ---
qtyMinus.addEventListener('click', () => {
  if (state.qty > 1) {
    state.qty--;
    qtyValue.textContent = state.qty;
  }
});

qtyPlus.addEventListener('click', () => {
  if (state.qty < 99) {
    state.qty++;
    qtyValue.textContent = state.qty;
  }
});

// --- Add to order ---
function updateAddBtn() {
  addBtn.disabled = !(state.size && state.flavor);
}

addBtn.addEventListener('click', () => {
  if (!state.size || !state.flavor) return;

  const itemPrice = state.sizePrice + state.toppingsPrice;
  const item = {
    id: Date.now(),
    size: state.size,
    flavor: state.flavor,
    toppings: [...state.toppings],
    qty: state.qty,
    unitPrice: itemPrice,
    totalPrice: itemPrice * state.qty
  };

  state.order.push(item);
  renderOrder();
  resetBuilder();
});

function resetBuilder() {
  state.size = null;
  state.sizePrice = 0;
  state.flavor = null;
  state.toppings = [];
  state.toppingsPrice = 0;
  state.qty = 1;

  sizeButtons.forEach(b => b.classList.remove('active'));
  flavorButtons.forEach(b => b.classList.remove('active'));
  toppingButtons.forEach(b => b.classList.remove('active'));
  qtyValue.textContent = '1';
  addBtn.disabled = true;
}

// --- Render order ---
function renderOrder() {
  if (state.order.length === 0) {
    orderItemsEl.innerHTML = '<p class="empty-order">No items yet. Build something delicious!</p>';
    orderTotalsEl.style.display = 'none';
    clearBtn.style.display = 'none';
    return;
  }

  orderItemsEl.innerHTML = state.order.map(item => {
    const sizeName = item.size.charAt(0).toUpperCase() + item.size.slice(1);
    const toppingList = item.toppings.length
      ? item.toppings.map(t => t.name).join(', ')
      : 'No toppings';

    return `
      <div class="order-item">
        <div class="item-details">
          <div class="item-name">${item.qty}x ${sizeName} ${item.flavor}</div>
          <div class="item-meta">${toppingList}</div>
        </div>
        <span class="item-price">$${item.totalPrice.toFixed(2)}</span>
        <button class="item-remove" data-id="${item.id}">Remove</button>
      </div>
    `;
  }).join('');

  // Attach remove handlers
  orderItemsEl.querySelectorAll('.item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.order = state.order.filter(i => i.id !== parseInt(btn.dataset.id));
      renderOrder();
    });
  });

  // Calculate totals
  const subtotal = state.order.reduce((sum, i) => sum + i.totalPrice, 0);
  const tax = subtotal * NJ_TAX_RATE;
  const total = subtotal + tax;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;

  orderTotalsEl.style.display = 'block';
  clearBtn.style.display = 'block';
}

// --- Clear order ---
clearBtn.addEventListener('click', () => {
  state.order = [];
  renderOrder();
});
