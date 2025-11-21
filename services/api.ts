
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { StockItem, User, Customer, Invoice, StockLog, Order } from '../types';

// 1. Create Axios Instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor for Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access");
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// MOCK SERVER SETUP
// ============================================================================

const mock = new MockAdapter(api, { delayResponse: 400 });

// --- 1. Mock Users (Multi-Tenant Setup) ---
let MOCK_USERS: User[] = [
  {
    id: '1',
    shopId: 'global', // Admin sees all
    name: 'Super Admin',
    email: 'admin@smartpos.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=7c3aed&color=fff',
    plan: 'enterprise',
    token: 'token-admin',
    phone: '+1 (555) 000-0000',
    status: 'active'
  },
  {
    id: '2',
    shopId: 'shop_1',
    name: 'Alex Manager',
    email: 'alex@shop1.com',
    role: 'manager',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Manager&background=2563eb&color=fff',
    plan: 'pro',
    token: 'token-manager-1',
    phone: '+1 (555) 111-1111',
    status: 'active'
  },
  {
    id: '3',
    shopId: 'shop_1',
    name: 'Sarah Staff',
    email: 'sarah@shop1.com',
    role: 'staff',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Staff&background=3b82f6&color=fff',
    plan: 'pro',
    token: 'token-staff-1',
    phone: '+1 (555) 222-2222',
    status: 'active'
  },
  {
    id: '4',
    shopId: 'shop_2',
    name: 'Bob Owner',
    email: 'bob@shop2.com',
    role: 'manager',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Owner&background=f59e0b&color=fff',
    plan: 'starter',
    token: 'token-manager-2',
    phone: '+1 (555) 333-3333',
    status: 'active'
  },
  {
    id: '5',
    shopId: 'shop_2',
    name: 'Emily Staff',
    email: 'emily@shop2.com',
    role: 'staff',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Staff&background=ec4899&color=fff',
    plan: 'starter',
    token: 'token-staff-2',
    phone: '+1 (555) 444-4444',
    status: 'active'
  }
];

// --- 2. Mock Data (Shop 1: Electronics) ---
const SHOP_1_STOCK: StockItem[] = [
  { id: 's1-1', shopId: 'shop_1', name: 'iPhone 15 Pro', sku: 'APL-15P', brand: 'Apple', category: 'Phone', price: 999, costPrice: 850, quantity: 12, status: 'In Stock', image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845761599' },
  { id: 's1-2', shopId: 'shop_1', name: 'Samsung S24 Ultra', sku: 'SAM-S24', brand: 'Samsung', category: 'Phone', price: 1199, costPrice: 950, quantity: 3, status: 'Low Stock', image: 'https://images.samsung.com/is/image/samsung/p6pim/kv/sm-s928bzkweuc/gallery/kv-sm-s928bzkweuc-539609122?$650_519_PNG$' },
  { id: 's1-3', shopId: 'shop_1', name: 'USB-C Cable', sku: 'ACC-USB', brand: 'Generic', category: 'Accessory', price: 19, costPrice: 5, quantity: 50, status: 'In Stock' },
];

const SHOP_1_ORDERS: Order[] = [
  { id: 'o1-1', shopId: 'shop_1', orderNumber: 'ORD-1001', customerName: 'John Doe', subtotal: 999, tax: 0, total: 999, status: 'paid', paymentMethod: 'card', items: [{ productId: 's1-1', name: 'iPhone 15 Pro', price: 999, quantity: 1 }], createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'o1-2', shopId: 'shop_1', orderNumber: 'ORD-1002', customerName: 'Jane Smith', subtotal: 19, tax: 0, total: 19, status: 'paid', paymentMethod: 'cash', items: [{ productId: 's1-3', name: 'USB-C Cable', price: 19, quantity: 1 }], createdAt: new Date().toISOString() },
];

const SHOP_1_CUSTOMERS: Customer[] = [
  { id: 'c1-1', shopId: 'shop_1', name: 'John Doe', email: 'john@email.com', phone: '555-0101', totalSpent: 999, status: 'active', joinDate: '2024-01-01' },
];

// --- 3. Mock Data (Shop 2: Clothing) ---
const SHOP_2_STOCK: StockItem[] = [
  { id: 's2-1', shopId: 'shop_2', name: 'Cotton T-Shirt', sku: 'TSH-001', brand: 'Uniqlo', category: 'Apparel', price: 25, costPrice: 10, quantity: 100, status: 'In Stock' },
  { id: 's2-2', shopId: 'shop_2', name: 'Denim Jeans', sku: 'JNS-002', brand: 'Levi', category: 'Apparel', price: 60, costPrice: 30, quantity: 20, status: 'In Stock' },
  { id: 's2-3', shopId: 'shop_2', name: 'Sneakers', sku: 'SNK-003', brand: 'Nike', category: 'Footwear', price: 120, costPrice: 60, quantity: 2, status: 'Low Stock' },
];

const SHOP_2_ORDERS: Order[] = [
  { id: 'o2-1', shopId: 'shop_2', orderNumber: 'ORD-2001', customerName: 'Alice Fashion', subtotal: 85, tax: 8.5, total: 93.5, status: 'paid', paymentMethod: 'card', items: [{ productId: 's2-1', name: 'Cotton T-Shirt', price: 25, quantity: 1 }, { productId: 's2-2', name: 'Denim Jeans', price: 60, quantity: 1 }], createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const SHOP_2_CUSTOMERS: Customer[] = [
  { id: 'c2-1', shopId: 'shop_2', name: 'Alice Fashion', email: 'alice@email.com', phone: '555-0202', totalSpent: 93.5, status: 'active', joinDate: '2024-02-15' },
];

// --- Combine Data ---
let MOCK_STOCK = [...SHOP_1_STOCK, ...SHOP_2_STOCK];
let MOCK_ORDERS = [...SHOP_1_ORDERS, ...SHOP_2_ORDERS];
let MOCK_CUSTOMERS = [...SHOP_1_CUSTOMERS, ...SHOP_2_CUSTOMERS];
let MOCK_INVOICES: Invoice[] = [];
let MOCK_LOGS: StockLog[] = [];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getCurrentUser = (headers: any): User | undefined => {
    const authHeader = headers.Authorization;
    if (!authHeader) return undefined;
    const token = authHeader.replace('Bearer ', '');
    return MOCK_USERS.find(u => u.token === token);
};

// Filter data based on role and shopId
const filterByShop = <T extends { shopId: string }>(data: T[], user: User): T[] => {
    if (user.role === 'admin') return data;
    return data.filter(item => item.shopId === user.shopId);
};

const addLog = (stockId: string, shopId: string, action: StockLog['action'], user: User, details: string) => {
    MOCK_LOGS.unshift({
        id: Math.random().toString(36).substr(2, 9),
        stockId,
        shopId,
        action,
        userId: user.id,
        userName: user.name,
        details,
        timestamp: new Date().toISOString()
    });
};

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

// --- Auth ---
mock.onPost('/auth/login').reply((config) => {
  const { email } = JSON.parse(config.data);
  const user = MOCK_USERS.find(u => u.email === email);
  if (user) {
      return [200, { success: true, data: user }];
  }
  return [401, { success: false, message: 'Invalid credentials' }];
});

mock.onPost('/auth/register').reply((config) => {
    const data = JSON.parse(config.data);
    const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        shopId: `shop_${Date.now()}`,
        name: data.username,
        email: data.email,
        role: 'manager',
        plan: 'starter',
        token: `token-${Date.now()}`,
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=random`
    };
    MOCK_USERS.push(newUser);
    return [200, { success: true, data: newUser }];
});

mock.onPut(/\/auth\/profile\/.+/).reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, {}];
    const updates = JSON.parse(config.data);
    const targetIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
    
    if (targetIndex > -1) {
        MOCK_USERS[targetIndex] = { ...MOCK_USERS[targetIndex], ...updates };
        return [200, { success: true, data: MOCK_USERS[targetIndex] }];
    }
    return [404, { success: false }];
});

// --- Stock ---
mock.onGet('/stock').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    return [200, { success: true, data: filterByShop(MOCK_STOCK, user) }];
});

mock.onPost('/stock').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    
    const data = JSON.parse(config.data);
    const newItem: StockItem = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        shopId: user.shopId, // Enforce shopId
        status: Number(data.quantity) === 0 ? 'Out of Stock' : Number(data.quantity) < 5 ? 'Low Stock' : 'In Stock'
    };
    MOCK_STOCK.push(newItem);
    
    // Audit Log
    addLog(newItem.id, newItem.shopId, 'create', user, `Created item: ${newItem.name} (Qty: ${newItem.quantity})`);

    return [201, { success: true, data: newItem }];
});

mock.onPut(/\/stock\/.+/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    
    const id = config.url?.split('/').pop();
    const itemIndex = MOCK_STOCK.findIndex(i => i.id === id);
    
    if (itemIndex > -1) {
        const existingItem = MOCK_STOCK[itemIndex];
        // Security check: Does item belong to user's shop?
        if (user.role !== 'admin' && existingItem.shopId !== user.shopId) {
            return [403, { success: false, message: 'Access denied' }];
        }

        const updates = JSON.parse(config.data);
        const updatedItem = { ...existingItem, ...updates };
        
        if (updates.quantity !== undefined) {
             const qty = Number(updates.quantity);
             updatedItem.status = qty === 0 ? 'Out of Stock' : qty < 5 ? 'Low Stock' : 'In Stock';
        }
        
        // Audit Log - Calculate Changes
        const changes = [];
        if (updates.quantity !== undefined && updates.quantity !== existingItem.quantity) {
            changes.push(`Quantity: ${existingItem.quantity} -> ${updates.quantity}`);
        }
        if (updates.price !== undefined && updates.price !== existingItem.price) {
            changes.push(`Price: $${existingItem.price} -> $${updates.price}`);
        }
        if (updates.name && updates.name !== existingItem.name) {
            changes.push(`Name updated`);
        }
        
        if (changes.length > 0) {
            addLog(updatedItem.id, updatedItem.shopId, 'update', user, changes.join(', '));
        }

        MOCK_STOCK[itemIndex] = updatedItem;
        return [200, { success: true, data: updatedItem }];
    }
    return [404, {}];
});

mock.onDelete(/\/stock\/.+/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const id = config.url?.split('/').pop();
    
    const item = MOCK_STOCK.find(i => i.id === id);
    if (item && (user.role === 'admin' || item.shopId === user.shopId)) {
        MOCK_STOCK = MOCK_STOCK.filter(i => i.id !== id);
        // Log deletion before removing? Or maybe we assume deletion removes history access. 
        // Usually systems Soft Delete, but for this mock we just remove.
        return [200, { success: true, data: { id } }];
    }
    return [403, { success: false }];
});

mock.onPost('/stock/bulk-update').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const { ids, quantity } = JSON.parse(config.data);
    const qty = Number(quantity);
    const updated: StockItem[] = [];

    MOCK_STOCK = MOCK_STOCK.map(item => {
        if (ids.includes(item.id) && (user.role === 'admin' || item.shopId === user.shopId)) {
            const oldQty = item.quantity;
            const status = qty === 0 ? 'Out of Stock' : qty < 5 ? 'Low Stock' : 'In Stock';
            const newItem = { ...item, quantity: qty, status: status as any };
            updated.push(newItem);
            
            if (oldQty !== qty) {
                addLog(newItem.id, newItem.shopId, 'bulk_update', user, `Bulk update: Quantity ${oldQty} -> ${qty}`);
            }
            
            return newItem;
        }
        return item;
    });
    return [200, { success: true, data: updated }];
});

mock.onPost('/stock/bulk-delete').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const { ids } = JSON.parse(config.data);
    
    MOCK_STOCK = MOCK_STOCK.filter(item => {
        if (ids.includes(item.id)) {
            // Only delete if owned by user
            return !(user.role === 'admin' || item.shopId === user.shopId);
        }
        return true;
    });
    
    return [200, { success: true, data: { ids } }];
});

mock.onGet(/\/stock\/.+\/logs/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    
    // Extract ID from /stock/ID/logs
    // Regex matching ensures structure, but let's split carefully
    const urlParts = config.url?.split('/');
    // [ "", "stock", "ID", "logs" ]
    const id = urlParts?.[2];
    
    if (id) {
        const logs = MOCK_LOGS.filter(l => l.stockId === id);
        return [200, { success: true, data: logs }];
    }
    return [400, { success: false }];
});

// --- Orders ---
mock.onGet('/orders').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    return [200, { success: true, data: filterByShop(MOCK_ORDERS, user) }];
});

mock.onPost('/orders').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    
    const data = JSON.parse(config.data);
    const newOrder: Order = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        shopId: user.shopId,
        orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString()
    };
    MOCK_ORDERS.unshift(newOrder);
    
    // Auto-deduct stock and Log
    newOrder.items.forEach(orderItem => {
        const stockIdx = MOCK_STOCK.findIndex(s => s.id === orderItem.productId);
        if (stockIdx > -1) {
            const item = MOCK_STOCK[stockIdx];
            const oldQty = item.quantity;
            item.quantity = Math.max(0, item.quantity - orderItem.quantity);
            if(item.quantity < 5) item.status = 'Low Stock';
            if(item.quantity === 0) item.status = 'Out of Stock';
            
            addLog(item.id, item.shopId, 'update', user, `Order ${newOrder.orderNumber}: Qty ${oldQty} -> ${item.quantity}`);
        }
    });

    return [201, { success: true, data: newOrder }];
});

mock.onPut(/\/orders\/.+/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    
    const id = config.url?.split('/').pop();
    const { status } = JSON.parse(config.data);
    
    const idx = MOCK_ORDERS.findIndex(o => o.id === id);
    if (idx > -1) {
        if (user.role !== 'admin' && MOCK_ORDERS[idx].shopId !== user.shopId) {
            return [403, {}];
        }
        MOCK_ORDERS[idx].status = status;
        return [200, { success: true, data: MOCK_ORDERS[idx] }];
    }
    return [404, {}];
});

mock.onDelete(/\/orders\/.+/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const id = config.url?.split('/').pop();
    const order = MOCK_ORDERS.find(o => o.id === id);
    if(order && (user.role === 'admin' || order.shopId === user.shopId)) {
        MOCK_ORDERS = MOCK_ORDERS.filter(o => o.id !== id);
        return [200, { success: true, data: { id } }];
    }
    return [403, {}];
});

// --- Customers ---
mock.onGet('/customers').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    return [200, { success: true, data: filterByShop(MOCK_CUSTOMERS, user) }];
});

mock.onPost('/customers').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    
    const data = JSON.parse(config.data);
    const newCustomer: Customer = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        shopId: user.shopId,
        totalSpent: 0,
        joinDate: new Date().toISOString().split('T')[0]
    };
    MOCK_CUSTOMERS.push(newCustomer);
    return [201, { success: true, data: newCustomer }];
});

mock.onPut(/\/customers\/.+/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const id = config.url?.split('/').pop();
    const updates = JSON.parse(config.data);
    
    const idx = MOCK_CUSTOMERS.findIndex(c => c.id === id);
    if (idx > -1) {
        if (user.role !== 'admin' && MOCK_CUSTOMERS[idx].shopId !== user.shopId) return [403, {}];
        MOCK_CUSTOMERS[idx] = { ...MOCK_CUSTOMERS[idx], ...updates };
        return [200, { success: true, data: MOCK_CUSTOMERS[idx] }];
    }
    return [404, {}];
});

mock.onDelete(/\/customers\/.+/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const id = config.url?.split('/').pop();
    const c = MOCK_CUSTOMERS.find(c => c.id === id);
    if (c && (user.role === 'admin' || c.shopId === user.shopId)) {
        MOCK_CUSTOMERS = MOCK_CUSTOMERS.filter(c => c.id !== id);
        return [200, { success: true, data: { id } }];
    }
    return [403, {}];
});

// --- Users ---
mock.onGet('/users').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    
    // Admin sees all, others see shop users
    return [200, { success: true, data: filterByShop(MOCK_USERS, user) }];
});

mock.onPost('/users').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    
    const data = JSON.parse(config.data);
    const newUser: User = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        shopId: user.role === 'admin' && data.shopId ? data.shopId : user.shopId, // Admin can set shopId, else inherit
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
        plan: user.plan // Inherit plan
    };
    MOCK_USERS.push(newUser);
    return [201, { success: true, data: newUser }];
});

mock.onPut(/\/users\/.+/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const id = config.url?.split('/').pop();
    const updates = JSON.parse(config.data);
    
    const idx = MOCK_USERS.findIndex(u => u.id === id);
    if(idx > -1) {
        if(user.role !== 'admin' && MOCK_USERS[idx].shopId !== user.shopId) return [403, {}];
        MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...updates };
        return [200, { success: true, data: MOCK_USERS[idx] }];
    }
    return [404, {}];
});

mock.onDelete(/\/users\/.+/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const id = config.url?.split('/').pop();
    
    const target = MOCK_USERS.find(u => u.id === id);
    if (target) {
        if(target.role === 'admin') return [403, { message: 'Cannot delete admin' }];
        if(user.role !== 'admin' && target.shopId !== user.shopId) return [403, {}];
        
        MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
        return [200, { success: true, data: { id } }];
    }
    return [404, {}];
});

// --- Invoices ---
mock.onGet('/invoices').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    return [200, { success: true, data: filterByShop(MOCK_INVOICES, user) }];
});

mock.onPost('/invoices').reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const data = JSON.parse(config.data);
    const inv: Invoice = { ...data, id: Math.random().toString(36).substr(2, 9), shopId: user.shopId };
    MOCK_INVOICES.unshift(inv);
    return [201, { success: true, data: inv }];
});

mock.onPut(/\/invoices\/.+/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const id = config.url?.split('/').pop();
    const updates = JSON.parse(config.data);
    const idx = MOCK_INVOICES.findIndex(i => i.id === id);
    if(idx > -1) {
        if(user.role !== 'admin' && MOCK_INVOICES[idx].shopId !== user.shopId) return [403, {}];
        MOCK_INVOICES[idx] = { ...MOCK_INVOICES[idx], ...updates };
        return [200, { success: true, data: MOCK_INVOICES[idx] }];
    }
    return [404, {}];
});

mock.onDelete(/\/invoices\/.+/).reply((config) => {
    const user = getCurrentUser(config.headers);
    if (!user) return [401, {}];
    const id = config.url?.split('/').pop();
    const inv = MOCK_INVOICES.find(i => i.id === id);
    if(inv && (user.role === 'admin' || inv.shopId === user.shopId)) {
        MOCK_INVOICES = MOCK_INVOICES.filter(i => i.id !== id);
        return [200, { success: true, data: { id } }];
    }
    return [403, {}];
});

export default api;
