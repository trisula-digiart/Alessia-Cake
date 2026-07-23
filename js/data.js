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
  cart: []
};

const roleTabs = {
  owner: [
    { id: 'dashboard', name: 'Dashboard', icon: 'bar-chart-3' },
    { id: 'web_orders', name: 'Pesanan Masuk', icon: 'bell' },
    { id: 'offline_orders', name: 'Pesanan Offline', icon: 'calculator' },
    { id: 'kds', name: 'KDS Dapur', icon: 'chef-hat' },
    { id: 'catalog', name: 'Katalog Produk', icon: 'package' },
    { id: 'bom', name: 'Resep BOM', icon: 'book-open' },
    { id: 'update_stock', name: 'Stok Bahan', icon: 'database' },
    { id: 'audit', name: 'Audit Log', icon: 'file-text' }
  ],
  customer: [
    { id: 'catalog', name: 'Menu Utama', icon: 'shopping-bag' },
    { id: 'custom_builder', name: 'Custom Cake', icon: 'sliders' },
    { id: 'checkout', name: 'Keranjang', icon: 'shopping-cart' }
  ]
};

// Selected product state in BOM Manager
let activeBomProductId = 'PRD-01';
