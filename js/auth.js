/* ==========================================================
 * ALESSIA CAKE - AUTHENTICATION & VIEWPORT ROUTER ENGINE (JS)
 * TRISULACODER v9.6 Enterprise Engine
 * ========================================================== */

window.openAuthModal = function() {
  const modal = document.getElementById('auth-gatekeeper-modal');
  if (modal) modal.classList.remove('hidden');
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
};

window.changeTab = function(tabId) {
  currentTab = tabId;
  window.renderNavigation();
  window.renderViewport();
};

window.renderNavigation = function() {
  const sidebar = document.getElementById('sidebar-nav');
  const mobileNav = document.getElementById('mobile-bottom-nav');
  const tabs = roleTabs[currentRole] || roleTabs['customer'];
  
  if (sidebar) {
    let sideHtml = `<div class="text-[11px] font-bold uppercase tracking-wider text-pinkglass-700 px-3 py-2">Menu ${currentRole.toUpperCase()}</div>`;
    tabs.forEach(tab => {
      const active = currentTab === tab.id;
      sideHtml += `
        <button onclick="window.changeTab('${tab.id}')" class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${active ? 'bg-pinkglass-600 text-white shadow-md' : 'text-charcoal hover:bg-pinkglass-100/60'}">
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
        <button onclick="window.changeTab('${tab.id}')" class="flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all ${active ? 'text-pinkglass-700 font-bold' : 'text-pinkglass-500 hover:text-charcoal'}">
          <i data-lucide="${tab.icon}" class="w-5 h-5 mb-0.5"></i>
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
