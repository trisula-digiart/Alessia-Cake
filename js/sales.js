/* ==========================================================
 * ALESSIA CAKE - SALES, CATALOG, POS & ORDERS HUB MANAGER (JS)
 * TRISULACODER v9.6 Enterprise Engine
 * ========================================================== */

window.setCatalogSearch = function(query) {
  catalogFilter.search = query;
  window.renderViewport();
};

window.setCatalogCategory = function(category) {
  catalogFilter.category = category;
  window.renderViewport();
};

window.setCatalogSort = function(sortType) {
  catalogFilter.sort = sortType;
  window.renderViewport();
};

window.renderCustomerCatalog = function(container) {
  const isOwner = (currentRole === 'owner');

  let html = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <div class="flex flex-col gap-4 bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-charcoal">Koleksi Kue Pink Glass Alessia</h2>
            <p class="text-xs md:text-sm text-pinkglass-800">Pilih kreasi kue artisan bertema merah muda termewah hari ini.</p>
          </div>
          ${isOwner ? `
            <button onclick="window.openProductModal()" class="bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center space-x-2 shadow-md active:scale-95">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>+ Tambah Produk Baru</span>
            </button>
          ` : ''}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-pinkglass-100">
          <div>
            <input type="text" value="${catalogFilter.search}" placeholder="Cari menu kue..." oninput="window.setCatalogSearch(this.value)" class="w-full bg-white/90 border border-pinkglass-300 rounded-2xl px-4 py-2.5 text-xs md:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-pinkglass-400">
          </div>
          <div>
            <select onchange="window.setCatalogCategory(this.value)" class="w-full bg-white/90 border border-pinkglass-300 rounded-2xl px-3 py-2.5 text-xs md:text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-pinkglass-400">
              <option value="all" ${catalogFilter.category === 'all' ? 'selected' : ''}>Semua Kategori</option>
              <option value="Whole Cake" ${catalogFilter.category === 'Whole Cake' ? 'selected' : ''}>Whole Cake</option>
              <option value="Slice" ${catalogFilter.category === 'Slice' ? 'selected' : ''}>Slice Cake</option>
              <option value="Pastry" ${catalogFilter.category === 'Pastry' ? 'selected' : ''}>Pastry</option>
              <option value="Cookies" ${catalogFilter.category === 'Cookies' ? 'selected' : ''}>Cookies</option>
              <option value="Drink" ${catalogFilter.category === 'Drink' ? 'selected' : ''}>Drink</option>
            </select>
          </div>
          <div>
            <select onchange="window.setCatalogSort(this.value)" class="w-full bg-white/90 border border-pinkglass-300 rounded-2xl px-3 py-2.5 text-xs md:text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-pinkglass-400">
              <option value="default" ${catalogFilter.sort === 'default' ? 'selected' : ''}>Urutkan: Default</option>
              <option value="price_asc" ${catalogFilter.sort === 'price_asc' ? 'selected' : ''}>Harga: Termurah → Termahal</option>
              <option value="price_desc" ${catalogFilter.sort === 'price_desc' ? 'selected' : ''}>Harga: Termahal → Termurah</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  `;

  let displayProducts = appData.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(catalogFilter.search.toLowerCase()) || 
                          p.category.toLowerCase().includes(catalogFilter.search.toLowerCase());
    const matchesCategory = catalogFilter.category === 'all' || p.category === catalogFilter.category;
    return matchesSearch && matchesCategory;
  });

  if (catalogFilter.sort === 'price_asc') {
    displayProducts.sort((a, b) => Number(a.base_price) - Number(b.base_price));
  } else if (catalogFilter.sort === 'price_desc') {
    displayProducts.sort((a, b) => Number(b.base_price) - Number(a.base_price));
  }

  if (displayProducts.length === 0) {
    html += `
      <div class="col-span-full bg-white/80 p-8 rounded-3xl border border-pinkglass-200 text-center text-pinkglass-800 text-sm glass-card">
        Tidak ada produk yang sesuai dengan filter atau pencarian.
      </div>
    `;
  } else {
    displayProducts.forEach(p => {
      html += `
        <div class="bg-white/80 rounded-3xl border border-pinkglass-200 overflow-hidden flex flex-col justify-between glass-card hover:border-pinkglass-400 transition-all shadow-sm">
          <div>
            <div class="relative h-44 md:h-48 overflow-hidden bg-pinkglass-100">
              <img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600'">
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
              <p class="font-bold text-charcoal text-sm md:text-base">Rp ${Number(p.base_price).toLocaleString('id-ID')}</p>
            </div>
            ${isOwner ? `
              <button onclick="window.openProductModal('${p.product_id}')" class="bg-charcoal hover:bg-black text-white font-semibold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center space-x-1.5 shadow-md active:scale-95">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                <span>Edit Produk</span>
              </button>
            ` : `
              <button onclick="window.addToCart('${p.product_id}')" class="bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center space-x-1.5 shadow-md active:scale-95">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>Tambah</span>
              </button>
            `}
          </div>
        </div>
      `;
    });
  }

  html += `</div></div>`;
  container.innerHTML = html;
};

window.addToCart = function(productId) {
  const prod = appData.products.find(p => p.product_id === productId);
  if (!prod) return;
  const exist = appData.cart.find(c => c.product_id === productId);
  if (exist) { exist.qty++; }
  else { appData.cart.push({ product_id: prod.product_id, name: prod.name, price: prod.base_price, qty: 1 }); }
  if (typeof window.showToast === 'function') window.showToast('Kue berhasil ditambahkan ke keranjang!');
};

window.addToCartPOS = function(productId) { 
  window.addToCart(productId); 
  window.renderViewport();
};

window.removeFromCart = function(idx) { 
  appData.cart.splice(idx, 1); 
  window.renderViewport(); 
};

window.renderCustomBuilder = function(container) {
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
        <button onclick="window.submitCustomCake()" class="w-full bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg active:scale-95 text-sm">
          Masukkan ke Keranjang Custom
        </button>
      </div>
    </div>
  `;
};

window.submitCustomCake = function() {
  const sizeEl = document.getElementById('cb-size');
  const flavorEl = document.getElementById('cb-flavor');
  const msgEl = document.getElementById('cb-message');

  const size = sizeEl ? sizeEl.value : '16cm Round';
  const flavor = flavorEl ? flavorEl.value : 'Pink Velvet';
  const msg = msgEl ? msgEl.value : '';

  appData.cart.push({ product_id: 'CUSTOM-CAKE', name: `Custom Pink Cake (${size} - ${flavor})`, price: 420000, qty: 1, custom_message: msg });
  if (typeof window.showToast === 'function') window.showToast('Custom cake pink berhasil dimasukkan ke keranjang!');
  window.changeTab('checkout');
};

window.renderCheckout = function(container) {
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
            <button onclick="window.removeFromCart(${idx})" class="text-rose-500 hover:text-rose-700 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
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
            <input type="text" id="cust-name" value="${currentUser.name || ''}" placeholder="Nama Lengkap" class="w-full bg-white/90 border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal">
            <label class="text-[11px] font-semibold text-pinkglass-900">Nomor WhatsApp</label>
            <input type="text" id="cust-phone" value="${currentUser.phone || ''}" placeholder="08xxxxxxxxxx" class="w-full bg-white/90 border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal">
            
            <label class="text-[11px] font-semibold text-pinkglass-900 block pt-1">Metode Pembayaran</label>
            <select id="cust-payment-method" class="w-full bg-white/90 border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal font-bold">
              <option value="Online (QRIS/Transfer)">📱 Transfer QRIS / Bank Transfer</option>
              <option value="Online (Bayar di Tempat / COD)">💵 Bayar di Tempat (COD Saat Pick-Up)</option>
            </select>
          </div>
          
          <!-- Locked QRIS Display -->
          <div class="bg-pinkglass-50 p-4 rounded-2xl border border-pinkglass-200 text-center space-y-2 relative overflow-hidden">
            <p class="text-[11px] font-bold text-pinkglass-900">Scan QRIS Pink Glass Alessia</p>
            <img src="${(typeof STORE_CONFIG !== 'undefined' && STORE_CONFIG.qris_image_url) ? STORE_CONFIG.qris_image_url : 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ALESSIA-PINK-GLASS-QRIS'}" alt="QRIS Resmi Alessia Cake" class="mx-auto w-32 h-32 rounded-xl shadow-md bg-white p-1.5 border border-pinkglass-200">
            <p class="text-[10px] text-pinkglass-800 font-medium pt-1">Transfer via QRIS atau pilih Bayar di Tempat (COD) saat pengambilan.</p>
          </div>

          <button onclick="window.processCheckout()" class="w-full bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all text-xs md:text-sm active:scale-95 flex items-center justify-center space-x-2">
            <span>Konfirmasi & Bayar Pesanan Web</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
};

window.processCheckout = function() {
  if (appData.cart.length === 0) { 
    if (typeof window.showToast === 'function') window.showToast('Keranjang belanja masih kosong!'); 
    return; 
  }
  
  const custNameEl = document.getElementById('cust-name');
  const custPhoneEl = document.getElementById('cust-phone');
  const payMethodEl = document.getElementById('cust-payment-method');

  const selectedMethod = payMethodEl ? payMethodEl.value : 'Online (QRIS/Transfer)';
  const orderType = (currentTab === 'offline_orders' || currentRole === 'owner') ? 'Offline (Kasir Toko)' : selectedMethod;
  const cartItemsCopy = [...appData.cart];

  const newOrder = {
    order_id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    order_type: orderType,
    customer_name: (custNameEl && custNameEl.value) || currentUser.name || (orderType.includes('Offline') ? 'Pelanggan Walk-In' : 'Tamu VIP Web'),
    customer_phone: (custPhoneEl && custPhoneEl.value) || currentUser.phone || '0811111111',
    table_no: '-',
    total_amount: appData.cart.reduce((a, b) => a + (b.price * b.qty), 0),
    dp_amount: 0,
    payment_status: orderType.includes('COD') ? 'UNPAID' : 'PAID',
    order_status: 'Pending',
    reference_photo_url: '',
    created_at: new Date().toISOString(),
    pickup_delivery_date: new Date().toISOString().split('T')[0],
    items: cartItemsCopy
  };

  // Lock polling sync to preserve local state write
  if (typeof window.lockSync === 'function') window.lockSync(10000);

  // Auto deduct ingredients according to BOM recipes
  if (typeof window.autoDeductIngredients === 'function') {
    window.autoDeductIngredients([...cartItemsCopy]);
  }

  appData.orders.unshift(newOrder);

  // Perbarui indikator badge sidebar secara instan
  if (typeof window.renderNavigation === 'function') window.renderNavigation();

  if (typeof window.sendOrderToGAS === 'function') {
    window.sendOrderToGAS(newOrder, [...cartItemsCopy]);
  }
  appData.cart = [];

  if (orderType.includes('Offline')) {
    if (typeof window.showToast === 'function') window.showToast(`Pesanan Offline berhasil dibuat & stok bahan terpotong otomatis!`);
    window.changeTab('web_orders');
  } else {
    // Show Confirmation Modal for Online Web Order
    window.openOrderConfirmationModal(newOrder, cartItemsCopy);
  }
};

window.openOrderConfirmationModal = function(order, cartItems) {
  let modal = document.getElementById('online-order-success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'online-order-success-modal';
    modal.className = 'fixed inset-0 z-[250] flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-md transition-all duration-300';
    document.body.appendChild(modal);
  }

  const itemsList = cartItems.map(i => `• ${i.name} (${i.qty}x) = Rp ${(i.price * i.qty).toLocaleString('id-ID')}`).join('\n');
  
  // DYNAMIC WHATSAPP TARGET PHONE FROM STORE_CONFIG
  const storePhone = (typeof STORE_CONFIG !== 'undefined' && STORE_CONFIG.phone) ? STORE_CONFIG.phone : '6281298406844';

  const rawWaMessage = `Halo Admin Alessia Cake,%0A%0ASaya sudah melakukan pesanan via Web dengan rincian:%0A- *ID Pesanan:* ${order.order_id}%0A- *Nama:* ${order.customer_name}%0A- *No WA:* ${order.customer_phone}%0A- *Metode:* ${order.order_type}%0A- *Total Bayar:* Rp ${Number(order.total_amount).toLocaleString('id-ID')}%0A%0A*Rincian Pesanan:*%0A${encodeURIComponent(itemsList)}%0A%0AMohon konfirmasi dan proses pesanan saya. Terima kasih!`;
  const waUrl = `https://wa.me/${storePhone}?text=${rawWaMessage}`;

  modal.innerHTML = `
    <div class="glass-modal w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative border border-pinkglass-300 bg-white/95">
      <div class="text-center space-y-2">
        <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-300 shadow-sm">
          ✓
        </div>
        <h3 class="text-xl font-extrabold text-charcoal">Pesanan Berhasil Terkirim!</h3>
        <p class="text-xs text-pinkglass-800 font-medium">Nomor Order: <span class="font-mono font-bold text-pinkglass-900 bg-pinkglass-100 px-2.5 py-0.5 rounded-full">${order.order_id}</span></p>
      </div>

      <div class="bg-pinkglass-50/80 p-4 rounded-2xl border border-pinkglass-200 text-xs space-y-2 text-charcoal">
        <div class="flex justify-between border-b border-pinkglass-200 pb-2">
          <span>Total Pembayaran (${order.order_type}):</span>
          <strong class="text-pinkglass-900 font-bold text-sm">Rp ${Number(order.total_amount).toLocaleString('id-ID')}</strong>
        </div>
        <p class="text-[11px] text-pinkglass-800 font-medium">Unggah bukti transfer / pembayaran kamu di bawah ini (opsional) lalu klik tombol WhatsApp untuk konfirmasi instan ke toko.</p>
      </div>

      <!-- Upload Bukti Transfer Form -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-pinkglass-900 block">Upload Bukti Transfer / Bayar</label>
        <input type="file" id="modal-payment-proof-file" accept="image/*" class="w-full text-xs text-pinkglass-800 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pinkglass-200 file:text-pinkglass-900 hover:file:bg-pinkglass-300 cursor-pointer">
      </div>

      <div class="space-y-2 pt-2">
        <a href="${waUrl}" target="_blank" onclick="window.closeOrderConfirmationModal()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-xs md:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 text-center">
          <i data-lucide="message-square" class="w-4 h-4"></i>
          <span>📲 Beritahu ke Toko via Chat WhatsApp (${storePhone})</span>
        </a>

        <button onclick="window.closeOrderConfirmationModal()" class="w-full bg-pinkglass-100 hover:bg-pinkglass-200 text-pinkglass-900 font-bold py-3 rounded-2xl text-xs transition-all border border-pinkglass-200">
          Selesai & Kembali ke Menu Utama
        </button>
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();
  if (typeof window.showToast === 'function') window.showToast("Pesanan anda sudah terkirim, admin segera akan membalasnya.");
};

window.closeOrderConfirmationModal = function() {
  const modal = document.getElementById('online-order-success-modal');
  if (modal) modal.remove();
  window.changeTab('catalog');
};

window.renderPOS = function(container) {
  let subtotal = appData.cart.reduce((a, b) => a + (b.price * b.qty), 0);
  let html = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      <div class="md:col-span-2 space-y-4">
        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card flex justify-between items-center">
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-charcoal">Input Pesanan Offline (Kasir Toko)</h2>
            <p class="text-xs text-pinkglass-800">Pilih kue untuk transaksi tatap muka pelanggan di outlet Alessia Cake.</p>
          </div>
          <span class="text-xs font-bold px-3 py-1.5 rounded-full bg-pinkglass-600 text-white">Channel Offline</span>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
  `;
  appData.products.forEach(p => {
    html += `
      <div onclick="window.addToCartPOS('${p.product_id}')" class="bg-white/80 p-4 rounded-2xl border border-pinkglass-200 cursor-pointer hover:border-pinkglass-500 transition-all glass-card shadow-sm active:scale-95">
        <h4 class="font-bold text-xs md:text-sm text-charcoal truncate">${p.name}</h4>
        <p class="text-xs font-bold text-pinkglass-700 mt-1">Rp ${p.base_price.toLocaleString('id-ID')}</p>
      </div>
    `;
  });
  html += `
        </div>
      </div>
      <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 space-y-4 glass-card shadow-sm h-fit">
        <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3">Keranjang Kasir Offline</h3>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          ${appData.cart.length === 0 ? '<p class="text-xs text-pinkglass-800 text-center py-4">Belum ada item dipilih</p>' : appData.cart.map((c, idx) => `
            <div class="flex justify-between items-center text-xs text-pinkglass-900 font-medium bg-pinkglass-50/60 p-2 rounded-xl border border-pinkglass-100">
              <span class="truncate max-w-[120px] font-bold">${c.name} (${c.qty}x)</span>
              <div class="flex items-center space-x-2">
                <span class="font-extrabold text-charcoal">Rp ${(c.price*c.qty).toLocaleString('id-ID')}</span>
                <button onclick="window.removeFromCart(${idx})" class="text-rose-500 hover:text-rose-700 p-0.5"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="pt-2 border-t border-pinkglass-200 flex justify-between items-center text-sm font-extrabold text-charcoal">
          <span>Total Belanja:</span>
          <span class="text-pinkglass-700 text-base">Rp ${subtotal.toLocaleString('id-ID')}</span>
        </div>
        <button onclick="window.openPOSPaymentModal()" class="w-full bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-bold py-3.5 rounded-2xl text-xs md:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2">
          <i data-lucide="credit-card" class="w-4 h-4"></i>
          <span>Proses Pembayaran Offline</span>
        </button>
      </div>
    </div>
  `;
  container.innerHTML = html;
};

window.posPaymentMethod = 'Tunai';

window.openPOSPaymentModal = function() {
  if (appData.cart.length === 0) {
    if (typeof window.showToast === 'function') window.showToast('Keranjang kasir masih kosong!');
    return;
  }

  let modal = document.getElementById('pos-payment-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pos-payment-modal';
    modal.className = 'fixed inset-0 z-[250] flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-md transition-all duration-300';
    document.body.appendChild(modal);
  }

  window.posPaymentMethod = 'Tunai';
  window.renderPOSPaymentModalContent(modal);
};

window.switchPOSPaymentTab = function(method) {
  window.posPaymentMethod = method;
  const modal = document.getElementById('pos-payment-modal');
  if (modal) window.renderPOSPaymentModalContent(modal);
};

window.renderPOSPaymentModalContent = function(modal) {
  const totalAmount = appData.cart.reduce((a, b) => a + (b.price * b.qty), 0);

  let html = `
    <div class="glass-modal w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative border border-pinkglass-300 bg-white/95 max-h-[92vh] overflow-y-auto">
      <div class="flex justify-between items-center border-b border-pinkglass-200 pb-3">
        <div>
          <h3 class="text-lg font-bold text-charcoal flex items-center gap-2">
            <span>💳 Pembayaran POS Kasir Offline</span>
          </h3>
          <p class="text-xs text-pinkglass-800">Pilih metode pembayaran tatap muka pelanggan.</p>
        </div>
        <button onclick="window.closePOSPaymentModal()" class="text-pinkglass-700 hover:text-charcoal p-1">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Ringkasan Order & Total -->
      <div class="bg-pinkglass-50/80 p-4 rounded-2xl border border-pinkglass-200 space-y-2">
        <div class="text-xs font-bold text-pinkglass-900 border-b border-pinkglass-200 pb-2 flex justify-between items-center">
          <span>Rincian Item (${appData.cart.reduce((a,b)=>a+b.qty, 0)} kue)</span>
          <span class="text-pinkglass-700 font-mono text-[11px]">${appData.cart.map(c => c.name).join(', ')}</span>
        </div>
        <div class="flex justify-between items-center pt-1">
          <span class="text-xs font-bold text-charcoal uppercase tracking-wider">Total Harus Dibayar:</span>
          <span class="text-lg font-extrabold text-pinkglass-700 font-mono">Rp ${totalAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <!-- Tab Metode Pembayaran -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-pinkglass-900 block">Pilih Metode Pembayaran Kasir:</label>
        <div class="grid grid-cols-3 gap-2">
          <button onclick="window.switchPOSPaymentTab('Tunai')" class="py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${window.posPaymentMethod === 'Tunai' ? 'bg-pinkglass-600 text-white border-pinkglass-600 shadow-md' : 'bg-white text-charcoal border-pinkglass-300 hover:bg-pinkglass-50'} flex flex-col items-center gap-1">
            <i data-lucide="banknote" class="w-4 h-4"></i>
            <span>💵 Tunai (Cash)</span>
          </button>

          <button onclick="window.switchPOSPaymentTab('QRIS')" class="py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${window.posPaymentMethod === 'QRIS' ? 'bg-pinkglass-600 text-white border-pinkglass-600 shadow-md' : 'bg-white text-charcoal border-pinkglass-300 hover:bg-pinkglass-50'} flex flex-col items-center gap-1">
            <i data-lucide="qr-code" class="w-4 h-4"></i>
            <span>📱 QRIS Toko</span>
          </button>

          <button onclick="window.switchPOSPaymentTab('Bank Transfer')" class="py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${window.posPaymentMethod === 'Bank Transfer' ? 'bg-pinkglass-600 text-white border-pinkglass-600 shadow-md' : 'bg-white text-charcoal border-pinkglass-300 hover:bg-pinkglass-50'} flex flex-col items-center gap-1">
            <i data-lucide="building-2" class="w-4 h-4"></i>
            <span>🏦 Bank Transfer</span>
          </button>
        </div>
      </div>

      <!-- DYNAMIC PAYMENT METHOD BODY -->
      <div id="pos-payment-body" class="space-y-3 pt-2 border-t border-pinkglass-200">
  `;

  if (window.posPaymentMethod === 'Tunai') {
    html += `
      <div class="space-y-3 bg-pinkglass-50/50 p-4 rounded-2xl border border-pinkglass-200">
        <div>
          <label class="text-xs font-bold text-pinkglass-900 block mb-1">Uang Diterima Dari Pelanggan (Rp):</label>
          <input type="number" id="pos-cash-given" value="${totalAmount}" oninput="window.calculatePOSChange(${totalAmount})" placeholder="misal: 100000" class="w-full bg-white border border-pinkglass-300 rounded-xl p-3 text-sm text-charcoal font-bold focus:ring-2 focus:ring-pinkglass-400">
        </div>

        <!-- Quick Cash Buttons -->
        <div class="flex flex-wrap gap-1.5">
          <button type="button" onclick="document.getElementById('pos-cash-given').value=${totalAmount}; window.calculatePOSChange(${totalAmount});" class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-pinkglass-300 text-pinkglass-800 hover:bg-pinkglass-100">Uang Pas</button>
          <button type="button" onclick="document.getElementById('pos-cash-given').value=50000; window.calculatePOSChange(${totalAmount});" class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-pinkglass-300 text-pinkglass-800 hover:bg-pinkglass-100">Rp 50.000</button>
          <button type="button" onclick="document.getElementById('pos-cash-given').value=100000; window.calculatePOSChange(${totalAmount});" class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-pinkglass-300 text-pinkglass-800 hover:bg-pinkglass-100">Rp 100.000</button>
          <button type="button" onclick="document.getElementById('pos-cash-given').value=200000; window.calculatePOSChange(${totalAmount});" class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-pinkglass-300 text-pinkglass-800 hover:bg-pinkglass-100">Rp 200.000</button>
        </div>

        <!-- Realtime Change Display -->
        <div class="p-3 bg-white rounded-xl border border-pinkglass-200 flex justify-between items-center">
          <span class="text-xs font-bold text-charcoal">Uang Kembalian:</span>
          <span id="pos-cash-change" class="text-base font-extrabold text-emerald-600 font-mono">Rp 0</span>
        </div>
      </div>
    `;
  } else if (window.posPaymentMethod === 'QRIS') {
    html += `
      <div class="p-4 bg-pinkglass-50/80 rounded-2xl border border-pinkglass-200 text-center space-y-2">
        <p class="text-xs font-bold text-pinkglass-900">Tunjukkan QRIS Toko Kepada Pelanggan</p>
        <img src="${(typeof STORE_CONFIG !== 'undefined' && STORE_CONFIG.qris_image_url) ? STORE_CONFIG.qris_image_url : 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ALESSIA-PINK-GLASS-QRIS'}" alt="QRIS Toko Alessia" class="mx-auto w-36 h-32 rounded-xl border border-pinkglass-300 bg-white p-2 shadow-sm">
        <p class="text-[11px] text-pinkglass-800 font-medium">Dana transfer QRIS akan masuk otomatis ke kategori <strong class="text-charcoal">Rekening Bank (Bank Alessia)</strong>.</p>
      </div>
    `;
  } else if (window.posPaymentMethod === 'Bank Transfer') {
    html += `
      <div class="p-4 bg-pinkglass-50/80 rounded-2xl border border-pinkglass-200 text-xs space-y-2 text-charcoal">
        <div class="font-bold text-pinkglass-900 border-b border-pinkglass-200 pb-1.5 flex justify-between items-center">
          <span>Rekening Bank Resmi Toko:</span>
          <span class="text-emerald-700 font-bold">BCA / Mandiri</span>
        </div>
        <p class="text-[11px] font-mono bg-white p-2.5 rounded-xl border border-pinkglass-200 text-pinkglass-900 font-bold">
          BCA: 8820-1234-99 a/n Alessia Cake Luxury<br>
          MANDIRI: 156-000-888-222 a/n Alessia Cake
        </p>
        <p class="text-[10px] text-pinkglass-800 font-medium">Harap verifikasi bukti mutasi sebelum menekan tombol selesaikan pembayaran.</p>
      </div>
    `;
  }

  html += `
      </div>

      <button onclick="window.submitPOSOfflinePayment(${totalAmount})" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-xs md:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 mt-4">
        <i data-lucide="check-circle" class="w-4 h-4"></i>
        <span>Selesaikan Pembayaran Offline (${window.posPaymentMethod})</span>
      </button>
    </div>
  `;

  modal.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
  
  if (window.posPaymentMethod === 'Tunai') {
    window.calculatePOSChange(totalAmount);
  }
};

window.calculatePOSChange = function(totalAmount) {
  const cashInput = document.getElementById('pos-cash-given');
  const changeEl = document.getElementById('pos-cash-change');
  if (!cashInput || !changeEl) return;

  const cashGiven = Number(cashInput.value) || 0;
  const change = cashGiven - totalAmount;

  if (change >= 0) {
    changeEl.innerText = `Rp ${change.toLocaleString('id-ID')}`;
    changeEl.className = 'text-base font-extrabold text-emerald-600 font-mono';
  } else {
    changeEl.innerText = `Kurang Rp ${Math.abs(change).toLocaleString('id-ID')}`;
    changeEl.className = 'text-base font-extrabold text-rose-600 font-mono';
  }
};

window.closePOSPaymentModal = function() {
  const modal = document.getElementById('pos-payment-modal');
  if (modal) modal.remove();
};

window.submitPOSOfflinePayment = function(totalAmount) {
  const method = window.posPaymentMethod || 'Tunai';

  if (method === 'Tunai') {
    const cashInput = document.getElementById('pos-cash-given');
    const cashGiven = Number(cashInput ? cashInput.value : 0);
    if (cashGiven < totalAmount) {
      if (typeof window.showToast === 'function') window.showToast('Jumlah uang tunai yang diterima kurang dari total belanja!');
      return;
    }
  }

  const orderType = `Offline (${method})`;
  const cartItemsCopy = [...appData.cart];

  const newOrder = {
    order_id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    order_type: orderType,
    customer_name: `Pelanggan Kasir (${method})`,
    customer_phone: '08110000111',
    table_no: '-',
    total_amount: totalAmount,
    dp_amount: 0,
    payment_status: 'PAID',
    order_status: 'Baking', // Instantly Baking for offline cashier order
    reference_photo_url: '',
    created_at: new Date().toISOString(),
    pickup_delivery_date: new Date().toISOString().split('T')[0],
    items: cartItemsCopy
  };

  if (typeof window.lockSync === 'function') window.lockSync(10000);

  if (typeof window.autoDeductIngredients === 'function') {
    window.autoDeductIngredients([...cartItemsCopy]);
  }

  appData.orders.unshift(newOrder);

  // Perbarui indikator badge sidebar secara instan
  if (typeof window.renderNavigation === 'function') window.renderNavigation();

  if (typeof window.sendOrderToGAS === 'function') {
    window.sendOrderToGAS(newOrder, [...cartItemsCopy]);
  }

  appData.cart = [];
  window.closePOSPaymentModal();
  window.renderViewport();

  // AUTOMATIC THERMAL PRINTER RECEIPT TRIGGER
  if (typeof window.printThermalReceipt === 'function') {
    window.printThermalReceipt(newOrder);
  }

  if (typeof window.showToast === 'function') {
    window.showToast(`Pembayaran ${orderType} sebesar Rp ${totalAmount.toLocaleString('id-ID')} berhasil! Struk dicetak.`);
  }
};

window.setOrderHubFilter = function(filter) {
  orderHubFilter = filter;
  window.renderViewport();
};

window.renderWebOrders = function(container) {
  const activeOrders = appData.orders.filter(o => o.order_status !== 'Cancelled');
  const onlineOrdersCount = activeOrders.filter(o => !String(o.order_type || '').includes('Offline')).length;
  const offlineOrdersCount = activeOrders.filter(o => String(o.order_type || '').includes('Offline')).length;

  let filteredOrders = activeOrders.filter(o => {
    const isOffline = String(o.order_type || '').includes('Offline');
    if (orderHubFilter === 'online') return !isOffline;
    if (orderHubFilter === 'offline') return isOffline;
    return true;
  });

  container.innerHTML = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card">
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-charcoal flex items-center gap-2">
            <i data-lucide="bell" class="w-6 h-6 text-pinkglass-600"></i>
            <span>Central Order Hub - Pesanan Masuk</span>
          </h2>
          <p class="text-xs md:text-sm text-pinkglass-800">Pantau dan teruskan pesanan dari channel Online (Web) maupun Offline (Kasir Toko) ke KDS Dapur.</p>
        </div>

        <!-- Filter Channel Buttons & Refresh Button -->
        <div class="flex items-center space-x-2">
          <button onclick="if(typeof window.fetchInitialDataFromGAS === 'function') window.fetchInitialDataFromGAS(); if(typeof window.showToast === 'function') window.showToast('Memperbarui data pesanan...');" class="px-3 py-1.5 text-xs font-bold rounded-xl bg-white/90 text-charcoal border border-pinkglass-300 hover:bg-pinkglass-100 transition-all flex items-center space-x-1 shadow-xs active:scale-95">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-pinkglass-700"></i>
            <span>Refresh</span>
          </button>
          
          <div class="flex bg-pinkglass-100 p-1.5 rounded-2xl border border-pinkglass-200 space-x-1">
            <button onclick="window.setOrderHubFilter('all')" class="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${orderHubFilter === 'all' ? 'bg-pinkglass-600 text-white shadow-sm' : 'text-pinkglass-800 hover:text-charcoal'}">
              Semua (${activeOrders.length})
            </button>
            <button onclick="window.setOrderHubFilter('online')" class="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${orderHubFilter === 'online' ? 'bg-pinkglass-600 text-white shadow-sm' : 'text-pinkglass-800 hover:text-charcoal'}">
              🌐 Online (${onlineOrdersCount})
            </button>
            <button onclick="window.setOrderHubFilter('offline')" class="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${orderHubFilter === 'offline' ? 'bg-pinkglass-600 text-white shadow-sm' : 'text-pinkglass-800 hover:text-charcoal'}">
              🏪 Offline (${offlineOrdersCount})
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        ${filteredOrders.length === 0 ? `
          <div class="bg-white/80 p-8 rounded-3xl border border-pinkglass-200 text-center text-pinkglass-800 text-sm glass-card">
            Belum ada data pesanan masuk pada filter ini.
          </div>
        ` : filteredOrders.map(o => {
          const isOffline = String(o.order_type || '').includes('Offline');
          return `
            <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-card shadow-sm">
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <h4 class="font-bold text-sm md:text-base text-charcoal">${o.customer_name}</h4>
                  <span class="text-[10px] bg-pinkglass-100 text-pinkglass-900 px-2.5 py-0.5 rounded-full font-mono font-bold">${o.order_id}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${isOffline ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}">
                    ${o.order_type}
                  </span>
                </div>
                <p class="text-xs text-pinkglass-800 font-medium">
                  Total Bayar: <strong class="text-charcoal">Rp ${Number(o.total_amount).toLocaleString('id-ID')}</strong> | Status Dapur: <span class="font-bold text-pinkglass-700">${o.order_status}</span> | Pembayaran: <span class="font-bold text-emerald-700">${o.payment_status}</span>
                </p>
              </div>

              <div class="flex items-center space-x-2">
                ${o.order_status === 'Pending' ? `
                  <button onclick="window.updateOrderStatus('${o.order_id}', 'Baking')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center space-x-1.5">
                    <i data-lucide="chef-hat" class="w-4 h-4"></i>
                    <span>Terima & Masak (Ke KDS)</span>
                  </button>
                  <button onclick="window.cancelOrder('${o.order_id}')" class="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center space-x-1.5" title="Hapus order & restore stok bahan">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                    <span>❌ Hapus Order</span>
                  </button>
                ` : `
                  <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-pinkglass-100 text-pinkglass-900 border border-pinkglass-200">
                    Sedang Diproses: ${o.order_status}
                  </span>
                  <button onclick="window.cancelOrder('${o.order_id}')" class="bg-rose-100 text-rose-700 hover:bg-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border border-rose-300">
                    <i data-lucide="x-circle" class="w-3.5 h-3.5"></i>
                    <span>Batalkan</span>
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
};

window.formatOrderTime = function(isoString) {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  } catch (e) {
    return '-';
  }
};

window.getElapsedTimeFormatted = function(createdIso, readyIso = null, status = 'Pending') {
  if (!createdIso) return '00m 00s';
  const created = new Date(createdIso).getTime();
  if (isNaN(created)) return '00m 00s';
  
  let endTime = Date.now();
  if (status === 'Ready' && readyIso) {
    const readyTime = new Date(readyIso).getTime();
    if (!isNaN(readyTime)) endTime = readyTime;
  }
  
  const diffMs = Math.max(0, endTime - created);
  const totalSeconds = Math.floor(diffMs / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
};

window.renderKDS = function(container) {
  if (window.kdsIntervalId) {
    clearInterval(window.kdsIntervalId);
    window.kdsIntervalId = null;
  }

  const kdsOrders = appData.orders.filter(o => o.order_status !== 'Cancelled');

  let html = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-charcoal flex items-center gap-2">
            <i data-lucide="chef-hat" class="w-6 h-6 text-pinkglass-600"></i>
            <span>Kitchen Display System (KDS Queue)</span>
          </h2>
          <p class="text-xs text-pinkglass-800">Antrean pembuatan kue dapur realtime dari seluruh channel pesanan masuk.</p>
        </div>
        <div class="flex items-center space-x-2 bg-pinkglass-100 px-3.5 py-1.5 rounded-2xl border border-pinkglass-200 shadow-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-bold text-pinkglass-900">Timer Live Running</span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  `;

  if (kdsOrders.length === 0) {
    html += `
      <div class="col-span-full bg-white/80 p-8 rounded-3xl border border-pinkglass-200 text-center text-pinkglass-800 text-sm glass-card">
        Belum ada antrean pesanan di dapur.
      </div>
    `;
  } else {
    kdsOrders.forEach(o => {
      const isOffline = String(o.order_type || '').includes('Offline');
      const formattedTime = window.formatOrderTime(o.created_at);
      const initialElapsed = window.getElapsedTimeFormatted(o.created_at, o.ready_at, o.order_status);

      let statusBadgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
      let statusLabel = o.order_status || 'Pending';

      if (o.order_status === 'Baking') {
        statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse font-bold';
      } else if (o.order_status === 'Ready') {
        statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      }

      html += `
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-300 space-y-3 glass-card shadow-sm flex flex-col justify-between">
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold bg-pinkglass-100 text-pinkglass-900 px-2.5 py-1 rounded-full font-mono">${o.order_id}</span>
              <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isOffline ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}">${o.order_type}</span>
            </div>

            <div>
              <h4 class="font-bold text-charcoal text-base">${o.customer_name}</h4>
              <p class="text-[11px] text-pinkglass-800 font-medium mt-0.5">🕒 Jam Pesan: <strong class="text-charcoal font-semibold">${formattedTime}</strong></p>
            </div>

            <div class="p-3 bg-pinkglass-50/70 rounded-2xl border border-pinkglass-200 space-y-2 mt-2">
              <div class="flex justify-between items-center text-xs">
                <span class="text-pinkglass-800 font-semibold">Status Dapur:</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] border ${statusBadgeClass}">
                  ${statusLabel}
                </span>
              </div>
              <div class="flex justify-between items-center text-xs pt-1.5 border-t border-pinkglass-200">
                <span class="text-pinkglass-800 font-semibold">Durasi Pemprosesan:</span>
                <span id="kds-timer-${o.order_id}" data-created="${o.created_at}" data-ready="${o.ready_at || ''}" data-status="${o.order_status}" class="font-mono font-bold text-pinkglass-900 text-xs bg-white px-2 py-0.5 rounded-lg border border-pinkglass-200 shadow-2xs">
                  ⏱️ ${initialElapsed} ${o.order_status === 'Ready' ? '(Selesai)' : ''}
                </span>
              </div>
            </div>
          </div>

          <div class="pt-2 space-y-2">
            ${o.order_status === 'Ready' ? `
              <div class="w-full bg-emerald-100 text-emerald-800 font-bold py-2.5 rounded-2xl text-xs text-center border border-emerald-300 flex items-center justify-center space-x-1.5 shadow-2xs">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
                <span>Pesanan Selesai (Ready)</span>
              </div>
            ` : `
              <button onclick="window.updateOrderStatus('${o.order_id}', 'Ready')" class="w-full bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-bold py-2.5 rounded-2xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5">
                <i data-lucide="check" class="w-4 h-4"></i>
                <span>Tandai Jika Kue Siap (Ready)</span>
              </button>
            `}

            <button onclick="window.cancelOrder('${o.order_id}')" class="w-full bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-2 rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center space-x-1 border border-rose-300">
              <i data-lucide="x-circle" class="w-3.5 h-3.5"></i>
              <span>🚫 Batalkan Pesanan (Restore Stok)</span>
            </button>
          </div>
        </div>
      `;
    });
  }

  html += `</div></div>`;
  container.innerHTML = html;

  window.kdsIntervalId = setInterval(() => {
    appData.orders.forEach(o => {
      if (o.order_status !== 'Ready' && o.order_status !== 'Cancelled') {
        const el = document.getElementById(`kds-timer-${o.order_id}`);
        if (el) {
          const createdIso = el.getAttribute('data-created');
          el.innerText = `⏱️ ${window.getElapsedTimeFormatted(createdIso, o.ready_at, o.order_status)}`;
        }
      }
    });
  }, 1000);
};

window.updateOrderStatus = function(orderId, status) {
  const ord = appData.orders.find(o => o.order_id === orderId);
  if (ord) { 
    ord.order_status = status; 
    if (status === 'Ready' && !ord.ready_at) {
      ord.ready_at = new Date().toISOString();
    }

    // Update indikator badge sidebar secara seketika
    if (typeof window.renderNavigation === 'function') window.renderNavigation();
    window.renderViewport(); 

    if (typeof window.showToast === 'function') window.showToast(`Status pesanan ${orderId} diperbarui menjadi ${status}!`);
    
    const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
    if (savedUrl && !savedUrl.includes('PASTE_YOUR')) {
      fetch(savedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updateOrderStatus', order_id: orderId, new_status: status, ready_at: ord.ready_at, user_role: currentRole })
      }).catch(e => console.error(e));
    }
  }
};

window.cancelOrder = function(orderId) {
  if (!confirm(`Apakah Anda yakin ingin membatalkan/menghapus pesanan ${orderId}? Stok bahan baku akan dikembalikan otomatis.`)) return;

  const ordIndex = appData.orders.findIndex(o => o.order_id === orderId);
  if (ordIndex < 0) return;

  const ord = appData.orders[ordIndex];

  // Lock polling sync to protect local restoration
  if (typeof window.lockSync === 'function') window.lockSync(10000);

  // Restore ingredient stocks from BOM recipes
  if (ord.items && ord.items.length > 0) {
    ord.items.forEach(cartItem => {
      const recipe = appData.recipes.find(r => String(r.product_id).trim() === String(cartItem.product_id).trim());
      if (recipe && recipe.items) {
        recipe.items.forEach(rItem => {
          const ing = appData.ingredients.find(i => String(i.ingredient_id).trim() === String(rItem.ingredient_id).trim());
          if (ing) {
            const totalToRestore = rItem.qty * cartItem.qty;
            ing.current_stock = Number(ing.current_stock || 0) + totalToRestore;
          }
        });
      }
    });
  }

  ord.order_status = 'Cancelled';

  // Update indikator badge sidebar secara seketika
  if (typeof window.renderNavigation === 'function') window.renderNavigation();
  window.renderViewport();

  if (typeof window.showToast === 'function') window.showToast(`Pesanan ${orderId} berhasil dibatalkan & stok bahan baku dikembalikan!`);

  // Sync cancellation & restored ingredients to GAS backend
  const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
  if (savedUrl && !savedUrl.includes('PASTE_YOUR')) {
    fetch(savedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ 
        action: 'updateOrderStatus', 
        order_id: orderId, 
        new_status: 'Cancelled', 
        ingredients: appData.ingredients,
        user_role: currentRole 
      })
    }).catch(e => console.error(e));
  }
};
