/* ==========================================================
 * ALESSIA CAKE - CLEAN DASHBOARD, FINANCIAL & ROUTER ENGINE
 * TRISULACODER v13.0 Production Edition
 * ========================================================== */

let financePeriod = 'all'; // Options: 'today', '7days', '30days', 'all'

// Temporary row buffer for multi-ingredient purchase modal
window.expenseIngredientRows = [];

if (typeof appData !== 'undefined' && !appData.expenses) {
  appData.expenses = [
    { expense_id: 'EXP-1001', category: 'Bahan Baku Pasar (Mentega/Telur/Dll)', description: 'Beli Telur Ayam Fresh 15kg & Susu UHT', amount: 380000, date: new Date().toISOString() },
    { expense_id: 'EXP-1002', category: 'Operasional (Listrik/Air/Wifi/Gaji)', description: 'Listrik PLN & Wifi Toko Harian', amount: 150000, date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { expense_id: 'EXP-1003', category: 'Kemasan & Plastik Branding', description: 'Beli Box Premium Pink Glass 100 Pcs', amount: 250000, date: new Date(Date.now() - 5 * 86400000).toISOString() }
  ];
}

/* ==========================================================
 * CLEAN HALAMAN UTAMA DASHBOARD (GAMBAR 1 MODIFICATION)
 * ========================================================== */
window.renderDashboard = function(container) {
  if (!container) return;

  const validOrders = appData.orders.filter(o => o.order_status !== 'Pending' && o.order_status !== 'Cancelled');
  const totalOmset = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const totalExpense = (appData.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const estimasiUntung = totalOmset - totalExpense;

  const activeProcessCount = appData.orders.filter(o => o.order_status === 'Dibuat' || o.order_status === 'Dihias' || o.order_status === 'Siap').length;
  const lowStockCount = appData.ingredients.filter(i => Number(i.current_stock) <= Number(i.min_stock_alert)).length;

  let html = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <!-- STATS KPI CARD ROW (CLEAN VIEW WITHOUT ANALYTICS BANNER & WIDGETS) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Omset -->
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-pinkglass-800 uppercase tracking-wider">Total Omset</span>
            <div class="p-2 rounded-xl bg-pinkglass-100 text-pinkglass-700">
              <i data-lucide="dollar-sign" class="w-4 h-4"></i>
            </div>
          </div>
          <h3 class="text-xl md:text-2xl font-extrabold text-charcoal">Rp ${totalOmset.toLocaleString('id-ID')}</h3>
          <p class="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <i data-lucide="trending-up" class="w-3 h-3"></i>
            <span>Omset Penjualan Terkonfirmasi</span>
          </p>
        </div>

        <!-- Estimasi Untung Bersih -->
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-pinkglass-800 uppercase tracking-wider">Estimasi Untung Bersih</span>
            <div class="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <i data-lucide="trending-up" class="w-4 h-4"></i>
            </div>
          </div>
          <h3 class="text-xl md:text-2xl font-extrabold ${estimasiUntung >= 0 ? 'text-emerald-700' : 'text-rose-600'}">Rp ${estimasiUntung.toLocaleString('id-ID')}</h3>
          <p class="text-[10px] text-pinkglass-800 font-medium">Pemasukan dikurangi Pengeluaran Kas</p>
        </div>

        <!-- Pesanan Aktif KDS -->
        <div onclick="window.changeTab('kds')" class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm space-y-2 cursor-pointer hover:border-pinkglass-400 transition-all">
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-pinkglass-800 uppercase tracking-wider">Pesanan Aktif KDS</span>
            <div class="p-2 rounded-xl bg-amber-100 text-amber-700">
              <i data-lucide="chef-hat" class="w-4 h-4"></i>
            </div>
          </div>
          <h3 class="text-xl md:text-2xl font-extrabold text-charcoal">${activeProcessCount} Antrean</h3>
          <p class="text-[10px] text-amber-700 font-bold">Sedang Diproses Dapur →</p>
        </div>

        <!-- Low Stock Bahan -->
        <div onclick="window.changeTab('update_stock')" class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm space-y-2 cursor-pointer hover:border-pinkglass-400 transition-all">
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-pinkglass-800 uppercase tracking-wider">Low Stock Bahan</span>
            <div class="p-2 rounded-xl bg-rose-100 text-rose-700">
              <i data-lucide="alert-triangle" class="w-4 h-4"></i>
            </div>
          </div>
          <h3 class="text-xl md:text-2xl font-extrabold text-rose-600">${lowStockCount} Bahan</h3>
          <p class="text-[10px] text-rose-600 font-bold">Perlu Restock Segera →</p>
        </div>

      </div>
    </div>
  `;

  container.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.setFinancePeriod = function(period) {
  financePeriod = period;
  window.renderViewport();
};

window.openExpenseModal = function() {
  let modal = document.getElementById('expense-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'expense-modal';
    modal.className = 'fixed inset-0 z-[250] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-md transition-all duration-300';
    document.body.appendChild(modal);
  }

  const firstIng = (typeof appData !== 'undefined' && appData.ingredients && appData.ingredients.length > 0) 
    ? appData.ingredients[0] 
    : null;

  window.expenseIngredientRows = [
    {
      ingredient_id: firstIng ? firstIng.ingredient_id : '',
      qty: 1000,
      cost_per_unit: firstIng ? Number(firstIng.cost_per_unit || 0) : 0
    }
  ];

  modal.innerHTML = `
    <div class="glass-modal w-full max-w-xl rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative border border-pinkglass-300 bg-white/95 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center border-b border-pinkglass-200 pb-3">
        <h3 class="text-lg font-bold text-charcoal flex items-center gap-2">
          <span>💸 Catat Pengeluaran Baru</span>
        </h3>
        <button onclick="window.closeExpenseModal()" class="text-pinkglass-700 hover:text-charcoal p-1">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="text-xs font-bold text-pinkglass-900 block mb-1">Kategori Pengeluaran</label>
          <select id="exp-category" onchange="window.handleExpenseCategoryChange(this.value)" class="w-full bg-white border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal font-bold focus:ring-2 focus:ring-pinkglass-400">
            <option value="Bahan Baku Pasar (Mentega/Telur/Dll)">Bahan Baku Pasar (Mentega/Telur/Dll)</option>
            <option value="Operasional (Listrik/Air/Wifi/Gaji)">Operasional (Listrik/Air/Wifi/Gaji)</option>
            <option value="Kemasan & Plastik Branding">Kemasan & Plastik Branding</option>
            <option value="Lain-lain / Petty Cash">Lain-lain / Petty Cash</option>
          </select>
        </div>

        <div id="exp-ingredient-fields" class="space-y-3 bg-pinkglass-50/70 p-4 rounded-2xl border border-pinkglass-200">
          <div class="flex justify-between items-center border-b border-pinkglass-200 pb-2">
            <span class="text-xs font-bold text-pinkglass-900 flex items-center gap-1.5">
              <i data-lucide="shopping-cart" class="w-4 h-4 text-pinkglass-600"></i>
              <span>Rincian Belanja Bahan Baku (Tab Stok Bahan)</span>
            </span>
            <span id="exp-total-calculated" class="text-xs font-extrabold text-rose-600 bg-white px-2.5 py-1 rounded-lg border border-pinkglass-200 shadow-2xs">
              Total: Rp 0
            </span>
          </div>

          <div id="exp-ingredient-rows-container" class="space-y-2 max-h-56 overflow-y-auto pr-1">
          </div>

          <div class="pt-1 flex flex-col sm:flex-row justify-between items-center gap-2">
            <button type="button" onclick="window.addExpenseIngredientRow()" class="w-full sm:w-auto bg-white hover:bg-pinkglass-100 text-pinkglass-900 font-bold px-3.5 py-2 rounded-xl text-xs border border-pinkglass-300 transition-all flex items-center justify-center space-x-1.5 shadow-2xs">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>+ Tambah Item Bahan Baku</span>
            </button>

            <div class="text-[11px] text-pinkglass-800 font-medium flex items-center space-x-1">
              <i data-lucide="info" class="w-3.5 h-3.5 text-pinkglass-600"></i>
              <span>Harga dapat disesuaikan jika terjadi perubahan harga pasar.</span>
            </div>
          </div>

          <div class="pt-2 border-t border-pinkglass-200/80 space-y-1.5 text-xs">
            <label class="flex items-center space-x-2 cursor-pointer font-semibold text-charcoal">
              <input type="checkbox" id="exp-auto-add-stock" checked class="w-4 h-4 text-pinkglass-600 rounded focus:ring-pinkglass-400">
              <span>☑️ Otomatis tambah Stok Fisik Bahan di Tab Stok Bahan</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer font-semibold text-charcoal">
              <input type="checkbox" id="exp-update-master-price" checked class="w-4 h-4 text-pinkglass-600 rounded focus:ring-pinkglass-400">
              <span>☑️ Perbarui Harga Modal Unit Master jika ada perubahan harga pasar</span>
            </label>
          </div>
        </div>

        <div id="exp-regular-fields" class="space-y-3 hidden">
          <div>
            <label class="text-xs font-bold text-pinkglass-900 block mb-1">Keterangan Pengeluaran</label>
            <input type="text" id="exp-desc" placeholder="misal: Pembayaran Listrik Toko Bulan Ini" class="w-full bg-white border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal focus:ring-2 focus:ring-pinkglass-400">
          </div>

          <div>
            <label class="text-xs font-bold text-pinkglass-900 block mb-1">Jumlah Biaya (Rp)</label>
            <input type="number" id="exp-amount" placeholder="misal: 150000" class="w-full bg-white border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal focus:ring-2 focus:ring-pinkglass-400 font-bold">
          </div>
        </div>
      </div>

      <button onclick="window.saveExpenseFromModal()" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-2xl text-xs md:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 mt-4">
        <i data-lucide="check" class="w-4 h-4"></i>
        <span>Simpan & Catat Pengeluaran</span>
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
  window.renderExpenseIngredientRows();
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.handleExpenseCategoryChange = function(category) {
  const ingFields = document.getElementById('exp-ingredient-fields');
  const regFields = document.getElementById('exp-regular-fields');

  if (!ingFields || !regFields) return;

  if (category.includes('Bahan Baku')) {
    ingFields.classList.remove('hidden');
    regFields.classList.add('hidden');
  } else {
    ingFields.classList.add('hidden');
    regFields.classList.remove('hidden');
  }
};

window.renderExpenseIngredientRows = function() {
  const container = document.getElementById('exp-ingredient-rows-container');
  if (!container) return;

  if (!window.expenseIngredientRows || window.expenseIngredientRows.length === 0) {
    container.innerHTML = `<p class="text-xs text-pinkglass-700 py-2 text-center">Belum ada item bahan baku dipilih.</p>`;
    window.updateExpenseTotalCalculated();
    return;
  }

  let html = '';
  window.expenseIngredientRows.forEach((row, idx) => {
    const selectedIng = appData.ingredients.find(i => i.ingredient_id === row.ingredient_id) || appData.ingredients[0];
    const unit = selectedIng ? selectedIng.unit : 'unit';
    const subtotal = Number(row.qty || 0) * Number(row.cost_per_unit || 0);

    html += `
      <div class="bg-white p-3 rounded-xl border border-pinkglass-200 shadow-2xs space-y-2">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          <div class="sm:col-span-5">
            <label class="text-[10px] font-bold text-pinkglass-800 block mb-0.5">Nama Bahan Baku</label>
            <select onchange="window.onExpenseIngredientChange(${idx}, 'ingredient_id', this.value)" class="w-full bg-pinkglass-50/50 border border-pinkglass-300 rounded-lg p-2 text-xs font-semibold text-charcoal focus:ring-1 focus:ring-pinkglass-400">
              ${appData.ingredients.map(ing => `
                <option value="${ing.ingredient_id}" ${ing.ingredient_id === row.ingredient_id ? 'selected' : ''}>
                  ${ing.name} (${ing.current_stock} ${ing.unit})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="sm:col-span-3">
            <label class="text-[10px] font-bold text-pinkglass-800 block mb-0.5">Jumlah (${unit})</label>
            <input type="number" value="${row.qty}" oninput="window.onExpenseIngredientChange(${idx}, 'qty', this.value)" placeholder="Qty" class="w-full bg-white border border-pinkglass-300 rounded-lg p-2 text-xs text-charcoal font-bold focus:ring-1 focus:ring-pinkglass-400">
          </div>

          <div class="sm:col-span-3">
            <label class="text-[10px] font-bold text-pinkglass-800 block mb-0.5">Harga Beli/Unit (Rp)</label>
            <input type="number" value="${row.cost_per_unit}" oninput="window.onExpenseIngredientChange(${idx}, 'cost_per_unit', this.value)" placeholder="Rp" class="w-full bg-white border border-pinkglass-300 rounded-lg p-2 text-xs text-charcoal font-bold focus:ring-1 focus:ring-pinkglass-400">
          </div>

          <div class="sm:col-span-1 flex justify-end sm:justify-center pt-2 sm:pt-4">
            <button type="button" onclick="window.removeExpenseIngredientRow(${idx})" class="text-rose-500 hover:text-rose-700 p-1" title="Hapus Item">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div class="flex justify-between items-center text-[11px] pt-1 border-t border-pinkglass-100/80">
          <span class="text-pinkglass-800">Subtotal: <strong class="text-charcoal">${row.qty} ${unit} x Rp ${Number(row.cost_per_unit).toLocaleString('id-ID')}</strong></span>
          <span class="font-extrabold text-pinkglass-900">Rp ${subtotal.toLocaleString('id-ID')}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
  window.updateExpenseTotalCalculated();
};

window.onExpenseIngredientChange = function(index, field, value) {
  if (!window.expenseIngredientRows[index]) return;

  if (field === 'ingredient_id') {
    window.expenseIngredientRows[index].ingredient_id = value;
    const targetIng = appData.ingredients.find(i => i.ingredient_id === value);
    if (targetIng) {
      window.expenseIngredientRows[index].cost_per_unit = Number(targetIng.cost_per_unit || 0);
    }
  } else if (field === 'qty') {
    window.expenseIngredientRows[index].qty = Math.max(0, Number(value) || 0);
  } else if (field === 'cost_per_unit') {
    window.expenseIngredientRows[index].cost_per_unit = Math.max(0, Number(value) || 0);
  }

  window.renderExpenseIngredientRows();
};

window.addExpenseIngredientRow = function() {
  const firstIng = (typeof appData !== 'undefined' && appData.ingredients && appData.ingredients.length > 0) 
    ? appData.ingredients[0] 
    : null;

  window.expenseIngredientRows.push({
    ingredient_id: firstIng ? firstIng.ingredient_id : '',
    qty: 1000,
    cost_per_unit: firstIng ? Number(firstIng.cost_per_unit || 0) : 0
  });

  window.renderExpenseIngredientRows();
};

window.removeExpenseIngredientRow = function(index) {
  if (window.expenseIngredientRows.length <= 1) {
    if (typeof window.showToast === 'function') window.showToast('Minimal harus ada 1 item bahan baku!');
    return;
  }
  window.expenseIngredientRows.splice(index, 1);
  window.renderExpenseIngredientRows();
};

window.updateExpenseTotalCalculated = function() {
  const totalEl = document.getElementById('exp-total-calculated');
  if (!totalEl) return;

  const total = window.expenseIngredientRows.reduce((sum, row) => {
    return sum + (Number(row.qty || 0) * Number(row.cost_per_unit || 0));
  }, 0);

  totalEl.innerText = `Total: Rp ${total.toLocaleString('id-ID')}`;
};

window.closeExpenseModal = function() {
  const modal = document.getElementById('expense-modal');
  if (modal) modal.remove();
};

window.saveExpenseFromModal = function() {
  const catEl = document.getElementById('exp-category');
  const category = catEl ? catEl.value : 'Lain-lain / Petty Cash';

  if (!appData.expenses) appData.expenses = [];

  if (category.includes('Bahan Baku')) {
    if (!window.expenseIngredientRows || window.expenseIngredientRows.length === 0) {
      if (typeof window.showToast === 'function') window.showToast('Mohon pilih minimal 1 item bahan baku!');
      return;
    }

    const autoAddStock = document.getElementById('exp-auto-add-stock')?.checked;
    const updateMasterPrice = document.getElementById('exp-update-master-price')?.checked;

    let grandTotal = 0;
    let itemSummaryList = [];

    window.expenseIngredientRows.forEach(row => {
      const ing = appData.ingredients.find(i => i.ingredient_id === row.ingredient_id);
      if (ing && row.qty > 0) {
        const rowTotal = row.qty * row.cost_per_unit;
        grandTotal += rowTotal;
        itemSummaryList.push(`${ing.name} (${row.qty} ${ing.unit} @ Rp ${row.cost_per_unit})`);

        if (autoAddStock) {
          ing.current_stock = Number(ing.current_stock || 0) + Number(row.qty);
        }

        if (updateMasterPrice && row.cost_per_unit > 0) {
          ing.cost_per_unit = Number(row.cost_per_unit);
        }
      }
    });

    if (grandTotal <= 0 || itemSummaryList.length === 0) {
      if (typeof window.showToast === 'function') window.showToast('Mohon isi jumlah dan harga bahan baku yang valid!');
      return;
    }

    const newExp = {
      expense_id: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      category: category,
      description: 'Belanja Bahan Baku: ' + itemSummaryList.join(', '),
      amount: grandTotal,
      date: new Date().toISOString()
    };

    appData.expenses.unshift(newExp);

    const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
    if (savedUrl && !savedUrl.includes('PASTE_YOUR')) {
      fetch(savedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'saveExpense', expense: newExp, user_role: currentRole })
      }).catch(e => console.error(e));
    }

    window.closeExpenseModal();
    window.renderViewport();
    if (typeof window.showToast === 'function') window.showToast(`Pengeluaran bahan baku Rp ${grandTotal.toLocaleString('id-ID')} berhasil dicatat & stok bertambah!`);

  } else {
    const descEl = document.getElementById('exp-desc');
    const amountEl = document.getElementById('exp-amount');

    const desc = descEl ? descEl.value.trim() : '';
    const amount = Number(amountEl ? amountEl.value : 0);

    if (!desc || amount <= 0) {
      if (typeof window.showToast === 'function') window.showToast('Mohon isi deskripsi dan jumlah biaya yang valid!');
      return;
    }

    const newExp = {
      expense_id: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      category: category,
      description: desc,
      amount: amount,
      date: new Date().toISOString()
    };

    appData.expenses.unshift(newExp);

    const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
    if (savedUrl && !savedUrl.includes('PASTE_YOUR')) {
      fetch(savedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'saveExpense', expense: newExp, user_role: currentRole })
      }).catch(e => console.error(e));
    }

    window.closeExpenseModal();
    window.renderViewport();
    if (typeof window.showToast === 'function') window.showToast('Pengeluaran kas toko berhasil dicatat!');
  }
};

window.filterItemsByPeriod = function(items, dateField) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return items.filter(item => {
    if (!item[dateField]) return true;
    const itemTime = new Date(item[dateField]).getTime();
    if (isNaN(itemTime)) return true;

    if (financePeriod === 'today') {
      return itemTime >= startOfDay;
    } else if (financePeriod === '7days') {
      return itemTime >= (now.getTime() - 7 * 86400000);
    } else if (financePeriod === '30days') {
      return itemTime >= (now.getTime() - 30 * 86400000);
    }
    return true; // 'all'
  });
};

window.renderFinanceManager = function(container) {
  if (!appData.expenses) appData.expenses = [];

  // Exclude Pending & Cancelled orders from Financial income
  const confirmedOrders = appData.orders.filter(o => o.order_status !== 'Pending' && o.order_status !== 'Cancelled');

  const filteredOrders = window.filterItemsByPeriod(confirmedOrders, 'created_at');
  const filteredExpenses = window.filterItemsByPeriod(appData.expenses, 'date');

  const totalIncome = filteredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  const bankIncome = filteredOrders.filter(o => !String(o.order_type || '').includes('Tunai')).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const cashIncome = filteredOrders.filter(o => String(o.order_type || '').includes('Tunai')).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  let periodLabel = 'Seluruh Waktu (Lifetime)';
  if (financePeriod === 'today') periodLabel = '24 Jam Hari Ini';
  else if (financePeriod === '7days') periodLabel = '7 Hari Terakhir';
  else if (financePeriod === '30days') periodLabel = '30 Hari Terakhir';

  let html = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card">
        <div>
          <h2 class="text-xl md:text-2xl font-extrabold text-charcoal flex items-center gap-2">
            <span>🏦 Bank Alessia Cake - Pusat Arus Kas & Laporan Keuangan</span>
          </h2>
          <p class="text-xs md:text-sm text-pinkglass-800">Pemantauan real-time pemasukan pesanan terkonfirmasi, pengeluaran kas, dan saldo laba bersih.</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="flex bg-pinkglass-100 p-1.5 rounded-2xl border border-pinkglass-200 space-x-1">
            <button onclick="window.setFinancePeriod('today')" class="px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${financePeriod === 'today' ? 'bg-pinkglass-600 text-white shadow-sm' : 'text-pinkglass-800 hover:text-charcoal'}">Hari Ini</button>
            <button onclick="window.setFinancePeriod('7days')" class="px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${financePeriod === '7days' ? 'bg-pinkglass-600 text-white shadow-sm' : 'text-pinkglass-800 hover:text-charcoal'}">7 Hari</button>
            <button onclick="window.setFinancePeriod('30days')" class="px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${financePeriod === '30days' ? 'bg-pinkglass-600 text-white shadow-sm' : 'text-pinkglass-800 hover:text-charcoal'}">30 Hari</button>
            <button onclick="window.setFinancePeriod('all')" class="px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${financePeriod === 'all' ? 'bg-pinkglass-600 text-white shadow-sm' : 'text-pinkglass-800 hover:text-charcoal'}">Semua</button>
          </div>

          <button onclick="window.openExpenseModal()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center space-x-1.5 shadow-md active:scale-95">
            <i data-lucide="minus-circle" class="w-4 h-4"></i>
            <span>+ Catat Pengeluaran</span>
          </button>
          
          <button onclick="window.printFinanceReport()" class="bg-charcoal hover:bg-black text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs transition-all flex items-center space-x-1.5 shadow-md active:scale-95">
            <i data-lucide="printer" class="w-4 h-4"></i>
            <span>Cetak</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm space-y-1">
          <div class="flex justify-between items-center text-emerald-700">
            <span class="text-[11px] font-bold uppercase tracking-wider">Total Pemasukan Sah</span>
            <div class="p-2 rounded-xl bg-emerald-100"><i data-lucide="arrow-down-left" class="w-4 h-4 text-emerald-700"></i></div>
          </div>
          <h3 class="text-xl md:text-2xl font-extrabold text-emerald-700">Rp ${totalIncome.toLocaleString('id-ID')}</h3>
          <p class="text-[10px] text-pinkglass-800 font-medium">Periode: ${periodLabel} (${filteredOrders.length} Trx Terkonfirmasi)</p>
        </div>

        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm space-y-1">
          <div class="flex justify-between items-center text-rose-700">
            <span class="text-[11px] font-bold uppercase tracking-wider">Total Pengeluaran Kas</span>
            <div class="p-2 rounded-xl bg-rose-100"><i data-lucide="arrow-up-right" class="w-4 h-4 text-rose-700"></i></div>
          </div>
          <h3 class="text-xl md:text-2xl font-extrabold text-rose-600">Rp ${totalExpense.toLocaleString('id-ID')}</h3>
          <p class="text-[10px] text-pinkglass-800 font-medium">Periode: ${periodLabel} (${filteredExpenses.length} Catatan)</p>
        </div>

        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm space-y-1">
          <div class="flex justify-between items-center text-pinkglass-800">
            <span class="text-[11px] font-bold uppercase tracking-wider">Hasil Akhir Saldo Bersih</span>
            <div class="p-2 rounded-xl bg-pinkglass-100"><i data-lucide="wallet" class="w-4 h-4 text-pinkglass-700"></i></div>
          </div>
          <h3 class="text-xl md:text-2xl font-extrabold ${netBalance >= 0 ? 'text-charcoal' : 'text-rose-600'}">Rp ${netBalance.toLocaleString('id-ID')}</h3>
          <p class="text-[10px] ${netBalance >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}">
            ${netBalance >= 0 ? '✓ Kondisi Kas Surplus (Untung)' : '⚠️ Kondisi Kas Defisit'}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white/80 p-4 rounded-2xl border border-pinkglass-200 glass-card flex items-center justify-between shadow-2xs">
          <div class="flex items-center space-x-3">
            <div class="p-3 rounded-xl bg-sky-100 text-sky-800"><i data-lucide="qr-code" class="w-5 h-5"></i></div>
            <div>
              <span class="text-[10px] font-bold text-pinkglass-800 uppercase">Transfer QRIS / Bank Transfer / COD</span>
              <h4 class="font-bold text-base text-charcoal">Rp ${bankIncome.toLocaleString('id-ID')}</h4>
            </div>
          </div>
          <span class="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">Rekening Bank</span>
        </div>

        <div class="bg-white/80 p-4 rounded-2xl border border-pinkglass-200 glass-card flex items-center justify-between shadow-2xs">
          <div class="flex items-center space-x-3">
            <div class="p-3 rounded-xl bg-amber-100 text-amber-800"><i data-lucide="banknote" class="w-5 h-5"></i></div>
            <div>
              <span class="text-[10px] font-bold text-pinkglass-800 uppercase">Kasir Offline (Tunai Toko)</span>
              <h4 class="font-bold text-base text-charcoal">Rp ${cashIncome.toLocaleString('id-ID')}</h4>
            </div>
          </div>
          <span class="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">Laci Kasir</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-4 shadow-sm">
          <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3 flex justify-between items-center">
            <span class="flex items-center gap-1.5"><i data-lucide="trending-up" class="w-4 h-4 text-emerald-600"></i> Rincian Kas Masuk (Pesanan Diterima)</span>
            <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">${filteredOrders.length} Trx</span>
          </h3>

          <div class="overflow-x-auto max-h-80 overflow-y-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-pinkglass-100 text-[10px] font-bold text-pinkglass-900 uppercase">
                  <th class="py-2 px-3">ID / Pelanggan</th>
                  <th class="py-2 px-3">Channel / Status</th>
                  <th class="py-2 px-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody class="divide-y border-pinkglass-50 text-xs">
                ${filteredOrders.length === 0 ? `
                  <tr><td colspan="3" class="py-6 text-center text-pinkglass-800">Belum ada transaksi pemasukan terkonfirmasi pada periode ini.</td></tr>
                ` : filteredOrders.map(o => `
                  <tr class="hover:bg-pinkglass-50/50">
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-charcoal">${o.customer_name}</div>
                      <div class="text-[10px] font-mono text-pinkglass-700">${o.order_id}</div>
                    </td>
                    <td class="py-2.5 px-3">
                      <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${String(o.order_type || '').includes('Offline') ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}">
                        ${o.order_type}
                      </span>
                      <span class="text-[10px] font-bold text-pinkglass-800 ml-1">(${o.order_status})</span>
                    </td>
                    <td class="py-2.5 px-3 text-right font-bold text-emerald-700">
                      +Rp ${Number(o.total_amount).toLocaleString('id-ID')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-4 shadow-sm">
          <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3 flex justify-between items-center">
            <span class="flex items-center gap-1.5"><i data-lucide="trending-down" class="w-4 h-4 text-rose-600"></i> Rincian Kas Keluar (Pengeluaran)</span>
            <span class="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">${filteredExpenses.length} Catatan</span>
          </h3>

          <div class="overflow-x-auto max-h-80 overflow-y-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-pinkglass-100 text-[10px] font-bold text-pinkglass-900 uppercase">
                  <th class="py-2 px-3">Kategori & Keterangan</th>
                  <th class="py-2 px-3 text-right">Biaya</th>
                </tr>
              </thead>
              <tbody class="divide-y border-pinkglass-50 text-xs">
                ${filteredExpenses.length === 0 ? `
                  <tr><td colspan="2" class="py-6 text-center text-pinkglass-800">Belum ada pengeluaran kas yang dicatat pada periode ini.</td></tr>
                ` : filteredExpenses.map(e => `
                  <tr class="hover:bg-pinkglass-50/50">
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-charcoal">${e.description}</div>
                      <div class="text-[10px] text-pinkglass-700 font-medium">${e.category} • ${e.date ? new Date(e.date).toLocaleDateString('id-ID') : '-'}</div>
                    </td>
                    <td class="py-2.5 px-3 text-right font-bold text-rose-600">
                      -Rp ${Number(e.amount).toLocaleString('id-ID')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
};

window.printFinanceReport = function() {
  window.print();
};

/* ==========================================================
 * AUTHENTICATION & VIEWPORT ROUTER ENGINE (JS)
 * ========================================================== */
window.customerInactivityTimer = null;
const CUSTOMER_TIMEOUT_MS = 10 * 60 * 1000; // 10 Menit

window.openAuthModal = function() {
  const modal = document.getElementById('auth-gatekeeper-modal');
  if (modal) modal.classList.remove('hidden');

  const nameEl = document.getElementById('login-cust-name');
  const phoneEl = document.getElementById('login-cust-phone');
  if (nameEl && !currentUser.isLoggedIn) nameEl.value = '';
  if (phoneEl && !currentUser.isLoggedIn) phoneEl.value = '';
};

window.closeAuthModal = function() {
  const modal = document.getElementById('auth-gatekeeper-modal');
  if (modal) modal.classList.add('hidden');
};

window.switchAuthTab = function(type) {
  const custBtn = document.getElementById('tab-auth-customer');
  const staffBtn = document.getElementById('tab-auth-staff');
  const custForm = document.getElementById('auth-customer-form');
  const staffForm = document.getElementById('auth-staff-form');

  if (!custBtn || !staffBtn || !custForm || !staffForm) return;

  if (type === 'customer') {
    custBtn.className = 'flex-1 py-2 text-xs font-bold rounded-xl bg-pinkglass-600 text-white shadow-md transition-all';
    staffBtn.className = 'flex-1 py-2 text-xs font-bold rounded-xl text-pinkglass-800 hover:text-charcoal transition-all';
    custForm.classList.remove('hidden');
    staffForm.classList.add('hidden');
  } else {
    staffBtn.className = 'flex-1 py-2 text-xs font-bold rounded-xl bg-pinkglass-600 text-white shadow-md transition-all';
    custBtn.className = 'flex-1 py-2 text-xs font-bold rounded-xl text-pinkglass-800 hover:text-charcoal transition-all';
    staffForm.classList.remove('hidden');
    custForm.classList.add('hidden');
  }
};

window.submitCustomerLogin = function() {
  const nameEl = document.getElementById('login-cust-name');
  const phoneEl = document.getElementById('login-cust-phone');
  
  const nameInput = nameEl ? nameEl.value.trim() : '';
  const phoneInput = phoneEl ? phoneEl.value.trim() : '';

  if (!nameInput || !phoneInput) {
    if (typeof window.showToast === 'function') window.showToast('Mohon isi nama dan nomor WhatsApp kamu terlebih dahulu!');
    return;
  }

  currentUser = {
    name: nameInput,
    phone: phoneInput,
    role: 'customer',
    isLoggedIn: true
  };

  localStorage.setItem('ALESSIA_USER', JSON.stringify(currentUser));
  window.updateUserProfileDisplay();
  window.closeAuthModal();
  window.switchRole('customer');
  if (typeof window.showToast === 'function') window.showToast(`Selamat datang, ${currentUser.name}! Silakan pilih kue impian kamu.`);
};

window.submitStaffLogin = function() {
  const roleEl = document.getElementById('login-staff-role');
  const pinEl = document.getElementById('login-staff-pin');

  const selectedRole = roleEl ? roleEl.value : 'owner';
  const pinInput = pinEl ? pinEl.value.trim() : '';

  const validPin = (typeof STORE_CONFIG !== 'undefined' && STORE_CONFIG.staff_pin) ? STORE_CONFIG.staff_pin : '123456';

  if (!pinInput) {
    if (typeof window.showToast === 'function') window.showToast('Masukkan PIN staf kamu!');
    return;
  }

  if (pinInput !== validPin) {
    if (typeof window.showToast === 'function') window.showToast('PIN Keamanan Staf salah! Silakan coba lagi.');
    return;
  }

  const ownerName = (typeof STORE_CONFIG !== 'undefined' && STORE_CONFIG.owner_name) ? STORE_CONFIG.owner_name : 'OWNER Staff';

  currentUser = {
    name: ownerName,
    phone: 'INTERNAL',
    role: 'owner',
    isLoggedIn: true
  };

  localStorage.setItem('ALESSIA_USER', JSON.stringify(currentUser));
  window.updateUserProfileDisplay();
  window.closeAuthModal();
  window.switchRole('owner');
  if (typeof window.showToast === 'function') window.showToast(`Akses Owner Berhasil: Selamat bekerja, ${currentUser.name}!`);
};

window.updateUserProfileDisplay = function() {
  const nameEl = document.getElementById('display-user-name');
  if (nameEl) nameEl.innerText = currentUser.name || 'Tamu VIP';
};

window.logoutUser = function() {
  if (window.customerInactivityTimer) {
    clearTimeout(window.customerInactivityTimer);
    window.customerInactivityTimer = null;
  }

  localStorage.removeItem('ALESSIA_USER');
  currentUser = {
    name: '',
    phone: '',
    role: 'customer',
    isLoggedIn: false
  };
  window.updateUserProfileDisplay();
  window.switchRole('customer');
  window.openAuthModal();
  if (typeof window.showToast === 'function') window.showToast('Berhasil keluar dari sistem.');
};

window.switchRole = function(role) {
  currentRole = role;
  currentUser.role = role;
  const tabs = roleTabs[role] || roleTabs['customer'];
  currentTab = tabs[0].id;

  window.renderNavigation();
  window.renderViewport();

  window.resetCustomerInactivityTimer();
};

window.changeTab = function(tabId) {
  currentTab = tabId;
  window.renderNavigation();
  window.renderViewport();

  window.resetCustomerInactivityTimer();
};

window.resetCustomerInactivityTimer = function() {
  if (window.customerInactivityTimer) {
    clearTimeout(window.customerInactivityTimer);
    window.customerInactivityTimer = null;
  }

  if (currentRole !== 'customer' || !currentUser.isLoggedIn) {
    return;
  }

  window.customerInactivityTimer = setTimeout(() => {
    if (currentRole === 'customer' && currentUser.isLoggedIn) {
      if (typeof window.showToast === 'function') {
        window.showToast('Sesi kamu telah berakhir karena 10 menit tidak ada aktivitas.');
      }
      window.logoutUser();
    }
  }, CUSTOMER_TIMEOUT_MS);
};

window.initCustomerInactivityDetector = function() {
  const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
  
  activityEvents.forEach(eventType => {
    window.addEventListener(eventType, () => {
      if (currentRole === 'customer' && currentUser.isLoggedIn) {
        window.resetCustomerInactivityTimer();
      }
    }, { passive: true });
  });
};

window.initCustomerInactivityDetector();

window.renderNavigation = function() {
  const sidebar = document.getElementById('sidebar-nav');
  const mobileNav = document.getElementById('mobile-bottom-nav');
  const tabs = roleTabs[currentRole] || roleTabs['customer'];
  
  const pendingOrdersCount = (typeof appData !== 'undefined' && appData.orders) 
    ? appData.orders.filter(o => o.order_status === 'Pending' && !String(o.order_type || '').includes('Offline')).length 
    : 0;

  // Active orders inside the 3 stage containers (Dibuat, Dihias, Siap)
  const processOrdersCount = (typeof appData !== 'undefined' && appData.orders) 
    ? appData.orders.filter(o => o.order_status === 'Dibuat' || o.order_status === 'Baking' || o.order_status === 'Dihias' || o.order_status === 'Siap' || o.order_status === 'Ready').length 
    : 0;

  if (sidebar) {
    let sideHtml = `<div class="text-[11px] font-bold uppercase tracking-wider text-pinkglass-700 px-3 py-2">Menu ${currentRole.toUpperCase()}</div>`;
    tabs.forEach(tab => {
      const active = currentTab === tab.id;
      
      let badgeHtml = '';
      if (tab.id === 'web_orders' && pendingOrdersCount > 0) {
        badgeHtml = `<span class="ml-auto bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shadow-xs">${pendingOrdersCount}</span>`;
      } else if (tab.id === 'kds' && processOrdersCount > 0) {
        badgeHtml = `<span class="ml-auto bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">${processOrdersCount}</span>`;
      }

      sideHtml += `
        <button onclick="window.changeTab('${tab.id}')" class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${active ? 'bg-pinkglass-600 text-white shadow-md' : 'text-charcoal hover:bg-pinkglass-100/60'}">
          <i data-lucide="${tab.icon}" class="w-4 h-4 shrink-0"></i>
          <span class="truncate">${tab.name}</span>
          ${badgeHtml}
        </button>
      `;
    });
    sidebar.innerHTML = sideHtml;
  }

  if (mobileNav) {
    let mobHtml = '';
    tabs.forEach(tab => {
      const active = currentTab === tab.id;

      let mobBadge = '';
      if (tab.id === 'web_orders' && pendingOrdersCount > 0) {
        mobBadge = `<span class="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">${pendingOrdersCount}</span>`;
      } else if (tab.id === 'kds' && processOrdersCount > 0) {
        mobBadge = `<span class="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">${processOrdersCount}</span>`;
      }

      mobHtml += `
        <button onclick="window.changeTab('${tab.id}')" class="flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all relative ${active ? 'text-pinkglass-700 font-bold' : 'text-pinkglass-500 hover:text-charcoal'}">
          <div class="relative inline-block">
            <i data-lucide="${tab.icon}" class="w-5 h-5 mb-0.5"></i>
            ${mobBadge}
          </div>
          <span class="text-[10px] truncate max-w-[65px]">${tab.name}</span>
        </button>
      `;
    });
    mobileNav.innerHTML = mobHtml;
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

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
