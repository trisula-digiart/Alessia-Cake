/* ==========================================================
 * ALESSIA CAKE - API & REALTIME SYNC ENGINE (JS)
 * TRISULACODER v9.6 Enterprise Engine
 * ========================================================== */

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

/* ==========================================================
 * NOTIFIKASI SUARA DERING ORDERS MASUK (WEB AUDIO SYNTHESIZER)
 * ========================================================== */
window.playNewOrderNotificationSound = function() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Nada 1 (E5 - 659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Nada 2 (A5 - 880.00Hz) - Dering Dua Nada Melodis
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.15);
    gain2.gain.setValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch(e) {
    console.error('Audio Notification Play Error:', e);
  }
};

window.lastPendingOrderIds = new Set();

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
        // Cek apakah ada pesanan online Pending baru untuk memicu suara dering
        const currentPendingOnline = result.data.orders.filter(o => 
          o.order_status === 'Pending' && !String(o.order_type || '').includes('Offline')
        );

        let hasNewOrder = false;
        currentPendingOnline.forEach(o => {
          if (!window.lastPendingOrderIds.has(o.order_id)) {
            hasNewOrder = true;
          }
        });

        // Update Set pesanan pending
        window.lastPendingOrderIds = new Set(currentPendingOnline.map(o => o.order_id));

        if (hasNewOrder && currentPendingOnline.length > 0) {
          if (typeof window.playNewOrderNotificationSound === 'function') {
            window.playNewOrderNotificationSound();
          }
        }

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

      // Update badge navigasi dan viewport jika tidak sedang diketik user
      if (shouldRender && !window.isSyncLocked && !window.isUserInteracting()) {
        if (typeof window.renderNavigation === 'function') window.renderNavigation();
        if (typeof window.renderViewport === 'function') window.renderViewport();
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
