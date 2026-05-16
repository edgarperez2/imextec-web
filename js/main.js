/* ════════════════════════════════════════
   IMEXTEC · main.js
   ════════════════════════════════════════ */

/* ── CARRITO (localStorage) ── */
const CART_KEY = 'imextec_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(name, price, emoji, brand) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.name === name);
  if (idx > -1) {
    cart[idx].qty++;
  } else {
    cart.push({ name: name || 'Producto', price: Number(price) || 0, emoji: emoji || '📦', brand: brand || '', qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  openCartDrawer();
}

function removeFromCart(idx) {
  const cart = getCart();
  cart.splice(idx, 1);
  saveCart(cart);
  renderCartItems();
  updateCartUI();
}

function updateCartQty(idx, delta) {
  const cart = getCart();
  if (!cart[idx]) return;
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(cart);
  renderCartItems();
  updateCartUI();
}

function clearCart() {
  if (!confirm('¿Seguro que quieres vaciar el carrito?')) return;
  saveCart([]);
  renderCartItems();
  updateCartUI();
}

function updateCartUI() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.querySelectorAll('#cart-count, .cart-badge').forEach(el => el.textContent = count);
  document.querySelectorAll('#cart-total').forEach(el => {
    el.textContent = count > 0 ? '$' + total.toLocaleString('es-CL') : '';
  });
}

function renderCartItems() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  const cart = getCart();
  const itemsEl   = document.getElementById('cartItems');
  const emptyEl   = document.getElementById('cartEmpty');
  const footerEl  = document.getElementById('cartFooter');
  const countEl   = document.getElementById('cdCount');

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (countEl) countEl.textContent = count + (count === 1 ? ' producto' : ' productos');

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    emptyEl.style.display  = '';
    footerEl.style.display = 'none';
    return;
  }
  emptyEl.style.display  = 'none';
  footerEl.style.display = '';

  itemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="ci-emoji">${item.emoji}</div>
      <div class="ci-info">
        <div class="ci-brand">${item.brand}</div>
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">$${(item.price * item.qty).toLocaleString('es-CL')}
          ${item.qty > 1 ? `<span class="ci-unit">($${item.price.toLocaleString('es-CL')} c/u)</span>` : ''}
        </div>
      </div>
      <div class="ci-right">
        <div class="ci-qty">
          <button onclick="updateCartQty(${i},-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateCartQty(${i},1)">+</button>
        </div>
        <button class="ci-remove" onclick="removeFromCart(${i})" title="Eliminar">🗑️</button>
      </div>
    </div>
  `).join('');

  document.getElementById('cdSubtotal').textContent = '$' + total.toLocaleString('es-CL');
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  renderCartItems();
  drawer.classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function injectCartDrawer() {
  if (document.getElementById('cartDrawer')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="cartOverlay" onclick="closeCartDrawer()"></div>
    <div id="cartDrawer">
      <div class="cd-header">
        <span class="cd-title">🛒 Tu Carrito</span>
        <button class="cd-close" onclick="closeCartDrawer()">✕</button>
      </div>
      <div class="cd-count" id="cdCount">0 productos</div>
      <div id="cartEmpty" class="cd-empty">
        <div class="cd-empty-ico">🛒</div>
        <div class="cd-empty-ttl">Tu carrito está vacío</div>
        <div class="cd-empty-sub">Agrega productos para comenzar</div>
      </div>
      <div id="cartItems" class="cd-items"></div>
      <div id="cartFooter" class="cd-footer" style="display:none">
        <div class="cd-subtotal">
          <span class="cd-subtotal-lbl">Subtotal</span>
          <span class="cd-subtotal-val" id="cdSubtotal">$0</span>
        </div>
        <div class="cd-shipping">✅ Despacho gratis incluido</div>
        <button class="btn-checkout">Ir al pago →</button>
        <button class="btn-keep-shopping" onclick="closeCartDrawer()">Seguir comprando</button>
        <button class="btn-clear-cart" onclick="clearCart()">🗑️ Vaciar carrito</button>
      </div>
    </div>
  `);
}

/* ── HERO SLIDER ── */
(function() {
  const slides = document.querySelectorAll('.hero-slide-img');
  const dots   = document.querySelectorAll('.dot-btn[data-index]');
  const prev   = document.getElementById('sliderPrev');
  const next   = document.getElementById('sliderNext');
  const pp     = document.getElementById('sliderPlayPause');
  if (!slides.length) return;

  let current = 0, playing = true, timer;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }
  function startAuto() { clearInterval(timer); timer = setInterval(() => goTo(current + 1), 4000); }
  function stopAuto()  { clearInterval(timer); }

  if (prev) prev.addEventListener('click', () => { goTo(current - 1); if (playing) startAuto(); });
  if (next) next.addEventListener('click', () => { goTo(current + 1); if (playing) startAuto(); });
  dots.forEach(d => d.addEventListener('click', function() { goTo(+this.dataset.index); if (playing) startAuto(); }));
  if (pp) pp.addEventListener('click', () => {
    playing = !playing;
    pp.textContent = playing ? '⏸' : '▶';
    pp.title = playing ? 'Pausar' : 'Reproducir';
    playing ? startAuto() : stopAuto();
  });
  startAuto();
})();

/* ── SIDEBAR ACORDEÓN ── */
document.querySelectorAll('.sb-item .sb-toggle').forEach(btn => {
  btn.addEventListener('click', function() {
    const submenu = this.nextElementSibling;
    const isOpen  = this.classList.contains('open');
    document.querySelectorAll('.sb-toggle.open').forEach(b => {
      b.classList.remove('open');
      b.nextElementSibling?.classList.remove('open');
    });
    if (!isOpen) {
      this.classList.add('open');
      submenu?.classList.add('open');
    }
  });
});

/* ── DROPDOWNS CATEGORÍAS ── */
document.querySelectorAll('.cnav-item').forEach(item => {
  const dropdown = item.querySelector('.cnav-dropdown');
  if (!dropdown) return;
  item.addEventListener('mouseenter', () => {
    const rect = item.getBoundingClientRect();
    dropdown.style.top  = rect.bottom + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.classList.add('open');
  });
  item.addEventListener('mouseleave', () => dropdown.classList.remove('open'));
});

/* ── WISHLIST ── */
document.querySelectorAll('.wish').forEach(b => {
  b.addEventListener('click', function() {
    if (this.textContent === '♡') { this.textContent = '♥'; this.style.color = '#e53e3e'; }
    else { this.textContent = '♡'; this.style.color = ''; }
  });
});

/* ── NAVBAR ACTIVE ── */
document.querySelectorAll('.cnav-link').forEach(l => {
  l.addEventListener('click', function(e) {
    if (this.classList.contains('has-drop')) return;
    e.preventDefault();
    document.querySelectorAll('.cnav-link').forEach(x => x.classList.remove('active'));
    if (!this.classList.contains('oferta')) this.classList.add('active');
  });
});

/* ── TAB PILLS ── */
document.querySelectorAll('.tab-pill').forEach(p => {
  p.addEventListener('click', function() {
    document.querySelectorAll('.tab-pill').forEach(x => x.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ── DOT BUTTONS ── */
document.querySelectorAll('.dot-btn:not([data-index])').forEach((d, i, arr) => {
  d.addEventListener('click', function() {
    arr.forEach(x => x.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ── ADD TO CART (botones en grillas de productos) ── */
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    const card   = this.closest('.prod-card');
    const name   = card?.querySelector('.prod-name')?.textContent?.trim()   || 'Producto';
    const brand  = card?.querySelector('.prod-brand')?.textContent?.trim()  || '';
    const ptxt   = card?.querySelector('.prod-price')?.textContent || '$0';
    const price  = parseInt(ptxt.replace(/\D/g, '')) || 0;
    const imgDiv = card?.querySelector('.prod-img');
    const emoji  = imgDiv ? ([...imgDiv.childNodes].find(n => n.nodeType === 3 && n.textContent.trim())?.textContent?.trim() || '📦') : '📦';

    addToCart(name, price, emoji, brand);

    const orig = this.textContent;
    this.textContent = '✔ Agregado!';
    this.style.background = 'var(--green)';
    setTimeout(() => { this.textContent = orig; this.style.background = ''; }, 1600);
  });
});

/* ── CART BUTTON → abrir drawer ── */
document.querySelectorAll('.cart-btn').forEach(btn => {
  btn.addEventListener('click', openCartDrawer);
});

/* ── INIT ── */
injectCartDrawer();
updateCartUI();
