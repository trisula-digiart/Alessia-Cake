let financePeriod = 'all'; // Options: 'today', '7days', '30days', 'all'

// Ensure appData.expenses exists
if (typeof appData !== 'undefined' && !appData.expenses) {
  appData.expenses = [
    { expense_id: 'EXP-1001', category: 'Bahan Baku', description: 'Beli Telur Ayam Fresh 15kg & Susu UHT', amount: 380000, date: new Date().toISOString() },
    { expense_id: 'EXP-1002', category: 'Operasional', description: 'Listrik PLN & Wifi Toko Harian', amount: 150000, date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { expense_id: 'EXP-1003', category: 'Kemasan', description: 'Beli Box Premium Pink Glass 100 Pcs', amount: 250000, date: new Date(Date.now() - 5 * 86400000).toISOString() }
  ];
}

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

  modal.innerHTML = `
    <div class="glass-modal w-full max-w-md rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative border border-pinkglass-300 bg-white/95">
      <div class="flex justify-between items-center border-b border-pinkglass-200 pb-3">
        <h3 class="text-lg font-bold text-charcoal flex items-center gap-2">
          <span>💸 Catat Pengeluaran Baru</span>
        </h3>
        <button onclick="window.closeExpenseModal()" class="text-pinkglass-700 hover:text-charcoal p-1">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="text-xs font-bold text-pinkglass-900 block mb-1">Kategori Pengeluaran</label>
          <select id="exp-category" class="w-full bg-white border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal font-semibold focus:ring-2 focus:ring-pinkglass-400">
            <option value="Bahan Baku">Bahan Baku Pasar (Mentega/Telur/Dll)</option>
            <option value="Operasional">Operasional (Listrik/Air/Wifi/Gaji)</option>
            <option value="Kemasan">Kemasan & Plastik Branding</option>
            <option value="Lain-lain">Lain-lain / Petty Cash</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-bold text-pinkglass-900 block mb-1">Keterangan Pengeluaran</label>
          <input type="text" id="exp-desc" placeholder="misal: Pembelian Keju Cream Cheese 5kg" class="w-full bg-white border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal focus:ring-2 focus:ring-pinkglass-400">
        </div>

        <div>
          <label class="text-xs font-bold text-pinkglass-900 block mb-1">Jumlah Biaya (Rp)</label>
          <input type="number" id="exp-amount" placeholder="misal: 150000" class="w-full bg-white border border-pinkglass-300 rounded-xl p-2.5 text-xs text-charcoal focus:ring-2 focus:ring-pinkglass-400 font-bold">
        </div>
      </div>

      <button onclick="window.saveExpenseFromModal()" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl text-xs md:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5">
        <i data-lucide="check" class="w-4 h-4"></i>
        <span>Simpan Pengeluaran</span>
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.closeExpenseModal = function() {
  const modal = document.getElementById('expense-modal');
  if (modal) modal.remove();
};

window.saveExpenseFromModal = function() {
  const catEl = document.getElementById('exp-category');
  const descEl = document.getElementById('exp-desc');
  const amountEl = document.getElementById('exp-amount');

  const category = catEl ? catEl.value : 'Lain-lain';
  const desc = descEl ? descEl.value.trim() : '';
  const amount = Number(amountEl ? amountEl.value : 0);

  if (!desc || amount <= 0) {
    if (typeof window.showToast === 'function') window.showToast('Mohon isi deskripsi dan jumlah biaya yang valid!');
    return;
  }

  if (!appData.expenses) appData.expenses = [];

  const newExp = {
    expense_id: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
    category: category,
    description: desc,
    amount: amount,
    date: new Date().toISOString()
  };

  appData.expenses.unshift(newExp);
  window.closeExpenseModal();
  window.renderViewport();
  if (typeof window.showToast === 'function') window.showToast('Pengeluaran kas toko berhasil dicatat!');
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

  const filteredOrders = window.filterItemsByPeriod(appData.orders, 'created_at');
  const filteredExpenses = window.filterItemsByPeriod(appData.expenses, 'date');

  const totalIncome = filteredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  // Split Channel Calculation
  const qrisIncome = filteredOrders.filter(o => !String(o.order_type || '').includes('Offline')).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const cashIncome = filteredOrders.filter(o => String(o.order_type || '').includes('Offline')).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  let periodLabel = 'Seluruh Waktu (Lifetime)';
  if (financePeriod === 'today') periodLabel = '24 Jam Hari Ini';
  else if (financePeriod === '7days') periodLabel = '7 Hari Terakhir';
  else if (financePeriod === '30days') periodLabel = '30 Hari Terakhir';

  let html = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <!-- Header Module -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card">
        <div>
          <h2 class="text-xl md:text-2xl font-extrabold text-charcoal flex items-center gap-2">
            <span>🏦 Bank Alessia Cake - Pusat Arus Kas & Laporan Keuangan</span>
          </h2>
          <p class="text-xs md:text-sm text-pinkglass-800">Pemantauan real-time pemasukan omnichannel, pengeluaran kas, dan saldo laba bersih.</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Filter Buttons -->
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

      <!-- KPI Executive Financial Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Card Pemasukan -->
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm space-y-1">
          <div class="flex justify-between items-center text-emerald-700">
            <span class="text-[11px] font-bold uppercase tracking-wider">Total Pemasukan Masuk</span>
            <div class="p-2 rounded-xl bg-emerald-100"><i data-lucide="arrow-down-left" class="w-4 h-4 text-emerald-700"></i></div>
          </div>
          <h3 class="text-xl md:text-2xl font-extrabold text-emerald-700">Rp ${totalIncome.toLocaleString('id-ID')}</h3>
          <p class="text-[10px] text-pinkglass-800 font-medium">Periode: ${periodLabel} (${filteredOrders.length} Trx)</p>
        </div>

        <!-- Card Pengeluaran -->
        <div class="bg-white/80 p-5 rounded-3xl border border-pinkglass-200 glass-card shadow-sm space-y-1">
          <div class="flex justify-between items-center text-rose-700">
            <span class="text-[11px] font-bold uppercase tracking-wider">Total Pengeluaran Kas</span>
            <div class="p-2 rounded-xl bg-rose-100"><i data-lucide="arrow-up-right" class="w-4 h-4 text-rose-700"></i></div>
          </div>
          <h3 class="text-xl md:text-2xl font-extrabold text-rose-600">Rp ${totalExpense.toLocaleString('id-ID')}</h3>
          <p class="text-[10px] text-pinkglass-800 font-medium">Periode: ${periodLabel} (${filteredExpenses.length} Catatan)</p>
        </div>

        <!-- Card Net Balance (Saldo Akhir) -->
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

      <!-- Split QRIS vs Cash Breakdown Card -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white/80 p-4 rounded-2xl border border-pinkglass-200 glass-card flex items-center justify-between shadow-2xs">
          <div class="flex items-center space-x-3">
            <div class="p-3 rounded-xl bg-sky-100 text-sky-800"><i data-lucide="qr-code" class="w-5 h-5"></i></div>
            <div>
              <span class="text-[10px] font-bold text-pinkglass-800 uppercase">Transfer QRIS / Web</span>
              <h4 class="font-bold text-base text-charcoal">Rp ${qrisIncome.toLocaleString('id-ID')}</h4>
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

      <!-- Two Data Tables: Pemasukan & Pengeluaran -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tabel Pemasukan -->
        <div class="bg-white/80 p-6 rounded-3xl border border-pinkglass-200 glass-card space-y-4 shadow-sm">
          <h3 class="font-bold text-base text-charcoal border-b border-pinkglass-200 pb-3 flex justify-between items-center">
            <span class="flex items-center gap-1.5"><i data-lucide="trending-up" class="w-4 h-4 text-emerald-600"></i> Rincian Kas Masuk (Pemasukan)</span>
            <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">${filteredOrders.length} Trx</span>
          </h3>

          <div class="overflow-x-auto max-h-80 overflow-y-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-pinkglass-100 text-[10px] font-bold text-pinkglass-900 uppercase">
                  <th class="py-2 px-3">ID / Pelanggan</th>
                  <th class="py-2 px-3">Channel</th>
                  <th class="py-2 px-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody class="divide-y border-pinkglass-50 text-xs">
                ${filteredOrders.length === 0 ? `
                  <tr><td colspan="3" class="py-6 text-center text-pinkglass-800">Belum ada transaksi pemasukan pada periode ini.</td></tr>
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

        <!-- Tabel Pengeluaran -->
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
