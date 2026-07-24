/* ============================================================
   SHOEZONE — main.js
   Shared behaviour: navbar, mobile menu, cart/wishlist state,
   reveal animations, toasts, countdown, product interactions.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Page Loader ---------- */
  const loader = document.querySelector('.loader-screen');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hide'), 350);
    });
    // fallback in case load already fired
    setTimeout(() => loader.classList.add('hide'), 1800);
  }

  /* ---------- Navbar scroll state ---------- */
  const navbar = document.querySelector('.sz-navbar');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    const backBtn = document.getElementById('back-to-top');
    if (backBtn) backBtn.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---------- Mobile menu ---------- */
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const closeMobile = () => { mobileMenu?.classList.remove('open'); mobileOverlay?.classList.remove('show'); };
  mobileToggle?.addEventListener('click', () => {
    mobileMenu?.classList.add('open');
    mobileOverlay?.classList.add('show');
  });
  mobileOverlay?.addEventListener('click', closeMobile);
  document.querySelector('.mobile-menu .mm-close')?.addEventListener('click', closeMobile);

  /* ---------- Back to top ---------- */
  document.getElementById('back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Button ripple ---------- */
  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Search suggestions ---------- */
  const searchInput = document.querySelector('.nav-search input');
  const suggestions = document.querySelector('.search-suggestions');
  const catalog = ['Air Prestige Runner', 'Onyx Court Basketball', 'Gold Line Formal Oxford', 'Trail Ridge Boot', 'Velocity Sneaker', 'Studio Sandal', 'Kids Comet Trainer', 'Women Aria Heel Sneaker'];
  if (searchInput && suggestions) {
    searchInput.addEventListener('input', () => {
      const val = searchInput.value.trim().toLowerCase();
      if (!val) { suggestions.classList.remove('show'); return; }
      const matches = catalog.filter(p => p.toLowerCase().includes(val)).slice(0, 5);
      suggestions.innerHTML = matches.length
        ? matches.map(m => `<a href="shop.html">${m}</a>`).join('')
        : `<a href="#">No results for "${val}"</a>`;
      suggestions.classList.add('show');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-search')) suggestions.classList.remove('show');
    });
  }

  /* ================== CART + WISHLIST STATE ================== */
  const CART_KEY = 'shoezone_cart';
  const WISH_KEY = 'shoezone_wishlist';

  const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const setCart = (c) => { localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCounts(); };
  const getWish = () => JSON.parse(localStorage.getItem(WISH_KEY) || '[]');
  const setWish = (w) => { localStorage.setItem(WISH_KEY, JSON.stringify(w)); updateCounts(); };

  function updateCounts() {
    const cartCount = getCart().reduce((sum, i) => sum + i.qty, 0);
    const wishCount = getWish().length;
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = cartCount);
    document.querySelectorAll('.wishlist-count').forEach(el => el.textContent = wishCount);
  }
  updateCounts();

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(i => i.id === product.id && i.size === product.size);
    if (existing) existing.qty += product.qty || 1;
    else cart.push({ ...product, qty: product.qty || 1 });
    setCart(cart);
    showToast(`${product.name} added to cart`);
  }

  function toggleWishlist(product, btn) {
    let wish = getWish();
    const idx = wish.findIndex(i => i.id === product.id);
    if (idx > -1) {
      wish.splice(idx, 1);
      btn?.classList.remove('active');
      showToast(`Removed from wishlist`);
    } else {
      wish.push(product);
      btn?.classList.add('active');
      showToast(`${product.name} added to wishlist`);
    }
    setWish(wish);
  }

  // Wire up "Add to cart" buttons declared with data-attributes
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addToCart({
        id: btn.dataset.id || btn.dataset.addCart,
        name: btn.dataset.name || 'ShoeZone Product',
        price: parseFloat(btn.dataset.price || '0'),
        image: btn.dataset.image || 'images/placeholder.svg',
        size: btn.dataset.size || '—',
        qty: 1
      });
    });
  });

  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = btn.dataset.id;
    if (id && getWish().some(w => w.id === id)) btn.classList.add('active');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleWishlist({
        id: btn.dataset.id,
        name: btn.dataset.name || 'ShoeZone Product',
        price: parseFloat(btn.dataset.price || '0'),
        image: btn.dataset.image || 'images/placeholder.svg'
      }, btn);
    });
  });

  window.ShoeZone = window.ShoeZone || {};
  Object.assign(window.ShoeZone, { getCart, setCart, getWish, setWish, addToCart, toggleWishlist, showToast: (...a) => showToast(...a) });

  /* ---------- Toast ---------- */
  function showToast(message) {
    let toast = document.querySelector('.sz-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'sz-toast';
      toast.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg><span></span>`;
      document.body.appendChild(toast);
    }
    toast.querySelector('span').textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ---------- Quantity selectors ---------- */
  document.querySelectorAll('.qty-select').forEach(box => {
    const input = box.querySelector('input');
    box.querySelector('.qty-minus')?.addEventListener('click', () => {
      input.value = Math.max(1, (parseInt(input.value) || 1) - 1);
      box.dispatchEvent(new Event('change', { bubbles: true }));
    });
    box.querySelector('.qty-plus')?.addEventListener('click', () => {
      input.value = (parseInt(input.value) || 1) + 1;
      box.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  /* ---------- Size / colour chip selection ---------- */
  document.querySelectorAll('.size-row, .color-row').forEach(row => {
    row.addEventListener('click', (e) => {
      const chip = e.target.closest('.size-chip, .color-chip');
      if (!chip || chip.classList.contains('disabled')) return;
      row.querySelectorAll('.size-chip, .color-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  /* ---------- Product gallery (product details page) ---------- */
  const mainImg = document.querySelector('.pd-gallery-main img');
  document.querySelectorAll('.pd-thumbs button').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.pd-thumbs button').forEach(b => b.classList.remove('active'));
      t.classList.add('active');
      if (mainImg) mainImg.src = t.querySelector('img').src;
    });
  });
  document.querySelector('.pd-gallery-main')?.addEventListener('click', function () {
    this.classList.toggle('zoomed');
  });

  /* ---------- Countdown timers (flash sale) ---------- */
  document.querySelectorAll('.countdown').forEach(cd => {
    const end = Date.now() + (parseInt(cd.dataset.hours || '48') * 3600 * 1000);
    const dEl = cd.querySelector('.d'), hEl = cd.querySelector('.h'), mEl = cd.querySelector('.m'), sEl = cd.querySelector('.s');
    function tick() {
      let diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      if (dEl) dEl.textContent = String(d).padStart(2, '0');
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
    }
    tick();
    setInterval(tick, 1000);
  });

  /* ---------- Checkout: payment method selection ---------- */
  const cardFields = document.getElementById('card-fields');
  document.querySelectorAll('.pay-option').forEach((opt, idx) => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input[type="radio"]').checked = true;
      if (cardFields) cardFields.style.display = (idx === 1 || idx === 3) ? 'flex' : 'none';
    });
  });
  if (cardFields) cardFields.style.display = 'none';

  /* ---------- Cookie consent ---------- */
  const cookieBar = document.querySelector('.cookie-bar');
  if (cookieBar) {
    if (!localStorage.getItem('shoezone_cookie_ok')) {
      setTimeout(() => cookieBar.classList.add('show'), 1200);
    }
    cookieBar.querySelector('.cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem('shoezone_cookie_ok', '1');
      cookieBar.classList.remove('show');
    });
    cookieBar.querySelector('.cookie-decline')?.addEventListener('click', () => {
      cookieBar.classList.remove('show');
    });
  }

  /* ---------- Newsletter popup (once per session) ---------- */
  const nlModalEl = document.getElementById('newsletterModal');
  if (nlModalEl && !sessionStorage.getItem('shoezone_nl_shown') && window.bootstrap) {
    setTimeout(() => {
      new bootstrap.Modal(nlModalEl).show();
      sessionStorage.setItem('shoezone_nl_shown', '1');
    }, 6000);
  }

  /* ---------- Newsletter form submit (any page) ---------- */
  document.querySelectorAll('.newsletter-form, .newsletter-modal-form').forEach(f => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Subscribed! Welcome to the inner circle.');
      f.reset();
      const modalInstance = bootstrap?.Modal?.getInstance(nlModalEl);
      modalInstance?.hide();
    });
  });

  /* ---------- Generic contact / auth form submits (UI demo) ---------- */
  document.querySelectorAll('form[data-demo-submit]').forEach(f => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast(f.dataset.demoSubmit || 'Submitted successfully');
    });
  });

  /* ---------- Set active nav link ---------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

});
