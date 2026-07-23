window.showToast = function(msg) {
  const t = document.createElement('div');
  t.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-charcoal text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl z-[200] font-medium transition-all';
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
};

window.setGasApiUrl = function(url) {
  GAS_API_URL = url;
  localStorage.setItem('ALESSIA_GAS_URL', url);
  window.showToast('URL Backend GAS berhasil disimpan!');
  window.fetchInitialDataFromGAS();
};

window.isSyncLocked = false;
window.syncLockTimer = null;

window.lockSync = function(durationMs = 10000) {
  window.isSyncLocked = true;
  if (window.syncLockTimer) clearTimeout(window.syncLockTimer);
  window.syncLockTimer = setTimeout(() => {
    window.isSyncLocked = false;
  }, durationMs);
};

window.unlockSync = function() {
  window.isSyncLocked = false;
  if (window.syncLockTimer) clearTimeout(window.syncLockTimer);
};

window.isUserInteracting = function() {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || active.isContentEditable) {
    return true;
  }
  return false;
};

window.fetchInitialDataFromGAS = async function() {
  const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
  if (!savedUrl || savedUrl.includes('PASTE_YOUR')) return;

  try {
    const res = await fetch(`${savedUrl}?action=getInitialData`);
    const result = await res.json();
    if (result.success && result.data) {
      let shouldRender = false;
      
      if (result.data.products && result.data.products.length > 0) {
        appData.products = result.data.products;
        shouldRender = true;
      }
      if (result.data.ingredients && result.data.ingredients.length > 0) {
        appData.ingredients = result.data.ingredients;
        shouldRender = true;
      }
      if (result.data.orders && result.data.orders.length > 0) {
        appData.orders = result.data.orders;
        shouldRender = true;
      }
      
      // Protect recipes from being overwritten by stale polling data if write is locked
      if (!window.isSyncLocked && result.data.recipes) {
        appData.recipes = result.data.recipes;
        shouldRender = true;
      }

      if (result.data.expenses && result.data.expenses.length > 0) {
        appData.expenses = result.data.expenses;
        shouldRender = true;
      }

      // Only re-render if user is NOT currently typing or opening a select dropdown
      if (shouldRender && !window.isSyncLocked && !window.isUserInteracting()) {
        window.renderViewport();
      }
    }
  } catch (err) {
    console.error('GAS Sync error:', err);
  }
};

window.sendOrderToGAS = async function(newOrder, cartItems) {
  const savedUrl = localStorage.getItem('ALESSIA_GAS_URL') || GAS_API_URL;
  if (!savedUrl || savedUrl.includes('PASTE_YOUR')) return;

  try {
    const payload = {
      action: 'createOrder',
      user_role: currentRole,
      order: newOrder,
      ingredients: appData.ingredients,
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

    await fetch(savedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });

    // Sync refresh after short delay
    setTimeout(() => {
      window.fetchInitialDataFromGAS();
    }, 1000);
  } catch (err) {
    console.error('Order save error:', err);
  }
};

if (!window.gasSyncInterval) {
  window.gasSyncInterval = setInterval(() => {
    window.fetchInitialDataFromGAS();
  }, 8000);
}
