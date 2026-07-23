window.openProductModal = function(productId = null) {
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');
  if (!modal) return;

  if (productId) {
    const prod = appData.products.find(p => p.product_id === productId);
    if (prod) {
      title.innerText = 'Edit Produk';
      document.getElementById('pm-product-id').value = prod.product_id;
      document.getElementById('pm-name').value = prod.name;
      document.getElementById('pm-category').value = prod.category;
      document.getElementById('pm-price').value = prod.base_price;
      document.getElementById('pm-stock').value = prod.stock_qty || 10;
      document.getElementById('pm-image').value = prod.image_url;
      document.getElementById('pm-desc').value = prod.description;
    }
  } else {
    title.innerText = 'Tambah Produk Baru';
    document.getElementById('pm-product-id').value = 'PRD-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('pm-name').value = '';
    document.getElementById('pm-category').value = 'Whole Cake';
    document.getElementById('pm-price').value = '';
    document.getElementById('pm-stock').value = '10';
    document.getElementById('pm-image').value = '';
    document.getElementById('pm-desc').value = '';
  }

  modal.classList.remove('hidden');
};

window.closeProductModal = function() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.add('hidden');
};

window.saveProductFromModal = function() {
  const pid = document.getElementById('pm-product-id').value;
  const name = document.getElementById('pm-name').value.trim();
  const category = document.getElementById('pm-category').value;
  const price = Number(document.getElementById('pm-price').value) || 0;
  const stock = Number(document.getElementById('pm-stock').value) || 0;
  const image = document.getElementById('pm-image').value.trim() || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600';
  const desc = document.getElementById('pm-desc').value.trim();

  if (!name || price <= 0) {
    window.showToast('Mohon isi nama produk dan harga yang valid!');
    return;
  }

  const productObj = {
    product_id: pid,
    category: category,
    name: name,
    description: desc,
    base_price: price,
    image_url: image,
    is_active: true,
    is_happy_hour_eligible: false,
    stock_qty: stock
  };

  const existingIndex = appData.products.findIndex(p => p.product_id === pid);
  if (existingIndex >= 0) {
    appData.products[existingIndex] = productObj;
  } else {
    appData.products.push(productObj);
  }

  window.closeProductModal();
  window.renderViewport();
  window.showToast('Produk berhasil disimpan!');

  const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
  if (savedUrl && !savedUrl.includes('PASTE_YOUR')) {
    fetch(savedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'saveProduct', product: productObj, user_role: currentRole })
    }).catch(e => console.error(e));
  }
};

window.openIngredientModal = function(ingId = null) {
  const modal = document.getElementById('ingredient-modal');
  const title = document.getElementById('ingredient-modal-title');
  if (!modal) return;

  if (ingId) {
    const ing = appData.ingredients.find(i => i.ingredient_id === ingId);
    if (ing) {
      title.innerText = 'Edit Bahan Baku';
      document.getElementById('im-ingredient-id').value = ing.ingredient_id;
      document.getElementById('im-name').value = ing.name;
      document.getElementById('im-stock').value = ing.current_stock;
      document.getElementById('im-unit').value = ing.unit || 'gram';
      document.getElementById('im-cost').value = ing.cost_per_unit;
      document.getElementById('im-min-stock').value = ing.min_stock_alert;
    }
  } else {
    title.innerText = 'Tambah Bahan Baku Baru';
    document.getElementById('im-ingredient-id').value = 'ING-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('im-name').value = '';
    document.getElementById('im-stock').value = '';
    document.getElementById('im-unit').value = 'gram';
    document.getElementById('im-cost').value = '';
    document.getElementById('im-min-stock').value = '1000';
  }

  modal.classList.remove('hidden');
};

window.closeIngredientModal = function() {
  const modal = document.getElementById('ingredient-modal');
  if (modal) modal.classList.add('hidden');
};

window.saveIngredientFromModal = function() {
  const ingId = document.getElementById('im-ingredient-id').value;
  const name = document.getElementById('im-name').value.trim();
  const stock = Number(document.getElementById('im-stock').value) || 0;
  const unit = document.getElementById('im-unit').value;
  const cost = Number(document.getElementById('im-cost').value) || 0;
  const minStock = Number(document.getElementById('im-min-stock').value) || 0;

  if (!name || cost <= 0) {
    window.showToast('Mohon isi nama bahan baku dan harga unit yang valid!');
    return;
  }

  const ingObj = {
    ingredient_id: ingId,
    name: name,
    current_stock: stock,
    min_stock_alert: minStock,
    unit: unit,
    cost_per_unit: cost
  };

  const existingIndex = appData.ingredients.findIndex(i => i.ingredient_id === ingId);
  if (existingIndex >= 0) {
    appData.ingredients[existingIndex] = ingObj;
  } else {
    appData.ingredients.push(ingObj);
  }

  window.closeIngredientModal();
  window.renderViewport();
  window.showToast('Bahan baku berhasil disimpan!');

  const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
  if (savedUrl && !savedUrl.includes('PASTE_YOUR')) {
    fetch(savedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'saveIngredient', ingredient: ingObj, user_role: currentRole })
    }).catch(e => console.error(e));
  }
};

window.deleteIngredient = function(ingId) {
  if (confirm('Apakah kamu yakin ingin menghapus bahan baku ini?')) {
    appData.ingredients = appData.ingredients.filter(i => i.ingredient_id !== ingId);
    window.renderViewport();
    window.showToast('Bahan baku berhasil dihapus!');
  }
};

window.renderBOMViewer = function(container) {
  const selectedProduct = appData.products.find(p => p.product_id === activeBomProductId) || appData.products[0];
  if (!selectedProduct) return;

  activeBomProductId = selectedProduct.product_id;
  let recipe = appData.recipes.find(r => r.product_id === activeBomProductId);
  if (!recipe) {
    recipe = { product_id: activeBomProductId, items: [] };
    appData.recipes.push(recipe);
  }

  let totalHpp = 0;
  let recipeDetails = recipe.items.map(item => {
    const ing = appData.ingredients.find(i => i.ingredient_id === item.ingredient_id);
    const name = ing ? ing.name : 'Bahan Tidak Ditemukan';
    const unit = ing ? ing.unit : 'unit';
    const costPerUnit = ing ? ing.cost_per_unit : 0;
    const subtotal = item.qty * costPerUnit;
    totalHpp += subtotal;
    return { ...item, name, unit, costPerUnit, subtotal };
  });

  const basePrice = Number(selectedProduct.base_price) || 0;
  const grossProfit = basePrice - totalHpp;
  const profitMargin = basePrice > 0 ? ((grossProfit / basePrice) * 100).toFixed(1) : 0;

  let html = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-charcoal">Resep BOM & Kalkulator HPP Presisi</h2>
          <p class="text-xs md:text-sm text-pinkglass-800">Atur takaran gramasi bahan baku untuk setiap produk kue dan pantau margin keuntungan.</p>
        </div>
        <div>
          <label class="text-xs font-bold text-pinkglass-900 block mb-1">Pilih Produk Kue:</label>
          <select onchange="window.selectBomProduct(this.value)" class="bg-white border border-pinkglass-300 rounded-2xl px-4 py-2.5 text-xs md:text-sm font-bold text-charcoal focus:ring-2 focus:ring-pinkglass-400">
            ${appData.products.map(p => `
              <option value="${p.product_id}" ${p.product_id === activeBomProductId ? 'selected' : ''}>
                ${p.name} (Rp ${Number(p.base_price).toLocaleString('id-ID')})
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card">
          <span class="text-[11px] font-semibold text-pinkglass-800 uppercase tracking-wider">Harga Jual Katalog</span>
          <h3 class="text-lg md:text-2xl font-extrabold text-charcoal mt-1">Rp ${basePrice.toLocaleString('id-ID')}</h3>
        </div>
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card">
          <span class="text-[11px] font-semibold text-pinkglass-800 uppercase tracking-wider">Total HPP Bahan Baku</span>
          <h3 class="text-lg md:text-2xl font-extrabold text-pinkglass-700 mt-1">Rp ${totalHpp.toLocaleString('id-ID')}</h3>
        </div>
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card">
          <span class="text-[11px] font-semibold text-pinkglass-800 uppercase tracking-wider">Estimasi Margin Keuntungan</span>
          <h3 class="text-lg md:text-2xl font-extrabold ${grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'} mt-1">
            Rp ${grossProfit.toLocaleString('id-ID')} <span class="text-xs font-bold">(${profitMargin}%)</span>
          </h3>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-4 shadow-sm">
          <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3 flex items-center justify-between">
            <span>Rincian Komposisi Bahan (${selectedProduct.name})</span>
            <span class="text-xs font-semibold text-pinkglass-700">${recipeDetails.length} Komponen</span>
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-pinkglass-100 text-[11px] font-bold text-pinkglass-900 uppercase tracking-wider">
                  <th class="py-2 px-3">Bahan Baku</th>
                  <th class="py-2 px-3 text-center">Takaran Needed</th>
                  <th class="py-2 px-3 text-right">Biaya/Unit</th>
                  <th class="py-2 px-3 text-right">Subtotal HPP</th>
                  <th class="py-2 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y border-pinkglass-50 text-xs">
                ${recipeDetails.length === 0 ? `
                  <tr>
                    <td colspan="5" class="py-6 text-center text-pinkglass-800 font-medium">Belum ada takaran resep yang ditambahkan untuk kue ini.</td>
                  </tr>
                ` : recipeDetails.map((item, idx) => `
                  <tr class="hover:bg-pinkglass-50/50">
                    <td class="py-3 px-3 font-semibold text-charcoal">${item.name}</td>
                    <td class="py-3 px-3 text-center font-bold text-pinkglass-900">${item.qty} ${item.unit}</td>
                    <td class="py-3 px-3 text-right text-pinkglass-800">Rp ${item.costPerUnit.toLocaleString('id-ID')}/${item.unit}</td>
                    <td class="py-3 px-3 text-right font-bold text-charcoal">Rp ${item.subtotal.toLocaleString('id-ID')}</td>
                    <td class="py-3 px-3 text-center">
                      <button onclick="window.removeRecipeItem('${activeBomProductId}', ${idx})" class="text-rose-500 hover:text-rose-700 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-4 h-fit shadow-sm">
          <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3">Tambah Bahan ke Resep</h3>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">Pilih Bahan Baku</label>
              <select id="bom-add-ing-id" class="w-full bg-white/90 border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal focus:ring-2 focus:ring-pinkglass-400">
                ${appData.ingredients.map(ing => `
                  <option value="${ing.ingredient_id}">${ing.name} (Stok: ${ing.current_stock} ${ing.unit})</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="text-xs font-bold text-pinkglass-900 block mb-1">Jumlah/Takaran Dibutuhkan</label>
              <input type="number" id="bom-add-qty" placeholder="misal: 250" class="w-full bg-white/90 border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal focus:ring-2 focus:ring-pinkglass-400">
            </div>
            <button onclick="window.addIngredientToRecipe()" class="w-full bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-bold py-3 rounded-2xl text-xs md:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>Tambahkan Komposisi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
};

window.selectBomProduct = function(productId) {
  activeBomProductId = productId;
  window.renderViewport();
};

window.addIngredientToRecipe = function() {
  const ingSelect = document.getElementById('bom-add-ing-id');
  const qtyInput = document.getElementById('bom-add-qty');

  const ingId = ingSelect ? ingSelect.value : '';
  const qty = Number(qtyInput ? qtyInput.value : 0);

  if (!ingId || qty <= 0) {
    window.showToast('Mohon pilih bahan dan masukkan jumlah takaran yang valid!');
    return;
  }

  let recipe = appData.recipes.find(r => r.product_id === activeBomProductId);
  if (!recipe) {
    recipe = { product_id: activeBomProductId, items: [] };
    appData.recipes.push(recipe);
  }

  const existingItem = recipe.items.find(i => i.ingredient_id === ingId);
  if (existingItem) {
    existingItem.qty += qty;
  } else {
    recipe.items.push({ ingredient_id: ingId, qty: qty });
  }

  window.renderViewport();
  window.showToast('Komposisi resep berhasil diperbarui!');
};

window.removeRecipeItem = function(productId, index) {
  const recipe = appData.recipes.find(r => r.product_id === productId);
  if (recipe && recipe.items[index]) {
    recipe.items.splice(index, 1);
    window.renderViewport();
    window.showToast('Bahan berhasil dihapus dari resep!');
  }
};

window.autoDeductIngredients = function(cartItems) {
  let deductedLog = [];
  cartItems.forEach(cartItem => {
    const recipe = appData.recipes.find(r => r.product_id === cartItem.product_id);
    if (recipe && recipe.items) {
      recipe.items.forEach(rItem => {
        const ing = appData.ingredients.find(i => i.ingredient_id === rItem.ingredient_id);
        if (ing) {
          const totalNeeded = rItem.qty * cartItem.qty;
          ing.current_stock = Math.max(0, ing.current_stock - totalNeeded);
          deductedLog.push(`${ing.name} (-${totalNeeded} ${ing.unit})`);
        }
      });
    }
  });

  if (deductedLog.length > 0) {
    console.log('Stok Terpotong Otomatis:', deductedLog.join(', '));
  }
};

window.renderUpdateStock = function(container) {
  let html = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-charcoal">Manajemen Stok & Monitoring Bahan Baku</h2>
          <p class="text-xs md:text-sm text-pinkglass-800">Pantau ketersediaan stok fisik bahan dapur, atur biaya per unit, dan cegah kehabisan bahan secara real-time.</p>
        </div>
        <button onclick="window.openIngredientModal()" class="bg-pinkglass-600 hover:bg-pinkglass-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center space-x-2 shadow-md active:scale-95">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>+ Tambah Bahan Baku Baru</span>
        </button>
      </div>

      <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card shadow-sm overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-pinkglass-100 text-[11px] font-bold text-pinkglass-900 uppercase tracking-wider">
              <th class="py-3 px-4">ID Bahan</th>
              <th class="py-3 px-4">Nama Bahan Baku</th>
              <th class="py-3 px-4 text-center">Stok Fisik Saat Ini</th>
              <th class="py-3 px-4 text-center">Batas Minimum</th>
              <th class="py-3 px-4 text-right">Biaya/Unit</th>
              <th class="py-3 px-4 text-center">Status Low Stock</th>
              <th class="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y border-pinkglass-50 text-xs">
            ${appData.ingredients.map(ing => {
              const isLow = ing.current_stock <= ing.min_stock_alert;
              return `
                <tr class="hover:bg-pinkglass-50/50">
                  <td class="py-3 px-4 font-mono text-pinkglass-700 font-bold">${ing.ingredient_id}</td>
                  <td class="py-3 px-4 font-bold text-charcoal">${ing.name}</td>
                  <td class="py-3 px-4 text-center font-extrabold text-charcoal text-sm">${Number(ing.current_stock).toLocaleString('id-ID')} ${ing.unit}</td>
                  <td class="py-3 px-4 text-center text-pinkglass-800">${Number(ing.min_stock_alert).toLocaleString('id-ID')} ${ing.unit}</td>
                  <td class="py-3 px-4 text-right font-semibold text-charcoal">Rp ${Number(ing.cost_per_unit).toLocaleString('id-ID')}/${ing.unit}</td>
                  <td class="py-3 px-4 text-center">
                    ${isLow ? `
                      <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">Low Stock</span>
                    ` : `
                      <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Aman</span>
                    `}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center space-x-2">
                      <button onclick="window.openIngredientModal('${ing.ingredient_id}')" class="text-charcoal hover:text-pinkglass-600 p-1" title="Edit Bahan">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                      </button>
                      <button onclick="window.deleteIngredient('${ing.ingredient_id}')" class="text-rose-500 hover:text-rose-700 p-1" title="Hapus Bahan">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  container.innerHTML = html;
};

window.renderDashboard = function(container) {
  container.innerHTML = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <h2 class="text-xl md:text-2xl font-bold text-charcoal">Dashboard Analitik Omset Owner</h2>
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
};

window.renderBatchBaking = function(container) { container.innerHTML = `<div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 text-charcoal glass-card font-semibold">Consolidated Batch Baking Oven View (Ready)</div>`; };
window.renderAudit = function(container) { container.innerHTML = `<div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 text-charcoal glass-card font-semibold">Audit Logs Sistem & Riwayat Keamanan (Ready)</div>`; };
