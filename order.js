// ==========================================
// Polish Water Ice — Order Calculator
// Tax: 8.625%, rounded UP to nearest cent
// ==========================================

const TAX_RATE = 0.08625;

// --- Menu Data ---
const MENU = {
  'water-ice': {
    name: 'Polish Water Ice',
    sizes: [
      { key: 'small',  label: 'Small',  price: 5.76 },
      { key: 'medium', label: 'Medium', price: 6.44 },
      { key: 'large',  label: 'Large',  price: 7.14 },
      { key: 'quart',  label: 'Quart',  price: 12.89 },
    ],
    addons: [],
  },
  'slushie': {
    name: 'Slushie',
    sizes: [
      { key: 'small', label: 'Small', detail: '16 oz', price: 7.83 },
      { key: 'large', label: 'Large', detail: '20 oz', price: 8.76 },
    ],
    addons: [],
  },
  'ice-cap': {
    name: 'Ice Cap',
    sizes: [
      { key: 'small', label: 'Small', detail: '16 oz', price: 7.83 },
      { key: 'large', label: 'Large', detail: '20 oz', price: 8.76 },
    ],
    addons: [],
  },
  'polish-freeze': {
    name: 'Polish Freeze',
    sizes: [
      { key: 'small',  label: 'Small',  price: 6.21 },
      { key: 'medium', label: 'Medium', price: 6.91 },
      { key: 'large',  label: 'Large',  price: 7.59 },
      { key: 'quart',  label: 'Quart',  price: 13.81 },
    ],
    addons: [],
  },
  'ice-cream-cup': {
    name: 'Ice Cream Cup',
    sizes: [
      { key: 'small',  label: 'Small',  price: 5.76 },
      { key: 'medium', label: 'Medium', price: 6.44 },
      { key: 'large',  label: 'Large',  price: 7.14 },
      { key: 'quart',  label: 'Quart',  price: 12.89 },
    ],
    addons: [],
  },
  'ice-cream-cone': {
    name: 'Ice Cream Cone',
    // Cone uses a special "cone type" selector instead of sizes
    coneTypes: [
      { key: 'regular', label: 'Regular Cone', price: 5.76 },
      { key: 'waffle',  label: 'Waffle Cone',  price: 6.68 },
    ],
    addons: [
      { key: 'sprinkles', label: 'Sprinkles', price: 0.69 },
    ],
  },
  'chiller': {
    name: 'Chiller',
    sizes: [
      { key: 'small', label: 'Small', detail: '12 oz', price: 7.83 },
      { key: 'large', label: 'Large', detail: '16 oz', price: 8.76 },
    ],
    candyMix: [
      'Oreo', "M&M's", "Reese's PB Cups", 'Heath Bar',
      'Butterfinger', "Reese's Pieces", 'Snickers',
    ],
    addons: [],
  },
  'milkshake': {
    name: 'Milkshake',
    sizes: [
      { key: 'small', label: 'Small', detail: '16 oz', price: 7.83 },
      { key: 'large', label: 'Large', detail: '20 oz', price: 8.76 },
    ],
    addons: [],
  },
  'float': {
    name: 'Float',
    sizes: [
      { key: 'small', label: 'Small', detail: '16 oz', price: 7.83 },
      { key: 'large', label: 'Large', detail: '20 oz', price: 8.76 },
    ],
    addons: [],
  },
};

// --- State ---
const state = {
  category: null,
  sizeKey: null,
  sizePrice: 0,
  sizeLabel: '',
  coneKey: null,
  conePrice: 0,
  coneLabel: '',
  addons: [],    // [{ key, label, price }]
  candyChoice: null,
  qty: 1,
  order: [],
};

// --- DOM Refs ---
const catButtons     = document.querySelectorAll('.cat-btn');
const sizeCard       = document.getElementById('sizeCard');
const sizeOptions    = document.getElementById('sizeOptions');
const coneCard       = document.getElementById('coneCard');
const coneOptions    = document.getElementById('coneOptions');
const addonsCard     = document.getElementById('addonsCard');
const addonsTitle    = document.getElementById('addonsTitle');
const addonOptions   = document.getElementById('addonOptions');
const qtyCard        = document.getElementById('qtyCard');
const qtyTitle       = document.getElementById('qtyTitle');
const qtyMinus       = document.getElementById('qtyMinus');
const qtyPlus        = document.getElementById('qtyPlus');
const qtyValue       = document.getElementById('qtyValue');
const addBtn         = document.getElementById('addToOrder');
const orderItemsEl   = document.getElementById('orderItems');
const orderTotalsEl  = document.getElementById('orderTotals');
const subtotalEl     = document.getElementById('subtotal');
const taxEl          = document.getElementById('tax');
const totalEl        = document.getElementById('total');
const clearBtn       = document.getElementById('clearOrder');

// ==========================================
// Category Selection
// ==========================================
catButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    catButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.category = btn.dataset.category;
    resetSelections();
    buildSizeOrCone();
    updateAddBtn();
  });
});

function resetSelections() {
  state.sizeKey = null;
  state.sizePrice = 0;
  state.sizeLabel = '';
  state.coneKey = null;
  state.conePrice = 0;
  state.coneLabel = '';
  state.addons = [];
  state.candyChoice = null;
  state.qty = 1;
  qtyValue.textContent = '1';
}

// ==========================================
// Build Size / Cone selectors dynamically
// ==========================================
function buildSizeOrCone() {
  const item = MENU[state.category];
  if (!item) return;

  // Hide all optional cards
  sizeCard.style.display = 'none';
  coneCard.style.display = 'none';
  addonsCard.style.display = 'none';
  qtyCard.style.display = 'none';
  sizeOptions.innerHTML = '';
  coneOptions.innerHTML = '';
  addonOptions.innerHTML = '';

  let stepNum = 2;

  // --- Ice Cream Cone: special cone type picker ---
  if (item.coneTypes) {
    coneCard.style.display = 'block';
    coneOptions.innerHTML = item.coneTypes.map(c => `
      <button class="size-btn" data-key="${c.key}" data-price="${c.price}" data-label="${c.label}">
        <span class="size-label">${c.label}</span>
        <span class="size-price">$${c.price.toFixed(2)}</span>
      </button>
    `).join('');

    coneOptions.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        coneOptions.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.coneKey = btn.dataset.key;
        state.conePrice = parseFloat(btn.dataset.price);
        state.coneLabel = btn.dataset.label;
        showAddons(item, 3);
        updateAddBtn();
      });
    });
    stepNum = 3;
  }

  // --- Standard sizes ---
  if (item.sizes) {
    sizeCard.style.display = 'block';
    sizeOptions.innerHTML = item.sizes.map(s => `
      <button class="size-btn" data-key="${s.key}" data-price="${s.price}" data-label="${s.label}">
        <span class="size-icon">${s.key[0].toUpperCase()}</span>
        <span class="size-label">${s.label}</span>
        ${s.detail ? `<span class="size-detail">${s.detail}</span>` : ''}
        <span class="size-price">$${s.price.toFixed(2)}</span>
      </button>
    `).join('');

    sizeOptions.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sizeOptions.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.sizeKey = btn.dataset.key;
        state.sizePrice = parseFloat(btn.dataset.price);
        state.sizeLabel = btn.dataset.label;
        showAddons(item, 3);
        updateAddBtn();
      });
    });
  }

  // Show candy picker for Chiller immediately
  if (item.candyMix) {
    showCandyPicker(item, stepNum + 1);
  }

  // Always show qty
  showQty(item);
}

// ==========================================
// Add-ons (sprinkles, etc.)
// ==========================================
function showAddons(item, step) {
  if (!item.addons || item.addons.length === 0) return;

  addonsCard.style.display = 'block';
  addonsTitle.textContent = `${step}. Add-ons (optional)`;

  addonOptions.innerHTML = item.addons.map(a => `
    <button class="topping-btn" data-key="${a.key}" data-label="${a.label}" data-price="${a.price}">
      ${a.label} +$${a.price.toFixed(2)}
    </button>
  `).join('');

  addonOptions.querySelectorAll('.topping-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const key = btn.dataset.key;
      if (btn.classList.contains('active')) {
        state.addons.push({ key, label: btn.dataset.label, price: parseFloat(btn.dataset.price) });
      } else {
        state.addons = state.addons.filter(a => a.key !== key);
      }
    });
  });
}

// ==========================================
// Candy Picker (Chiller)
// ==========================================
function showCandyPicker(item, step) {
  addonsCard.style.display = 'block';
  addonsTitle.textContent = `${step}. Pick a Candy Mix`;

  addonOptions.innerHTML = item.candyMix.map(c => `
    <button class="topping-btn" data-candy="${c}">${c}</button>
  `).join('');

  addonOptions.querySelectorAll('.topping-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addonOptions.querySelectorAll('.topping-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.candyChoice = btn.dataset.candy;
      updateAddBtn();
    });
  });
}

// ==========================================
// Quantity
// ==========================================
function showQty(item) {
  qtyCard.style.display = 'block';
  // Figure out correct step number
  let step = 3;
  if (item.coneTypes && item.addons && item.addons.length) step = 4;
  if (item.candyMix) step = 4;
  qtyTitle.textContent = `${step}. Quantity`;
}

qtyMinus.addEventListener('click', () => {
  if (state.qty > 1) { state.qty--; qtyValue.textContent = state.qty; }
});
qtyPlus.addEventListener('click', () => {
  if (state.qty < 99) { state.qty++; qtyValue.textContent = state.qty; }
});

// ==========================================
// Add to Order validation
// ==========================================
function updateAddBtn() {
  if (!state.category) { addBtn.disabled = true; return; }
  const item = MENU[state.category];

  // Need size or cone type
  if (item.sizes && !state.sizeKey) { addBtn.disabled = true; return; }
  if (item.coneTypes && !state.coneKey) { addBtn.disabled = true; return; }
  // Chiller needs candy choice
  if (item.candyMix && !state.candyChoice) { addBtn.disabled = true; return; }

  addBtn.disabled = false;
}

// ==========================================
// Add to Order
// ==========================================
addBtn.addEventListener('click', () => {
  if (addBtn.disabled) return;
  const item = MENU[state.category];

  // Calculate unit price
  let unitPrice = state.sizePrice || state.conePrice;
  const addonTotal = state.addons.reduce((s, a) => s + a.price, 0);
  unitPrice += addonTotal;

  // Build description
  const sizePart = state.sizeLabel || state.coneLabel;
  let meta = [];
  if (state.candyChoice) meta.push(state.candyChoice);
  if (state.addons.length) meta.push(state.addons.map(a => a.label).join(', '));

  const orderItem = {
    id: Date.now(),
    name: item.name,
    size: sizePart,
    meta: meta.join(' · '),
    qty: state.qty,
    unitPrice,
    totalPrice: unitPrice * state.qty,
  };

  state.order.push(orderItem);
  renderOrder();
  resetBuilder();
});

function resetBuilder() {
  state.category = null;
  resetSelections();
  catButtons.forEach(b => b.classList.remove('active'));
  sizeCard.style.display = 'none';
  coneCard.style.display = 'none';
  addonsCard.style.display = 'none';
  qtyCard.style.display = 'none';
  sizeOptions.innerHTML = '';
  coneOptions.innerHTML = '';
  addonOptions.innerHTML = '';
  addBtn.disabled = true;
}

// ==========================================
// Render Order Summary
// ==========================================
function renderOrder() {
  if (state.order.length === 0) {
    orderItemsEl.innerHTML = '<p class="empty-order">No items yet. Build something delicious!</p>';
    orderTotalsEl.style.display = 'none';
    clearBtn.style.display = 'none';
    return;
  }

  orderItemsEl.innerHTML = state.order.map(item => `
    <div class="order-item">
      <div class="item-details">
        <div class="item-name">${item.qty}x ${item.size} ${item.name}</div>
        ${item.meta ? `<div class="item-meta">${item.meta}</div>` : ''}
      </div>
      <span class="item-price">$${item.totalPrice.toFixed(2)}</span>
      <button class="item-remove" data-id="${item.id}">Remove</button>
    </div>
  `).join('');

  // Remove handlers
  orderItemsEl.querySelectorAll('.item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.order = state.order.filter(i => i.id !== parseInt(btn.dataset.id));
      renderOrder();
    });
  });

  // Totals — tax rounded UP
  const subtotal = state.order.reduce((s, i) => s + i.totalPrice, 0);
  const tax = Math.ceil(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + tax;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;

  orderTotalsEl.style.display = 'block';
  clearBtn.style.display = 'block';
}

// ==========================================
// Clear Order
// ==========================================
clearBtn.addEventListener('click', () => {
  state.order = [];
  renderOrder();
});
