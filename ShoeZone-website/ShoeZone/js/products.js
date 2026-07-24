/* ============================================================
   SHOEZONE — Product catalog (demo data) + card renderer
   ============================================================ */

const PRODUCTS = [
  { id:'sz-001', name:'Air Prestige Runner', brand:'Aurelio', category:'Running', gender:'Men', price:189, oldPrice:240, rating:4.8, reviews:214, stock:true, img:'images/shoe-1.svg', colors:['#0a0a0a','#d4af37','#f6f4ee'], sizes:[7,8,9,10,11], trending:true, bestSeller:true, newArrival:false, flash:true },
  { id:'sz-002', name:'Onyx Court Basketball', brand:'Vantage', category:'Basketball', gender:'Men', price:215, oldPrice:0, rating:4.6, reviews:132, stock:true, img:'images/shoe-1.svg', colors:['#0a0a0a','#8a6c22'], sizes:[8,9,10,11,12], trending:true, bestSeller:false, newArrival:true, flash:false },
  { id:'sz-003', name:'Gold Line Formal Oxford', brand:'Marchetti', category:'Formal', gender:'Men', price:260, oldPrice:310, rating:4.9, reviews:98, stock:true, img:'images/shoe-1.svg', colors:['#1b1b1b','#8a6c22'], sizes:[7,8,9,10], trending:false, bestSeller:true, newArrival:false, flash:true },
  { id:'sz-004', name:'Trail Ridge Boot', brand:'NORDIQ', category:'Boots', gender:'Men', price:230, oldPrice:0, rating:4.7, reviews:156, stock:true, img:'images/shoe-2.svg', colors:['#0a0a0a','#4a3a1a'], sizes:[8,9,10,11], trending:true, bestSeller:true, newArrival:false, flash:false },
  { id:'sz-005', name:'Velocity Street Sneaker', brand:'Kōra', category:'Sneakers', gender:'Women', price:175, oldPrice:210, rating:4.5, reviews:87, stock:true, img:'images/shoe-1.svg', colors:['#d4af37','#f6f4ee'], sizes:[5,6,7,8,9], trending:true, bestSeller:false, newArrival:true, flash:true },
  { id:'sz-006', name:'Studio Slide Sandal', brand:'Solstice', category:'Sandals', gender:'Women', price:95, oldPrice:120, rating:4.3, reviews:64, stock:true, img:'images/shoe-3.svg', colors:['#0a0a0a','#d4af37'], sizes:[5,6,7,8], trending:false, bestSeller:false, newArrival:true, flash:true },
  { id:'sz-007', name:'Aria Heel Sneaker', brand:'Kōra', category:'Casual', gender:'Women', price:198, oldPrice:0, rating:4.6, reviews:73, stock:false, img:'images/shoe-1.svg', colors:['#f6f4ee','#0a0a0a'], sizes:[5,6,7,8,9], trending:false, bestSeller:true, newArrival:false, flash:false },
  { id:'sz-008', name:'Comet Kids Trainer', brand:'Aurelio', category:'Kids', gender:'Kids', price:79, oldPrice:99, rating:4.7, reviews:41, stock:true, img:'images/shoe-1.svg', colors:['#d4af37','#0a0a0a'], sizes:[1,2,3,4], trending:false, bestSeller:false, newArrival:true, flash:false },
  { id:'sz-009', name:'Ridgeline Hiking Boot', brand:'NORDIQ', category:'Boots', gender:'Men', price:255, oldPrice:290, rating:4.8, reviews:120, stock:true, img:'images/shoe-2.svg', colors:['#1b1b1b'], sizes:[8,9,10,11,12], trending:false, bestSeller:true, newArrival:false, flash:false },
  { id:'sz-010', name:'Pitch Football Cleat', brand:'Vantage', category:'Football', gender:'Men', price:165, oldPrice:0, rating:4.4, reviews:58, stock:true, img:'images/shoe-1.svg', colors:['#0a0a0a','#d4af37'], sizes:[7,8,9,10,11], trending:true, bestSeller:false, newArrival:true, flash:false },
  { id:'sz-011', name:'Riviera Sandal', brand:'Solstice', category:'Sandals', gender:'Men', price:88, oldPrice:0, rating:4.2, reviews:33, stock:true, img:'images/shoe-3.svg', colors:['#8a6c22'], sizes:[8,9,10,11], trending:false, bestSeller:false, newArrival:false, flash:true },
  { id:'sz-012', name:'Manor Formal Loafer', brand:'Marchetti', category:'Formal', gender:'Men', price:245, oldPrice:275, rating:4.7, reviews:91, stock:true, img:'images/shoe-1.svg', colors:['#1b1b1b','#4a3a1a'], sizes:[7,8,9,10,11], trending:false, bestSeller:true, newArrival:false, flash:false },
];

function starString(rating) {
  const full = Math.round(rating);
  return '★★★★★☆'.slice(5 - full, 10 - full) + '★★★★★'.slice(0,0); // safe fallback below
}
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let s = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) s += '★';
    else if (i === full && half) s += '★';
    else s += '☆';
  }
  return s;
}

function productCard(p) {
  const discount = p.oldPrice ? Math.round(100 - (p.price / p.oldPrice * 100)) : 0;
  return `
  <div class="product-card reveal in">
    <div class="product-thumb">
      <a href="product-details.html?id=${p.id}">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </a>
      ${discount ? `<span class="badge-discount">-${discount}%</span>` : ''}
      <span class="badge-stock ${p.stock ? 'in' : ''}">${p.stock ? 'In Stock' : 'Sold Out'}</span>
      <div class="thumb-actions">
        <button class="btn-icon wishlist-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.img}" title="Add to wishlist"><i class="bi bi-heart"></i></button>
        <button class="btn-icon" title="Quick view" data-bs-toggle="modal" data-bs-target="#quickViewModal" onclick="openQuickView('${p.id}')"><i class="bi bi-eye"></i></button>
        <button class="btn-icon" title="Share" onclick="shareProduct('${p.id}')"><i class="bi bi-share"></i></button>
      </div>
      <div class="quick-add">
        <button class="btn btn-gold btn-ripple" data-add-cart data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.img}" ${!p.stock ? 'disabled' : ''}>
          ${p.stock ? '<i class="bi bi-bag-plus me-1"></i> Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
    <div class="product-info">
      <span class="brand">${p.brand}</span>
      <h3><a href="product-details.html?id=${p.id}" style="color:inherit;">${p.name}</a></h3>
      <div class="rating-row"><span class="stars">${renderStars(p.rating)}</span><span class="count">${p.rating} (${p.reviews})</span></div>
      <div class="price-row">
        <span class="now">$${p.price}</span>
        ${p.oldPrice ? `<span class="old">$${p.oldPrice}</span>` : ''}
      </div>
      <div class="swatches">
        ${p.colors.map((c,i) => `<span class="swatch ${i===0?'selected':''}" style="background:${c}" title="Color"></span>`).join('')}
      </div>
    </div>
  </div>`;
}

function renderProducts(selector, list) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (!list.length) { el.innerHTML = `<div class="empty-state"><div class="icon"><i class="bi bi-emoji-frown"></i></div><h3>No products found</h3><p>Try adjusting your filters.</p></div>`; return; }
  el.innerHTML = list.map(productCard).join('');
}

function getProductById(id) { return PRODUCTS.find(p => p.id === id); }

function openQuickView(id) {
  const p = getProductById(id);
  if (!p) return;
  const modal = document.getElementById('quickViewModal');
  if (!modal) return;
  modal.querySelector('.qv-img').src = p.img;
  modal.querySelector('.qv-brand').textContent = p.brand;
  modal.querySelector('.qv-name').textContent = p.name;
  modal.querySelector('.qv-price').textContent = '$' + p.price;
  modal.querySelector('.qv-old').textContent = p.oldPrice ? '$' + p.oldPrice : '';
  modal.querySelector('.qv-stars').textContent = renderStars(p.rating);
  modal.querySelector('.qv-count').textContent = `${p.rating} (${p.reviews} reviews)`;
  const addBtn = modal.querySelector('.qv-add');
  addBtn.dataset.id = p.id; addBtn.dataset.name = p.name; addBtn.dataset.price = p.price; addBtn.dataset.image = p.img;
  const link = modal.querySelector('.qv-link'); if (link) link.href = 'product-details.html?id=' + p.id;
}

function shareProduct(id) {
  const p = getProductById(id);
  const url = location.origin + location.pathname.replace(/[^/]*$/, '') + 'product-details.html?id=' + id;
  if (navigator.share) navigator.share({ title: p.name, url });
  else { navigator.clipboard?.writeText(url); window.ShoeZone?.showToast('Link copied to clipboard'); }
}
