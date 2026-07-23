/* ==========================================================
 * ALESSIA CAKE - DATA STATE, CONFIGURATION & PRINTER ENGINE
 * TRISULACODER v9.6 Enterprise Engine
 * ========================================================== */

let GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzX4rjfDx1V31yJsgoxHsnyA78EghxGTCnS7llUalyGClZEQNzYfaQvq5Egl-TL6mjJ/exec'; 

let currentRole = 'customer';
let currentTab = 'catalog';

let catalogFilter = {
  search: '',
  category: 'all',
  sort: 'default'
};

// Incoming Orders Hub Channel Filter State ('all', 'online', 'offline') 
let orderHubFilter = 'all';

// Toko Config for WhatsApp, Owner Profile, PIN, QRIS & Thermal Printer
const STORE_CONFIG = {
  owner_name: 'Pemilik Toko Alessia',
  phone: '6281298406844', // Nomor WhatsApp Toko Penerima Pesanan Online
  staff_pin: '123456',    // PIN Keamanan Login Staff/Owner
  location_name: 'Kab. Bekasi',
  printer_type: 'browser', // 'bluetooth', 'usb', 'browser'
  printer_paper: '58mm',    // '58mm', '80mm'
  qris_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ALESSIA-PINK-GLASS-QRIS'
};

// Load saved STORE_CONFIG if available in localStorage
try {
  const savedConfig = localStorage.getItem('ALESSIA_STORE_CONFIG');
  if (savedConfig) {
    const parsed = JSON.parse(savedConfig);
    if (parsed.owner_name) STORE_CONFIG.owner_name = parsed.owner_name;
    if (parsed.phone) STORE_CONFIG.phone = parsed.phone;
    if (parsed.staff_pin) STORE_CONFIG.staff_pin = parsed.staff_pin;
    if (parsed.location_name) STORE_CONFIG.location_name = parsed.location_name;
    if (parsed.printer_type) STORE_CONFIG.printer_type = parsed.printer_type;
    if (parsed.printer_paper) STORE_CONFIG.printer_paper = parsed.printer_paper;
  }
} catch(e) { console.error(e); }

let currentUser = {
  name: '',
  phone: '',
  role: 'customer',
  isLoggedIn: false
};

let appData = {
  products: [
    { product_id: 'PRD-01', category: 'Whole Cake', name: 'Pink Champagne Velvet', description: 'Kue red velvet lembut berbalut krim stroberi mawar dengan serbuk kilau rose gold.', base_price: 350000, image_url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?q=80&w=600', is_active: true, stock_qty: 12 },
    { product_id: 'PRD-02', category: 'Slice', name: 'Rose Petal Opera Slice', description: 'Kue lapis moka cokelat halus beraroma ekstrak mawar alami.', base_price: 45000, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600', is_active: true, stock_qty: 25 },
    { product_id: 'PRD-03', category: 'Pastry', name: 'Berry Glazed Croissant', description: 'Croissant renyah mentega Prancis dengan selai buah beri segar.', base_price: 28000, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600', is_active: true, stock_qty: 40 },
    { product_id: 'PRD-04', category: 'Whole Cake', name: 'Ruby Chocolate Ganache', description: 'Cokelat ruby merah muda alami dengan kelembutan krim vanilla bean.', base_price: 380000, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600', is_active: true, stock_qty: 8 }
  ],
  ingredients: [
    { ingredient_id: 'ING-01', name: 'Tepung Terigu Premium', current_stock: 45000, min_stock_alert: 5000, unit: 'gram', cost_per_unit: 15 },
    { ingredient_id: 'ING-02', name: 'Ruby Chocolate Bel', current_stock: 22000, min_stock_alert: 3000, unit: 'gram', cost_per_unit: 120 },
    { ingredient_id: 'ING-03', name: 'Mentega Prancis Pure Butter', current_stock: 15000, min_stock_alert: 2000, unit: 'gram', cost_per_unit: 45 },
    { ingredient_id: 'ING-04', name: 'Gula Halus Extra Fine', current_stock: 30000, min_stock_alert: 4000, unit: 'gram', cost_per_unit: 20 },
    { ingredient_id: 'ING-05', name: 'Stroberi Mawar Puree', current_stock: 10000, min_stock_alert: 1500, unit: 'ml', cost_per_unit: 60 }
  ],
  recipes: [
    {
      product_id: 'PRD-01',
      items: [
        { ingredient_id: 'ING-01', qty: 350 },
        { ingredient_id: 'ING-02', qty: 150 },
        { ingredient_id: 'ING-03', qty: 200 },
        { ingredient_id: 'ING-04', qty: 180 },
        { ingredient_id: 'ING-05', qty: 100 }
      ]
    },
    {
      product_id: 'PRD-02',
      items: [
        { ingredient_id: 'ING-01', qty: 50 },
        { ingredient_id: 'ING-02', qty: 30 },
        { ingredient_id: 'ING-03', qty: 25 }
      ]
    },
    {
      product_id: 'PRD-03',
      items: [
        { ingredient_id: 'ING-01', qty: 80 },
        { ingredient_id: 'ING-03', qty: 50 },
        { ingredient_id: 'ING-05', qty: 20 }
      ]
    },
    {
      product_id: 'PRD-04',
      items: [
        { ingredient_id: 'ING-01', qty: 300 },
        { ingredient_id: 'ING-02', qty: 250 },
        { ingredient_id: 'ING-03', qty: 180 }
      ]
    }
  ],
  orders: [
    { order_id: 'ORD-9901', order_type: 'Online (Web)', customer_name: 'Bina Santoso', customer_phone: '08123456789', table_no: '-', total_amount: 395000, dp_amount: 0, payment_status: 'PAID', order_status: 'Baking', reference_photo_url: '', created_at: new Date().toISOString(), pickup_delivery_date: '2026-06-07' },
    { order_id: 'ORD-9902', order_type: 'Offline (Kasir Toko)', customer_name: 'Pelanggan Walk-In', customer_phone: '08110000111', table_no: 'Meja 04', total_amount: 150000, dp_amount: 0, payment_status: 'PAID', order_status: 'Pending', reference_photo_url: '', created_at: new Date().toISOString(), pickup_delivery_date: '2026-06-07' }
  ],
  expenses: [
    { expense_id: 'EXP-1001', category: 'Bahan Baku', description: 'Beli Telur Ayam Fresh 15kg & Susu UHT', amount: 380000, date: new Date().toISOString() },
    { expense_id: 'EXP-1002', category: 'Operasional', description: 'Listrik PLN & Wifi Toko Harian', amount: 150000, date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { expense_id: 'EXP-1003', category: 'Kemasan', description: 'Beli Box Premium Pink Glass 100 Pcs', amount: 250000, date: new Date(Date.now() - 5 * 86400000).toISOString() }
  ],
  cart: []
};

const roleTabs = {
  owner: [
    { id: 'dashboard', name: 'Halaman Utama', icon: 'bar-chart-3' },
    { id: 'web_orders', name: 'Pesanan Online Masuk', icon: 'bell' },
    { id: 'offline_orders', name: 'Pesanan Offline', icon: 'calculator' },
    { id: 'kds', name: 'Selesaikan Pesanan', icon: 'chef-hat' },
    { id: 'catalog', name: 'Katalog Produk', icon: 'package' },
    { id: 'bom', name: 'Resep KUE', icon: 'book-open' },
    { id: 'update_stock', name: 'Stok Bahan-Bahan', icon: 'database' },
    { id: 'finance', name: 'Bank Alessia', icon: 'wallet' },
    { id: 'settings', name: 'Pengaturan Owner', icon: 'settings' }
  ],
  customer: [
    { id: 'catalog', name: 'Menu Utama', icon: 'shopping-bag' },
    { id: 'custom_builder', name: 'Custom Cake', icon: 'sliders' },
    { id: 'checkout', name: 'Keranjang', icon: 'shopping-cart' }
  ]
};

// Selected product state in BOM Manager
let activeBomProductId = 'PRD-01';

// Global Realtime Clock Timer Helper
window.initLuxuryClock = function() {
  if (window.clockTimerId) clearInterval(window.clockTimerId);
  
  function updateClock() {
    const timeEl = document.getElementById('luxury-clock-time');
    const dateEl = document.getElementById('luxury-clock-date');
    if (!timeEl || !dateEl) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    timeEl.innerText = timeStr;
    dateEl.innerText = `${STORE_CONFIG.location_name || 'Kab. Bekasi'} • ${dateStr}`;
  }

  updateClock();
  window.clockTimerId = setInterval(updateClock, 1000);
};

// Render Tab Pengaturan Owner (Settings View)
window.renderOwnerSettings = function(container) {
  let html = `
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="bg-white/80 p-6 md:p-8 rounded-3xl border border-pinkglass-200 glass-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-extrabold text-charcoal flex items-center gap-2">
            <i data-lucide="settings" class="w-6 h-6 text-pinkglass-600"></i>
            <span>Pengaturan & Konfigurasi Toko</span>
          </h2>
          <p class="text-xs md:text-sm text-pinkglass-800">Atur profil Pemilik, nomor WhatsApp tujuan pesanan, PIN staf, dan printer thermal POS.</p>
        </div>
        <span class="text-xs font-bold px-3.5 py-1.5 rounded-full bg-pinkglass-600 text-white shadow-xs">Akses Owner</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Card 1: Profil Owner & WhatsApp Order -->
        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-4 shadow-sm">
          <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3 flex items-center gap-2">
            <i data-lucide="user-check" class="w-5 h-5 text-pinkglass-600"></i>
            <span>Profil Toko & WhatsApp</span>
          </h3>

          <div class="space-y-3">
            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">Nama Owner / Pemilik Toko</label>
              <input type="text" id="setting-owner-name" value="${STORE_CONFIG.owner_name}" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-xs md:text-sm text-charcoal font-bold focus:ring-2 focus:ring-pinkglass-400">
            </div>

            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">Nomor WhatsApp Tujuan Order (Gunakan 62)</label>
              <input type="text" id="setting-store-phone" value="${STORE_CONFIG.phone}" placeholder="misal: 6281298406844" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-xs md:text-sm text-charcoal font-bold font-mono focus:ring-2 focus:ring-pinkglass-400">
              <p class="text-[10px] text-pinkglass-800 mt-1 font-medium">*Nomor ini menerima konfirmasi order WhatsApp dari web.</p>
            </div>

            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">Nama Lokasi / Kota Toko</label>
              <input type="text" id="setting-store-location" value="${STORE_CONFIG.location_name || 'Kab. Bekasi'}" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-xs md:text-sm text-charcoal font-bold focus:ring-2 focus:ring-pinkglass-400">
            </div>
          </div>
        </div>

        <!-- Card 2: PIN Keamanan Staff -->
        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-4 shadow-sm">
          <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3 flex items-center gap-2">
            <i data-lucide="shield-lock" class="w-5 h-5 text-pinkglass-600"></i>
            <span>Keamanan PIN Staf</span>
          </h3>

          <div class="space-y-3">
            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">PIN Keamanan Login Staf/Owner</label>
              <input type="password" id="setting-staff-pin" value="${STORE_CONFIG.staff_pin}" maxlength="6" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-xs md:text-sm text-charcoal font-bold text-center tracking-widest focus:ring-2 focus:ring-pinkglass-400">
              <p class="text-[10px] text-pinkglass-800 mt-1 font-medium">*Digunakan untuk login gerbang Owner/Staf Toko.</p>
            </div>

            <div class="bg-pinkglass-50/80 p-3.5 rounded-2xl border border-pinkglass-200/80 text-[11px] text-pinkglass-900 leading-relaxed space-y-1">
              <span class="font-bold block text-pinkglass-950">💡 Proteksi Data:</span>
              <p>Hanya Owner & Staf berwenang yang mengetahui PIN ini untuk mengakses Bank Alessia & Kasir POS.</p>
            </div>
          </div>
        </div>

        <!-- Card 3: Pengaturan Printer Thermal (Bluetooth & USB) -->
        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-4 shadow-sm flex flex-col justify-between">
          <div class="space-y-3">
            <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3 flex items-center gap-2">
              <i data-lucide="printer" class="w-5 h-5 text-pinkglass-600"></i>
              <span>Printer Thermal POS (Bluetooth/USB)</span>
            </h3>

            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">Tipe / Koneksi Printer</label>
              <select id="setting-printer-type" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-xs md:text-sm text-charcoal font-bold focus:ring-2 focus:ring-pinkglass-400">
                <option value="browser" ${STORE_CONFIG.printer_type === 'browser' ? 'selected' : ''}>🖨️ Thermal Auto Direct / Driver Windows/Mac</option>
                <option value="bluetooth" ${STORE_CONFIG.printer_type === 'bluetooth' ? 'selected' : ''}>📲 Web Bluetooth Thermal Printer (Wireless)</option>
                <option value="usb" ${STORE_CONFIG.printer_type === 'usb' ? 'selected' : ''}>🔌 WebUSB Thermal Printer (Kabel USB POS)</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">Ukuran Kertas Thermal Struk</label>
              <select id="setting-printer-paper" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-xs md:text-sm text-charcoal font-bold focus:ring-2 focus:ring-pinkglass-400">
                <option value="58mm" ${STORE_CONFIG.printer_paper === '58mm' ? 'selected' : ''}>58 mm (Struk Kasir Standar Kecil)</option>
                <option value="80mm" ${STORE_CONFIG.printer_paper === '80mm' ? 'selected' : ''}>80 mm (Struk Kasir Lebar/Besar)</option>
              </select>
            </div>

            <button type="button" onclick="window.testThermalPrinter()" class="w-full bg-charcoal hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center space-x-1.5 shadow-sm">
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>🧪 Tes Cetak Struk Thermal Dummy</span>
            </button>
          </div>

          <button onclick="window.saveOwnerSettings()" class="w-full bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-bold py-3.5 rounded-2xl text-xs md:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 mt-4">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

// Save Owner Settings Handler
window.saveOwnerSettings = function() {
  const nameEl = document.getElementById('setting-owner-name');
  const phoneEl = document.getElementById('setting-store-phone');
  const pinEl = document.getElementById('setting-staff-pin');
  const locEl = document.getElementById('setting-store-location');
  const printerTypeEl = document.getElementById('setting-printer-type');
  const printerPaperEl = document.getElementById('setting-printer-paper');

  if (nameEl && nameEl.value.trim()) STORE_CONFIG.owner_name = nameEl.value.trim();
  if (phoneEl && phoneEl.value.trim()) STORE_CONFIG.phone = phoneEl.value.trim().replace(/[^0-9]/g, '');
  if (pinEl && pinEl.value.trim()) STORE_CONFIG.staff_pin = pinEl.value.trim();
  if (locEl && locEl.value.trim()) STORE_CONFIG.location_name = locEl.value.trim();
  if (printerTypeEl) STORE_CONFIG.printer_type = printerTypeEl.value;
  if (printerPaperEl) STORE_CONFIG.printer_paper = printerPaperEl.value;

  // Save permanently to localStorage
  try {
    localStorage.setItem('ALESSIA_STORE_CONFIG', JSON.stringify(STORE_CONFIG));
  } catch(e) { console.error(e); }

  if (typeof window.showToast === 'function') {
    window.showToast('Pengaturan toko & printer berhasil disimpan!');
  }

  window.renderViewport();
};

// Universal Thermal Printer Receipt Print Engine
window.printThermalReceipt = function(orderObj = null) {
  const order = orderObj || {
    order_id: 'ORD-TEST-99',
    order_type: 'Offline (Kasir Tunai)',
    customer_name: 'Pelanggan Tes Struk',
    created_at: new Date().toISOString(),
    total_amount: 150000,
    items: [
      { name: 'Pink Champagne Velvet', qty: 1, price: 150000 }
    ]
  };

  const paperWidth = STORE_CONFIG.printer_paper || '58mm';
  const paperPx = paperWidth === '80mm' ? '300px' : '220px';

  const itemsHtml = (order.items && order.items.length > 0)
    ? order.items.map(i => `
        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
          <span>${i.name} (x${i.qty})</span>
          <span>Rp ${(i.price * i.qty).toLocaleString('id-ID')}</span>
        </div>
      `).join('')
    : `<div style="display:flex; justify-content:space-between;"><span>Total Belanja</span><span>Rp ${Number(order.total_amount).toLocaleString('id-ID')}</span></div>`;

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Struk Thermal - ${order.order_id}</title>
      <style>
        @page { size: ${paperWidth} auto; margin: 0; }
        body {
          font-family: 'Courier New', Courier, monospace;
          width: ${paperPx};
          padding: 8px;
          margin: 0 auto;
          font-size: 11px;
          color: #000;
          background: #fff;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 6px 0; }
      </style>
    </head>
    <body onload="window.print(); setTimeout(()=>window.close(), 800);">
      <div class="text-center bold" style="font-size: 14px;">ALESSIA CAKE</div>
      <div class="text-center" style="font-size: 9px;">Luxury Artisan Bakery</div>
      <div class="text-center" style="font-size: 9px;">${STORE_CONFIG.location_name || 'Kab. Bekasi'}</div>
      <div class="line"></div>
      <div>ID Order: <strong>${order.order_id}</strong></div>
      <div>Tanggal: ${new Date(order.created_at || Date.now()).toLocaleDateString('id-ID')} ${new Date(order.created_at || Date.now()).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</div>
      <div>Pelanggan: ${order.customer_name}</div>
      <div>Tipe: ${order.order_type}</div>
      <div class="line"></div>
      ${itemsHtml}
      <div class="line"></div>
      <div style="display:flex; justify-content:space-between; font-size:12px;" class="bold">
        <span>TOTAL:</span>
        <span>Rp ${Number(order.total_amount).toLocaleString('id-ID')}</span>
      </div>
      <div class="line"></div>
      <div class="text-center" style="margin-top:8px; font-size:10px;">
        *** TERIMA KASIH ***<br>
        Manis Di Setiap Momen ✨
      </div>
    </body>
    </html>
  `;

  // Handle Web Bluetooth Thermal Printer Connection if selected
  if (STORE_CONFIG.printer_type === 'bluetooth' && navigator.bluetooth) {
    if (typeof window.showToast === 'function') window.showToast('Mencari printer thermal Bluetooth...');
    navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '00001101-0000-1000-8000-00805f9b34fb']
    }).then(device => {
      if (typeof window.showToast === 'function') window.showToast(`Terhubung ke ${device.name || 'Printer Thermal'}! Mencetak...`);
    }).catch(err => {
      console.warn('Bluetooth print fallback to standard dialog:', err);
      openPrintWindow(receiptHtml);
    });
  } else {
    openPrintWindow(receiptHtml);
  }

  function openPrintWindow(html) {
    const pWin = window.open('', '_blank', `width=350,height=500`);
    if (pWin) {
      pWin.document.write(html);
      pWin.document.close();
    } else {
      if (typeof window.showToast === 'function') window.showToast('Izin popup diblokir browser, tidak dapat mencetak.');
    }
  }
};

window.testThermalPrinter = function() {
  window.printThermalReceipt({
    order_id: 'TEST-POS-' + Math.floor(1000 + Math.random() * 9000),
    order_type: 'Offline (Tes Printer)',
    customer_name: 'Pelanggan Tes Thermal',
    created_at: new Date().toISOString(),
    total_amount: 380000,
    items: [
      { name: 'Pink Champagne Velvet', qty: 1, price: 350000 },
      { name: 'Berry Croissant', qty: 1, price: 30000 }
    ]
  });
};

// Global Viewport Router Handler Guaranteeing Settings Tab Availability
window.renderViewport = function() {
  const vp = document.getElementById('main-viewport');
  if (!vp) return;
  
  if (window.kdsIntervalId) {
    clearInterval(window.kdsIntervalId);
    window.kdsIntervalId = null;
  }

  if (window.dashboardClockInterval) {
    clearInterval(window.dashboardClockInterval);
    window.dashboardClockInterval = null;
  }

  if (currentRole === 'customer') {
    if (currentTab === 'catalog' && typeof window.renderCustomerCatalog === 'function') window.renderCustomerCatalog(vp);
    else if (currentTab === 'custom_builder' && typeof window.renderCustomBuilder === 'function') window.renderCustomBuilder(vp);
    else if (currentTab === 'checkout' && typeof window.renderCheckout === 'function') window.renderCheckout(vp);
  } else {
    if (currentTab === 'dashboard' && typeof window.renderDashboard === 'function') window.renderDashboard(vp);
    else if (currentTab === 'offline_orders' && typeof window.renderPOS === 'function') window.renderPOS(vp);
    else if (currentTab === 'web_orders' && typeof window.renderWebOrders === 'function') window.renderWebOrders(vp);
    else if (currentTab === 'kds' && typeof window.renderKDS === 'function') window.renderKDS(vp);
    else if (currentTab === 'catalog' && typeof window.renderCustomerCatalog === 'function') window.renderCustomerCatalog(vp);
    else if (currentTab === 'bom' && typeof window.renderBOMViewer === 'function') window.renderBOMViewer(vp);
    else if (currentTab === 'update_stock' && typeof window.renderUpdateStock === 'function') window.renderUpdateStock(vp);
    else if (currentTab === 'finance' && typeof window.renderFinanceManager === 'function') window.renderFinanceManager(vp);
    else if (currentTab === 'settings' && typeof window.renderOwnerSettings === 'function') window.renderOwnerSettings(vp);
    else if (currentTab === 'audit' && typeof window.renderAudit === 'function') window.renderAudit(vp);
  }
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
};
