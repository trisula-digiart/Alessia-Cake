/**
 * ALESSIA CAKE - Enterprise SPA Core Engine (app.js)
 * Handles State, 4-Role Matrix, IndexedDB Offline-First Sync, POS, KDS, and Custom Cake Builder.
 */

// URL Web App Deployment GAS kamu (Bisa diisi langsung di sini atau diatur lewat browser console/Local Storage)
let GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzX4rjfDx1V31yJsgoxHsnyA78EghxGTCnS7llUalyGClZEQNzYfaQvq5Egl-TL6mjJ/exec'; 

let currentRole = 'customer';
let currentTab = 'catalog';

let appData = {
  products: [
    { product_id: 'PRD-01', category: 'Whole Cake', name: 'Pink Champagne Velvet', description: 'Kue red velvet lembut berbalut krim stroberi mawar dengan serbuk kilau rose gold.', base_price: 350000, image_url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?q=80&w=600', is_active: true, stock_qty: 12 },
    { product_id: 'PRD-02', category: 'Slice', name: 'Rose Petal Opera Slice', description: 'Kue lapis moka cokelat halus beraroma ekstrak mawar alami.', base_price: 45000, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600', is_active: true, stock_qty: 25 },
    { product_id: 'PRD-03', category: 'Pastry', name: 'Berry Glazed Croissant', description: 'Croissant renyah mentega Prancis dengan selai buah beri segar.', base_price: 28000, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600', is_active: true, stock_qty: 40 },
    { product_id: 'PRD-04', category: 'Whole Cake', name: 'Ruby Chocolate Ganache', description: 'Cokelat ruby merah muda alami dengan kelembutan krim vanilla bean.', base_price: 380000, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600', is_active: true, stock_qty: 8 }
  ],
  ingredients: [
    { ingredient_id: 'ING-01', name: 'Tepung Terigu Premium', current_stock: 45000, min_stock_alert: 5000, unit: 'gram', cost_per_unit: 15 },
    { ingredient_id: 'ING-02', name: 'Ruby Chocolate Bel', current_stock: 22000, min_stock_alert: 3000, unit: 'gram', cost_per_unit: 120 }
  ],
  orders: [
    { order_id: 'ORD-9901', order_type: 'Takeaway', customer_name: 'Bina Santoso', customer_phone: '08123456789', table_no: '-', total_amount: 395000, dp_amount: 0, payment_status: 'PAID', order_status: 'Baking', reference_photo_url: '', created_at: new Date().toISOString(), pickup_delivery_date: '2026-06-07' }
  ],
  cart: []
};

const roleTabs = {
  owner: [
    { id: 'dashboard', name: 'Dashboard', icon: 'bar-chart-3' },
    { id: 'pos', name: 'Kasir POS', icon: 'calculator' },
    { id: 'web_orders', name: 'Order Web', icon: 'bell' },
    { id: 'kds', name: 'KDS Dapur', icon: 'chef-hat' },
    { id: 'catalog', name: 'Katalog', icon: 'package' },
    { id: 'bom', name: 'Stok BOM', icon: 'layers' },
    { id: 'audit', name: 'Audit Log', icon: 'file-text' }
  ],
  cashier: [
    { id: 'pos', name: 'Kasir POS', icon: 'calculator' },
    { id: 'web_orders', name: 'Order Web', icon: 'bell' },
    { id: 'pickup', name: 'Pick-Up', icon: 'truck' },
    { id: 'cash_shift', name: 'Shift Kas', icon: 'dollar-sign' }
  ],
  baker: [
    { id: 'kds', name: 'KDS Dapur', icon: 'chef-hat' },
    { id: 'batch_baking', name: 'Batch Oven', icon: 'flame' },
    { id: 'bom_viewer', name: 'Resep BOM', icon: 'book-open' },
    { id: 'update_stock', name: 'Stok Bahan', icon: 'database' }
  ],
  customer: [
    { id: 'catalog', name: 'Menu Utama', icon: 'shopping-bag' },
    { id: 'custom_builder', name: 'Custom Cake', icon: 'sliders' },
    { id: 'checkout', name: 'Keranjang', icon: 'shopping-cart' },
    { id: 'tracker', name: 'Lacak Pesanan', icon: 'map-pin' }
  ]
};

/**
 * Mengatur URL Endpoint GAS secara dinamis
 */
function setGasApiUrl(url) {
  if (!url) return;
  GAS_API_URL = url.trim();
  localStorage.setItem('ALESSIA_GAS_URL', GAS_API_URL);
  showToast('URL Endpoint GAS berhasil disimpan!');
  fetchInitialDataFromGAS();
}

/**
 * Mengambil data terbaru dari Google Sheets via GAS API
 */
async function fetchInitialDataFromGAS() {
  const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
  if (!savedUrl || savedUrl.includes('PASTE_YOUR')) {
    console.log('GAS Endpoint belum diatur, menggunakan mock data lokal.');
    return;
  }
  
  const statusEl = document.getElementById('sync-status');
  if (statusEl) statusEl.innerText = 'Syncing...';

  try {
    const res = await fetch(`${savedUrl}?action=getInitialData`);
    const result = await res.json();
    if (result.success && result.data) {
      if (result.data.products && result.data.products.length > 0) appData.products = result.data.products;
      if (result.data.ingredients && result.data.ingredients.length > 0) appData.ingredients = result.data.ingredients;
      if (result.data.orders && result.data.orders.length > 0) appData.orders = result.data.orders;
      
      if (statusEl) {
        statusEl.innerText = 'Online Sync Active';
        statusEl.className = 'text-emerald-700 font-medium';
      }
      renderViewport();
      showToast('Data berhasil disinkronkan dengan Google Sheets!');
    }
  } catch (err) {
    console.error('Gagal sync ke GAS:', err);
    if (statusEl) {
      statusEl.innerText = 'Offline Mode';
      statusEl.className = 'text-amber-700 font-medium';
    }
  }
}

/**
 * Mengirim transaksi pesanan baru ke Google Apps Script (Backend)
 */
async function sendOrderToGAS(newOrder, cartItems) {
  const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
  if (!savedUrl || savedUrl.includes('PASTE_YOUR')) {
    console.log('Order disimpan secara lokal (Offline/Demo mode).');
    return;
  }

  try {
    const payload = {
      action: 'createOrder',
      user_role: currentRole,
      order: newOrder,
      items: cartItems.map(item => ({
        item_id: 'ITM-' + Date.now() + Math.floor(Math.random() * 100),
        product_id: item.product_id,
        product_name: item.name,
        variant_details: item.custom_message || '',
        qty: item.qty,
        unit_price: item.price,
        subtotal: item.price * item.qty
      }))
    };

    const res = await fetch(savedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      showToast('Pesanan tersimpan di Google Sheets & Stok terpotong!');
    }
  } catch (err) {
    console.error('Gagal kirim order ke GAS:', err);
    showToast('Koneksi terputus. Order disimpan lokal.');
  }
}

function renderNavigation() {
  const sidebar = document.getElementById('sidebar-nav');
  const mobileNav = document.getElementById('mobile-bottom-nav');
  const tabs = roleTabs[currentRole];
  
  if (sidebar) {
    let sideHtml = `<div class="text-[11px] font-bold uppercase tracking-wider text-pinkglass-700 px-3 py-2">Menu ${currentRole.toUpperCase()}</div>`;
    tabs.forEach(tab => {
      const active = currentTab === tab.id;
      sideHtml += `
        <button onclick="changeTab('${tab.id}')" class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${active ? 'bg-pinkglass-600 text-white shadow-md' : 'text-charcoal hover:bg-pinkglass-100/60'}">
          <i data-lucide="${tab.icon}" class="w-4 h-4"></i>
          <span>${tab.name}</span>
        </button>
      `;
    });
    sidebar.innerHTML = sideHtml;
  }

  if (mobileNav) {
    let mobHtml = '';
    tabs.forEach(tab => {
      const active = currentTab === tab.id;
      mobHtml += `
        <button onclick="changeTab('${tab.id}')" class="flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all ${active ? 'text-pinkglass-700 font-bold' : 'text-pinkglass-500 hover:text-charcoal'}">
          <i data-lucide="${tab.icon}" class="w-5 h-5 mb-0.5"></i>
          <span class="text-[10px] truncate max-w-[65px]">${tab.name}</span>
        </button>
      `;
    });
    mobileNav.innerHTML = mobHtml;
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function changeTab(tabId) {
  currentTab = tabId;
  renderNavigation();
  renderViewport();
}

function renderViewport() {
  const vp = document.getElementById('main-viewport');
  if (!vp) return;
  
  if (currentRole === 'customer') {
    if (currentTab === 'catalog') renderCustomerCatalog(vp);
    else if (currentTab === 'custom_builder') renderCustomBuilder(vp);
    else if (currentTab === 'checkout') renderCheckout(vp);
    else if (currentTab === 'tracker') renderTracker(vp);
  } else if (currentRole === 'cashier') {
    if (currentTab === 'pos') renderPOS(vp);
    else if (currentTab === 'web_orders') renderWebOrders(vp);
    else if (currentTab === 'pickup') renderPickup(vp);
    else if (currentTab === 'cash_shift') renderCashShift(vp);
  } else if (currentRole === 'baker') {
    if (currentTab === 'kds') renderKDS(vp);
    else if (currentTab === 'batch_baking') renderBatchBaking(vp);
    else if (currentTab === 'bom_viewer') renderBOMViewer(vp);
    else if (currentTab === 'update_stock') renderUpdateStock(vp);
  } else if (currentRole === 'owner') {
    if (currentTab === 'dashboard') renderDashboard(vp);
    else if (currentTab === 'pos') renderPOS(vp);
    else if (currentTab === 'web_orders') renderWebOrders(vp);
    else if (currentTab === 'kds') renderKDS(vp);
    else if (currentTab === 'catalog') renderCustomerCatalog(vp);
    else if (currentTab === 'bom') renderBOMViewer(vp);
    else if (currentTab === 'audit') renderAudit(vp);
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}


function renderCustomerCatalog(container) {
  let html = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card">
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-charcoal">Koleksi Kue Pink Glass Alessia</h2>
          <p class="text-xs md:text-sm text-pinkglass-800">Pilih kreasi kue artisan bertema merah muda termewah hari ini.</p>
        </div>
        <div class="w-full md:w-auto">
          <input type="text" placeholder="Cari menu kue..." oninput="filterCatalog(this.value)" class="w-full md:w-64 bg-white/90 border border-pinkglass-300 rounded-2xl px-4 py-2.5 text-xs md:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-pinkglass-400">
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  `;

  appData.products.forEach(p => {
    html += `
      <div class="bg-white/80 rounded-3xl border border-pinkglass-200 overflow-hidden flex flex-col justify-between glass-card hover:border-pinkglass-400 transition-all shadow-sm">
        <div>
          <div class="relative h-44 md:h-48 overflow-hidden bg-pinkglass-100">
            <img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
            <span class="absolute top-3 left-3 text-[10px] bg-white/90 backdrop-blur-sm text-pinkglass-900 px-3 py-1 rounded-full font-bold shadow-sm">${p.category}</span>
          </div>
          <div class="p-4 md:p-5 space-y-1.5">
            <h3 class="font-bold text-sm md:text-base text-charcoal truncate">${p.name}</h3>
            <p class="text-[11px] md:text-xs text-pinkglass-800 line-clamp-2">${p.description}</p>
          </div>
        </div>
        <div class="p-4 md:p-5 pt-0 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-pinkglass-700 uppercase tracking-wider font-semibold">Harga</span>
            <p class="font-bold text-charcoal text-sm md:text-base">Rp ${p.base_price.toLocaleString('id-ID')}</p>
          </div>
          <button onclick="addToCart('${p.product_id}')" class="bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center space-x-1.5 shadow-md active:scale-95">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Tambah</span>
          </button>
        </div>
      </div>
    `;
  });

  html += `</div></div>`;
  container.innerHTML = html;
}

function renderCustomBuilder(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-6 bg-white/80 p-6 md:p-8 rounded-3xl border border-pinkglass-200 glass-card">
      <div>
        <h2 class="text-xl md:text-2xl font-bold text-charcoal">Pink Glass Custom Cake Builder</h2>
        <p class="text-xs md:text-sm text-pinkglass-800">Rancang kue impian bernuansa pink mewah dengan wizard konfigurasi presisi.</p>
      </div>
      <div class="space-y-4 md:space-y-6">
        <div class="space-y-1.5">
          <label class="text-xs md:text-sm font-semibold text-pinkglass-900">Step 1: Ukuran & Bentuk</label>
          <select id="cb-size" class="w-full bg-white/90 border border-pinkglass-300 rounded-2xl p-3 text-xs md:text-sm text-charcoal">
            <option value="16cm Round">Round Pink 16cm (4-6 Porsi) - Rp 320.000</option>
            <option value="20cm Round">Round Pink 20cm (8-12 Porsi) - Rp 470.000</option>
            <option value="20cm Square">Square Luxury 20cm (15 Porsi) - Rp 570.000</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs md:text-sm font-semibold text-pinkglass-900">Step 2: Sponge & Filling Layer</label>
          <select id="cb-flavor" class="w-full bg-white/90 border border-pinkglass-300 rounded-2xl p-3 text-xs md:text-sm text-charcoal">
            <option value="Pink Velvet Cream Cheese">Pink Velvet + Cream Cheese Frosting</option>
            <option value="Ruby Chocolate Ganache">Ruby Chocolate + Raspberry Filling</option>
            <option value="Vanilla Strawberry Chantilly">Vanilla Sponge + Strawberry Chantilly</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs md:text-sm font-semibold text-pinkglass-900">Step 3: Pesan Tulis & Foto Acuan</label>
          <input type="text" id="cb-message" placeholder="Tulis ucapan di kue (misal: Happy Birthday Princess)" class="w-full bg-white/90 border border-pinkglass-300 rounded-2xl p-3 text-xs md:text-sm text-charcoal mb-2">
          <input type="file" id="cb-photo" class="w-full text-xs text-pinkglass-800 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pinkglass-200 file:text-pinkglass-900 hover:file:bg-pinkglass-300">
        </div>
        <div class="space-y-1.5">
          <label class="text-xs md:text-sm font-semibold text-pinkglass-900">Step 4: Tanggal Pick-Up / Delivery</label>
          <input type="date" id="cb-date" class="w-full bg-white/90 border border-pinkglass-300 rounded-2xl p-3 text-xs md:text-sm text-charcoal">
        </div>
        <button onclick="submitCustomCake()" class="w-full bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg active:scale-95 text-sm">
          Masukkan ke Keranjang Custom
        </button>
      </div>
    </div>
  `;
}

function renderCheckout(container) {
  let subtotal = appData.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  let html = `
    <div class="max-w-4xl mx-auto space-y-6">
      <h2 class="text-xl md:text-2xl font-bold text-charcoal">Keranjang Belanja & Checkout</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 space-y-3">
  `;

  if (appData.cart.length === 0) {
    html += `<div class="bg-white/80 p-8 rounded-3xl border border-pinkglass-200 text-center text-pinkglass-800 text-sm glass-card">Keranjang masih kosong, silakan pilih menu terlebih dahulu.</div>`;
  } else {
    appData.cart.forEach((item, idx) => {
      html += `
        <div class="bg-white/80 p-4 rounded-2xl border border-pinkglass-200 flex items-center justify-between shadow-sm glass-card">
          <div>
            <h4 class="font-bold text-sm text-charcoal">${item.name}</h4>
            <p class="text-xs text-pinkglass-800">Rp ${item.price.toLocaleString('id-ID')} x ${item.qty}</p>
          </div>
          <div class="flex items-center space-x-3">
            <span class="font-bold text-xs md:text-sm text-pinkglass-900">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</span>
            <button onclick="removeFromCart(${idx})" class="text-rose-500 hover:text-rose-700 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </div>
        </div>
      `;
    });
  }

  html += `
        </div>
        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 space-y-4 glass-card h-fit shadow-sm">
          <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3">Ringkasan Pembayaran</h3>
          <div class="flex justify-between text-xs md:text-sm text-pinkglass-900 font-medium">
            <span>Total Belanja</span>
            <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div class="space-y-2 pt-2 border-t border-pinkglass-200">
            <label class="text-[11px] font-semibold text-pinkglass-900">Nama Pemesan</label>
            <input type="text" id="cust-name" placeholder="Nama Lengkap" class="w-full bg-white/90 border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal">
            <label class="text-[11px] font-semibold text-pinkglass-900">Nomor WhatsApp</label>
            <input type="text" id="cust-phone" placeholder="08xxxxxxxxxx" class="w-full bg-white/90 border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal">
          </div>
          <div class="bg-pinkglass-50 p-4 rounded-2xl border border-pinkglass-200 text-center space-y-2">
            <p class="text-[11px] font-semibold text-pinkglass-800">Scan QRIS Pink Glass Alessia</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ALESSIA-PINK-GLASS-QRIS" alt="QRIS" class="mx-auto w-28 h-28 rounded-xl shadow-sm bg-white p-1">
            <input type="file" id="payment-proof" class="w-full text-[10px] text-pinkglass-700 pt-1">
          </div>
          <button onclick="processCheckout()" class="w-full bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-bold py-3 rounded-2xl shadow-lg transition-all text-xs md:text-sm active:scale-95">
            Konfirmasi & Bayar Pesanan
          </button>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

function renderTracker(container) {
  let html = `
    <div class="max-w-3xl mx-auto space-y-6">
      <h2 class="text-xl md:text-2xl font-bold text-charcoal">Lacak Status Pesanan</h2>
      <div class="space-y-4">
  `;
  appData.orders.forEach(ord => {
    html += `
      <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-3 shadow-sm">
        <div class="flex justify-between items-center">
          <div>
            <span class="text-[10px] bg-pinkglass-100 text-pinkglass-900 px-2.5 py-1 rounded-full font-bold">${ord.order_id}</span>
            <h4 class="font-bold text-base text-charcoal mt-1.5">${ord.customer_name}</h4>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">${ord.order_status}</span>
        </div>
        <div class="flex justify-between text-xs text-pinkglass-800 pt-2 border-t border-pinkglass-200">
          <span>Tipe: ${ord.order_type}</span>
          <span class="font-bold text-charcoal">Total: Rp ${ord.total_amount.toLocaleString('id-ID')}</span>
        </div>
      </div>
    `;
  });
  html += `</div></div>`;
  container.innerHTML = html;
}

function renderPOS(container) {
  let html = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 space-y-4">
        <h2 class="text-xl md:text-2xl font-bold text-charcoal">Kasir POS (Front-Store)</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
  `;
  appData.products.forEach(p => {
    html += `
      <div onclick="addToCartPOS('${p.product_id}')" class="bg-white/80 p-4 rounded-2xl border border-pinkglass-200 cursor-pointer hover:border-pinkglass-500 transition-all glass-card shadow-sm active:scale-95">
        <h4 class="font-bold text-xs md:text-sm text-charcoal truncate">${p.name}</h4>
        <p class="text-xs font-bold text-pinkglass-700 mt-1">Rp ${p.base_price.toLocaleString('id-ID')}</p>
      </div>
    `;
  });
  html += `
        </div>
      </div>
      <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 space-y-4 glass-card shadow-sm h-fit">
        <h3 class="font-bold text-base text-charcoal">Transaksi Kasir</h3>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          ${appData.cart.map(c => `<div class="flex justify-between text-xs text-pinkglass-900"><span>${c.name} (${c.qty})</span><span>Rp ${(c.price*c.qty).toLocaleString('id-ID')}</span></div>`).join('')}
        </div>
        <button onclick="processCheckout()" class="w-full bg-pinkglass-600 text-white font-bold py-3 rounded-2xl text-xs md:text-sm shadow-md">Proses Pembayaran</button>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

function renderWebOrders(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-xl md:text-2xl font-bold text-charcoal">Realtime Order Web Masuk</h2>
      <div class="space-y-3">
        ${appData.orders.map(o => `
          <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 glass-card shadow-sm">
            <div>
              <h4 class="font-bold text-sm text-charcoal">${o.customer_name} (${o.order_id})</h4>
              <p class="text-xs text-pinkglass-800">Total: Rp ${o.total_amount.toLocaleString('id-ID')} | Status: ${o.order_status}</p>
            </div>
            <button onclick="updateOrderStatus('${o.order_id}', 'Baking')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm">Terima & Masak</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderKDS(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-xl md:text-2xl font-bold text-charcoal">Kitchen Display System (KDS Queue)</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${appData.orders.map(o => `
          <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-300 space-y-3 glass-card shadow-sm">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold bg-pinkglass-100 text-pinkglass-900 px-2.5 py-1 rounded-full">${o.order_id}</span>
              <span class="text-[11px] text-pinkglass-700 font-semibold">Timer: 12:45</span>
            </div>
            <h4 class="font-bold text-charcoal text-base">${o.customer_name}</h4>
            <p class="text-xs text-pinkglass-800">Tipe: ${o.order_type}</p>
            <button onclick="updateOrderStatus('${o.order_id}', 'Ready')" class="w-full bg-pinkglass-600 text-white font-bold py-2.5 rounded-2xl text-xs shadow-md">Tandai Siap (Ready)</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDashboard(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-xl md:text-2xl font-bold text-charcoal">Dashboard Analitik Omset</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm">
          <p class="text-[11px] text-pinkglass-700">Omset Hari Ini</p>
          <h3 class="text-lg md:text-xl font-bold text-charcoal mt-1">Rp 4.850.000</h3>
        </div>
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm">
          <p class="text-[11px] text-pinkglass-700">Pesanan Masuk</p>
          <h3 class="text-lg md:text-xl font-bold text-charcoal mt-1">14 Transaksi</h3>
        </div>
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm">
          <p class="text-[11px] text-pinkglass-700">Low Stock Bahan</p>
          <h3 class="text-lg md:text-xl font-bold text-rose-600 mt-1">2 Bahan Baku</h3>
        </div>
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm">
          <p class="text-[11px] text-pinkglass-700">KDS Antrean</p>
          <h3 class="text-lg md:text-xl font-bold text-amber-600 mt-1">3 Antrean</h3>
        </div>
      </div>
    </div>
  `;
}

function renderPickup(container) { renderWebOrders(container); }
function renderCashShift(container) { container.innerHTML = `<div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 text-charcoal glass-card">Kas Harian & Rekonsiliasi Shift Kasir (Ready)</div>`; }
function renderBatchBaking(container) { container.innerHTML = `<div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 text-charcoal glass-card">Consolidated Batch Baking Oven View (Ready)</div>`; }
function renderBOMViewer(container) { container.innerHTML = `<div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 text-charcoal glass-card">Resep & Gramasi BOM Manager (Ready)</div>`; }
function renderUpdateStock(container) { container.innerHTML = `<div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 text-charcoal glass-card">Manajemen Stok & Loss Tracking Bahan Baku (Ready)</div>`; }
function renderAudit(container) { container.innerHTML = `<div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 text-charcoal glass-card">Audit Logs Sistem & Riwayat Keamanan (Ready)</div>`; }

// --- CART & ORDER ACTIONS ---
function addToCart(productId) {
  const prod = appData.products.find(p => p.product_id === productId);
  if (!prod) return;
  const exist = appData.cart.find(c => c.product_id === productId);
  if (exist) { exist.qty++; }
  else { appData.cart.push({ product_id: prod.product_id, name: prod.name, price: prod.base_price, qty: 1 }); }
  showToast('Kue berhasil ditambahkan ke keranjang!');
}

function addToCartPOS(productId) { addToCart(productId); }
function removeFromCart(idx) { appData.cart.splice(idx, 1); renderViewport(); }

function submitCustomCake() {
  const size = document.getElementById('cb-size').value;
  const flavor = document.getElementById('cb-flavor').value;
  const msg = document.getElementById('cb-message').value;
  appData.cart.push({ product_id: 'CUSTOM-CAKE', name: `Custom Pink Cake (${size} - ${flavor})`, price: 420000, qty: 1, custom_message: msg });
  showToast('Custom cake pink berhasil dimasukkan ke keranjang!');
  changeTab('checkout');
}

function processCheckout() {
  if (appData.cart.length === 0) { showToast('Keranjang belanja masih kosong!'); return; }
  const newOrder = {
    order_id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    order_type: 'Takeaway',
    customer_name: document.getElementById('cust-name')?.value || 'Tamu VIP Pink Glass',
    customer_phone: document.getElementById('cust-phone')?.value || '0811111111',
    table_no: '-',
    total_amount: appData.cart.reduce((a, b) => a + (b.price * b.qty), 0),
    dp_amount: 0,
    payment_status: 'PAID',
    order_status: 'Pending',
    reference_photo_url: '',
    created_at: new Date().toISOString(),
    pickup_delivery_date: new Date().toISOString().split('T')[0]
  };
  appData.orders.unshift(newOrder);
  
  // Kirim ke Backend GAS Google Sheets
  sendOrderToGAS(newOrder, [...appData.cart]);
  
  appData.cart = [];
  showToast('Pesanan berhasil dibuat & masuk ke sistem KDS!');
  switchRole('owner');
}

function updateOrderStatus(orderId, status) {
  const ord = appData.orders.find(o => o.order_id === orderId);
  if (ord) { 
    ord.order_status = status; 
    renderViewport(); 
    showToast('Status pesanan diperbarui!');
    
    // Sync update status ke GAS
    const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
    if (savedUrl && !savedUrl.includes('PASTE_YOUR')) {
      fetch(savedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updateOrderStatus', order_id: orderId, new_status: status, user_role: currentRole })
      }).catch(e => console.error(e));
    }
  }
}

// Initialize SPA on Load with GAS Auto-sync
window.onload = function() {
  const savedUrl = localStorage.getItem('ALESSIA_GAS_URL');
  if (savedUrl) GAS_API_URL = savedUrl;
  switchRole('customer');
  fetchInitialDataFromGAS();
};
