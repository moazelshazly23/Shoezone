/* ============================================================
   SHOEZONE — page-logic.js
   Dynamic rendering for Shop, Wishlist, Cart, Checkout, Product Details.
   Runs after main.js + products.js are loaded.
   ============================================================ */

function qsParam(name) {
  return new URLSearchParams(location.search).get(name);
}

/* ================= SHOP PAGE ================= */
function renderShop() {
  const grid = document.querySelector('#shop-grid');
  if (!grid) return;

  const state = { cat: qsParam('cat') || '', gender: [], brand: [], price: 400, sort: 'popularity', page: 1 };

  function apply() {
    let list = [...PRODUCTS];
    if (state.cat) list = list.filter(p => p.category.toLowerCase() === state.cat.toLowerCase() || p.gender.toLowerCase() === state.cat.toLowerCase());
    if (state.gender.length) list = list.filter(p => state.gender.includes(p.gender));
    if (state.brand.length) list = list.filter(p => state.brand.includes(p.brand));
    list = list.filter(p => p.price <= state.price);
    if (state.sort === 'price-asc') list.sort((a,b) => a.price - b.price);
    if (state.sort === 'price-desc') list.sort((a,b) => b.price - a.price);
    if (state.sort === 'newest') list = list.filter(p => p.newArrival).concat(list.filter(p => !p.newArrival));
    if (state.sort === 'rating') list.sort((a,b) => b.rating - a.rating);
    document.querySelector('#result-count').textContent = list.length;
    renderProducts('#shop-grid', list);
  }

  document.querySelectorAll('.filter-gender').forEach(cb => cb.addEventListener('change', () => {
    state.gender = [...document.querySelectorAll('.filter-gender:checked')].map(c => c.value);
    apply();
  }));
  document.querySelectorAll('.filter-brand').forEach(cb => cb.addEventListener('change', () => {
    state.brand = [...document.querySelectorAll('.filter-brand:checked')].map(c => c.value);
    apply();
  }));
  const priceRange = document.querySelector('#price-range');
  if (priceRange) priceRange.addEventListener('input', (e) => {
    state.price = parseInt(e.target.value);
    document.querySelector('#price-display').textContent = '$' + state.price;
    apply();
  });
  const sortSelect = document.querySelector('#sort-select');
  if (sortSelect) sortSelect.addEventListener('change', (e) => { state.sort = e.target.value; apply(); });
  document.querySelectorAll('.filter-cat-link').forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    state.cat = a.dataset.cat;
    document.querySelectorAll('.filter-cat-link').forEach(x => x.classList.remove('text-gold-active'));
    a.classList.add('text-gold-active');
    apply();
  }));
  const clearBtn = document.querySelector('#clear-filters');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    state.cat = ''; state.gender = []; state.brand = []; state.price = 400;
    document.querySelectorAll('.filter-gender, .filter-brand').forEach(c => c.checked = false);
    if (priceRange) priceRange.value = 400;
    document.querySelector('#price-display').textContent = '$400';
    apply();
  });

  apply();
}

/* ================= WISHLIST PAGE ================= */
function renderWishlistPage() {
  const grid = document.querySelector('#wishlist-grid');
  if (!grid) return;
  const empty = document.querySelector('#wishlist-empty');
  const wish = window.ShoeZone.getWish();
  const list = wish.map(w => getProductById(w.id)).filter(Boolean);
  if (!list.length) {
    grid.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.style.display = 'grid';
  renderProducts('#wishlist-grid', list);
}

/* ================= CART PAGE ================= */
function renderCartPage() {
  const list = document.querySelector('#cart-list');
  if (!list) return;
  const empty = document.querySelector('#cart-empty');
  const summaryWrap = document.querySelector('#cart-summary-wrap');

  function draw() {
    const cart = window.ShoeZone.getCart();
    if (!cart.length) {
      list.innerHTML = '';
      if (empty) empty.style.display = 'block';
      if (summaryWrap) summaryWrap.style.display = 'none';
      return;
    }
    if (empty) empty.style.display = 'none';
    if (summaryWrap) summaryWrap.style.display = 'block';

    list.innerHTML = cart.map((item, idx) => `
      <div class="cart-row">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <div class="name">${item.name}</div>
          <div class="meta">Size: ${item.size || '—'}</div>
        </div>
        <div class="qty-select" data-idx="${idx}">
          <button class="qty-minus" type="button">−</button>
          <input type="text" readonly value="${item.qty}">
          <button class="qty-plus" type="button">+</button>
        </div>
        <div style="min-width:80px;text-align:right;color:var(--gold);font-family:var(--font-display);font-size:1.1rem;">$${(item.price * item.qty).toFixed(0)}</div>
        <button class="remove-x" data-idx="${idx}" title="Remove"><i class="bi bi-trash3"></i></button>
      </div>
    `).join('');

    list.querySelectorAll('.qty-select').forEach(box => {
      const idx = parseInt(box.dataset.idx);
      box.querySelector('.qty-minus').addEventListener('click', () => changeQty(idx, -1));
      box.querySelector('.qty-plus').addEventListener('click', () => changeQty(idx, 1));
    });
    list.querySelectorAll('.remove-x').forEach(btn => {
      btn.addEventListener('click', () => {
        const cart = window.ShoeZone.getCart();
        cart.splice(parseInt(btn.dataset.idx), 1);
        window.ShoeZone.setCart(cart);
        draw();
      });
    });

    updateSummary();
  }

  function changeQty(idx, delta) {
    const cart = window.ShoeZone.getCart();
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    window.ShoeZone.setCart(cart);
    draw();
  }

  function updateSummary() {
    const cart = window.ShoeZone.getCart();
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
    const discount = window._szCouponApplied ? subtotal * 0.1 : 0;
    const total = subtotal - discount + shipping;
    const set = (id, val) => { const el = document.querySelector(id); if (el) el.textContent = val; };
    set('#sum-subtotal', '$' + subtotal.toFixed(2));
    set('#sum-shipping', shipping === 0 ? 'Free' : '$' + shipping.toFixed(2));
    set('#sum-discount', '-$' + discount.toFixed(2));
    set('#sum-total', '$' + total.toFixed(2));
  }

  document.querySelector('#apply-coupon')?.addEventListener('click', () => {
    const input = document.querySelector('#coupon-input');
    if (input && input.value.trim().toUpperCase() === 'STYLE10') {
      window._szCouponApplied = true;
      window.ShoeZone.showToast('Coupon applied: 10% off');
    } else {
      window.ShoeZone.showToast('Invalid coupon code');
    }
    updateSummary();
  });

  draw();
}

/* ================= CHECKOUT SUMMARY ================= */
function renderCheckoutSummary() {
  const box = document.querySelector('#checkout-summary-items');
  if (!box) return;
  const cart = window.ShoeZone.getCart();
  if (!cart.length) {
    box.innerHTML = '<p>Your cart is empty. <a href="shop.html" style="color:var(--gold);">Continue shopping</a></p>';
  } else {
    box.innerHTML = cart.map(i => `
      <div class="row-line"><span>${i.name} × ${i.qty}</span><strong>$${(i.price*i.qty).toFixed(0)}</strong></div>
    `).join('');
  }
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;
  document.querySelector('#co-subtotal').textContent = '$' + subtotal.toFixed(2);
  document.querySelector('#co-shipping').textContent = shipping === 0 ? 'Free' : '$' + shipping.toFixed(2);
  document.querySelector('#co-total').textContent = '$' + total.toFixed(2);

  document.querySelector('#place-order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    window.ShoeZone.setCart([]);
    document.querySelector('#checkout-form-area').style.display = 'none';
    document.querySelector('#order-success').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ================= PRODUCT DETAILS ================= */
function renderProductDetails() {
  const root = document.querySelector('#pd-root');
  if (!root) return;
  const id = qsParam('id') || PRODUCTS[0].id;
  const p = getProductById(id) || PRODUCTS[0];
  const discount = p.oldPrice ? Math.round(100 - (p.price / p.oldPrice * 100)) : 0;

  document.title = p.name + ' | ShoeZone';
  document.querySelector('#pd-breadcrumb-name').textContent = p.name;
  document.querySelector('.pd-gallery-main img').src = p.img;
  document.querySelector('#pd-brand').textContent = p.brand;
  document.querySelector('#pd-name').textContent = p.name;
  document.querySelector('#pd-stars').textContent = renderStars(p.rating);
  document.querySelector('#pd-rating-count').textContent = `${p.rating} · ${p.reviews} reviews`;
  document.querySelector('#pd-price').textContent = '$' + p.price;
  document.querySelector('#pd-old-price').textContent = p.oldPrice ? '$' + p.oldPrice : '';
  document.querySelector('#pd-discount').textContent = discount ? `Save ${discount}%` : '';
  document.querySelector('#pd-stock').textContent = p.stock ? 'In Stock' : 'Currently Sold Out';
  document.querySelector('#pd-stock').className = p.stock ? 'badge-stock in d-inline-block position-static' : 'badge-stock d-inline-block position-static';

  const sizeRow = document.querySelector('.size-row');
  if (sizeRow) sizeRow.innerHTML = p.sizes.map((s,i) => `<div class="size-chip ${i===0?'selected':''}" data-size="${s}">${s}</div>`).join('');
  const colorRow = document.querySelector('.color-row');
  if (colorRow) colorRow.innerHTML = p.colors.map((c,i) => `<div class="color-chip ${i===0?'selected':''}" style="background:${c}"></div>`).join('');

  const thumbs = document.querySelector('.pd-thumbs');
  if (thumbs) thumbs.innerHTML = [p.img, p.img, p.img].map((img,i) => `<button class="${i===0?'active':''}"><img src="${img}"></button>`).join('');
  thumbs?.querySelectorAll('button').forEach(t => t.addEventListener('click', () => {
    thumbs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    t.classList.add('active');
    document.querySelector('.pd-gallery-main img').src = t.querySelector('img').src;
  }));

  const addBtn = document.querySelector('#pd-add-cart');
  if (addBtn) {
    addBtn.dataset.id = p.id; addBtn.dataset.name = p.name; addBtn.dataset.price = p.price; addBtn.dataset.image = p.img;
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const size = document.querySelector('.size-chip.selected')?.dataset.size || '—';
      const qty = parseInt(document.querySelector('#pd-qty')?.value || '1');
      window.ShoeZone.addToCart({ id: p.id, name: p.name, price: p.price, image: p.img, size, qty });
    });
  }
  const buyBtn = document.querySelector('#pd-buy-now');
  if (buyBtn) buyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const size = document.querySelector('.size-chip.selected')?.dataset.size || '—';
    const qty = parseInt(document.querySelector('#pd-qty')?.value || '1');
    window.ShoeZone.addToCart({ id: p.id, name: p.name, price: p.price, image: p.img, size, qty });
    location.href = 'checkout.html';
  });
  const wishBtn = document.querySelector('#pd-wishlist');
  if (wishBtn) {
    wishBtn.dataset.id = p.id; wishBtn.dataset.name = p.name; wishBtn.dataset.price = p.price; wishBtn.dataset.image = p.img;
    if (window.ShoeZone.getWish().some(w => w.id === p.id)) wishBtn.classList.add('active');
    wishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.ShoeZone.toggleWishlist({ id: p.id, name: p.name, price: p.price, image: p.img }, wishBtn);
    });
  }

  renderProducts('#pd-related', PRODUCTS.filter(rp => rp.id !== p.id && rp.category === p.category).slice(0,4).length
    ? PRODUCTS.filter(rp => rp.id !== p.id && rp.category === p.category).slice(0,4)
    : PRODUCTS.filter(rp => rp.id !== p.id).slice(0,4));

  renderProducts('#pd-fbt', PRODUCTS.filter(rp => rp.id !== p.id).slice(4,7));
}
