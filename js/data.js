/* ==========================================================
 * ALESSIA CAKE - DATA STATE & CONFIGURATION (JS)
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

// Toko Config for WhatsApp, Owner Profile, PIN & QRIS (Dynamic Settings)
const STORE_CONFIG = {
  owner_name: 'Pemilik Toko Alessia',
  phone: '6281298406844', // Nomor WhatsApp Toko Penerima Pesanan Online
  staff_pin: '123456',    // PIN Keamanan Login Staff/Owner
  location_name: 'Kab. Bekasi',
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
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="bg-white/80 p-6 md:p-8 rounded-3xl border border-pinkglass-200 glass-card shadow-sm flex items-center justify-between">
        <div>
          <h2 class="text-xl md:text-2xl font-extrabold text-charcoal flex items-center gap-2">
            <i data-lucide="settings" class="w-6 h-6 text-pinkglass-600"></i>
            <span>Pengaturan & Konfigurasi Toko</span>
          </h2>
          <p class="text-xs md:text-sm text-pinkglass-800">Atur profil Pemilik, nomor WhatsApp tujuan pesanan online, dan PIN keamanan staf.</p>
        </div>
        <span class="text-xs font-bold px-3 py-1.5 rounded-full bg-pinkglass-600 text-white shadow-xs">Akses Owner</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Card 1: Profil Owner & WhatsApp Order -->
        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-4 shadow-sm">
          <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3 flex items-center gap-2">
            <i data-lucide="user-check" class="w-5 h-5 text-pinkglass-600"></i>
            <span>Profil Toko & WhatsApp Tujuan</span>
          </h3>

          <div class="space-y-3">
            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">Nama Owner / Pemilik Toko</label>
              <input type="text" id="setting-owner-name" value="${STORE_CONFIG.owner_name}" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-xs md:text-sm text-charcoal font-bold focus:ring-2 focus:ring-pinkglass-400">
            </div>

            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">Nomor WhatsApp Tujuan Order (Gunakan 62)</label>
              <input type="text" id="setting-store-phone" value="${STORE_CONFIG.phone}" placeholder="misal: 6281298406844" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-xs md:text-sm text-charcoal font-bold font-mono focus:ring-2 focus:ring-pinkglass-400">
              <p class="text-[10px] text-pinkglass-800 mt-1 font-medium">*Nomor ini akan menerima seluruh notifikasi order WhatsApp dari web checkout.</p>
            </div>

            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">Nama Lokasi / Kota Toko</label>
              <input type="text" id="setting-store-location" value="${STORE_CONFIG.location_name || 'Kab. Bekasi'}" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-xs md:text-sm text-charcoal font-bold focus:ring-2 focus:ring-pinkglass-400">
            </div>
          </div>
        </div>

        <!-- Card 2: PIN Keamanan Staff -->
        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-4 shadow-sm flex flex-col justify-between">
          <div class="space-y-4">
            <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3 flex items-center gap-2">
              <i data-lucide="shield-lock" class="w-5 h-5 text-pinkglass-600"></i>
              <span>Keamanan PIN Staf & Owner</span>
            </h3>

            <div class="space-y-3">
              <div>
                <label class="text-xs font-bold text-pinkglass-900 block mb-1">PIN Keamanan Login Staf/Owner</label>
                <input type="password" id="setting-staff-pin" value="${STORE_CONFIG.staff_pin}" maxlength="6" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-xs md:text-sm text-charcoal font-bold text-center tracking-widest focus:ring-2 focus:ring-pinkglass-400">
                <p class="text-[10px] text-pinkglass-800 mt-1 font-medium">*PIN digunakan untuk verifikasi login gerbang Owner/Staf Toko.</p>
              </div>

              <div class="bg-pinkglass-50/80 p-3.5 rounded-2xl border border-pinkglass-200/80 text-[11px] text-pinkglass-900 leading-relaxed space-y-1">
                <span class="font-bold block text-pinkglass-950">💡 Tips Keamanan:</span>
                <p>Pastikan PIN hanya diketahui oleh Owner dan Staf yang berwenang untuk mengakses laporan Bank Alessia & KDS Dapur.</p>
              </div>
            </div>
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

  if (nameEl && nameEl.value.trim()) STORE_CONFIG.owner_name = nameEl.value.trim();
  if (phoneEl && phoneEl.value.trim()) STORE_CONFIG.phone = phoneEl.value.trim().replace(/[^0-9]/g, '');
  if (pinEl && pinEl.value.trim()) STORE_CONFIG.staff_pin = pinEl.value.trim();
  if (locEl && locEl.value.trim()) STORE_CONFIG.location_name = locEl.value.trim();

  // Save permanently to localStorage
  try {
    localStorage.setItem('ALESSIA_STORE_CONFIG', JSON.stringify(STORE_CONFIG));
  } catch(e) { console.error(e); }

  if (typeof window.showToast === 'function') {
    window.showToast('Pengaturan toko berhasil diperbarui!');
  }

  window.renderViewport();
};
