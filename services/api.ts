

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { StockItem, User, Customer, Invoice } from '../types';

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
// MOCK SERVER SETUP (Remove this block when connecting to real API)
// ============================================================================

const mock = new MockAdapter(api, { delayResponse: 300 }); 

// --- Mock Data with Shop Isolation ---
// Shop 1: SmartPOS HQ (Admin)
// Shop 2: Tech Zone (Manager)

let MOCK_USERS: User[] = [
  {
    id: '1',
    shopId: 'shop_1',
    name: 'Global Admin',
    email: 'admin@smartpos.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Global+Admin&background=2563eb&color=fff',
    plan: 'enterprise',
    token: 'mock-jwt-token-admin',
    phone: '+1 (555) 123-4567',
    status: 'active'
  },
  {
    id: '2',
    shopId: 'shop_2',
    name: 'Alex ShopOwner',
    email: 'user@smartpos.com',
    role: 'manager',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Owner&background=10b981&color=fff',
    plan: 'starter',
    token: 'mock-jwt-token-user',
    phone: '+1 (555) 987-6543',
    status: 'active'
  },
  {
    id: '3',
    shopId: 'shop_2',
    name: 'Sarah Staff',
    email: 'staff@smartpos.com',
    role: 'staff',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Staff&background=f59e0b&color=fff',
    plan: 'starter',
    token: 'mock-jwt-token-staff',
    phone: '+1 (555) 456-7890',
    status: 'active'
  }
];

let MOCK_STOCK: StockItem[] = [
  { id: '1', shopId: 'shop_2', name: 'iPhone 15 Pro', sku: 'APL-15P-128', brand: 'Apple', category: 'Phone', price: 999, quantity: 12, status: 'In Stock' },
  { id: '2', shopId: 'shop_2', name: 'Samsung S24 Ultra', sku: 'SAM-S24U-256', brand: 'Samsung', category: 'Phone', price: 1199, quantity: 4, status: 'Low Stock' },
  { id: '3', shopId: 'shop_2', name: 'USB-C Cable', sku: 'ACC-USBC-1M', brand: 'Generic', category: 'Accessory', price: 19, quantity: 50, status: 'In Stock' },
  // Data for another shop (isolated)
  { id: '4', shopId: 'shop_3', name: 'Hidden Pixel', sku: 'HIDDEN-1', brand: 'Google', category: 'Phone', price: 699, quantity: 10, status: 'In Stock' },
];

let MOCK_CUSTOMERS: Customer[] = [
  { 
    id: '1', 
    shopId: 'shop_2',
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '+1 (555) 123-4567', 
    address: '123 Main St', 
    totalSpent: 1250.00, 
    status: 'active', 
    joinDate: '2023-01-15',
    notes: 'Prefer text updates. Interested in new iPhone cases.'
  },
  { 
    id: '2', 
    shopId: 'shop_2',
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '+1 (555) 987-6543', 
    address: '456 Oak Ave', 
    totalSpent: 3400.50, 
    status: 'active', 
    joinDate: '2023-03-20',
    notes: 'VIP customer.'
  },
  // Isolated customer
  { 
    id: '3', 
    shopId: 'shop_3',
    name: 'Ghost User', 
    email: 'ghost@example.com', 
    phone: '+1 (555) 000-0000', 
    address: 'Nowhere', 
    totalSpent: 0.00, 
    status: 'active', 
    joinDate: '2023-11-05' 
  },
];

let MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    shopId: 'shop_2',
    number: 'INV-2024-001',
    customerName: 'John Doe',
    date: '2024-03-01',
    dueDate: '2024-03-15',
    items: [{ id: '1', description: 'iPhone 15 Pro', quantity: 1, price: 999 }],
    subtotal: 999,
    tax: 99.9,
    total: 1098.9,
    status: 'paid'
  },
];

// --- Helper to get current user from token in headers ---
const getCurrentUser = (headers: any): User | undefined => {
    const authHeader = headers.Authorization;
    if (!authHeader) return undefined;
    const token = authHeader.replace('Bearer ', '');
    return MOCK_USERS.find(u => u.token === token);
};

// --- Helper to filter data by shop ---
const filterByShop = <T extends { shopId: string }>(data: T[], user: User): T[] => {
    if (user.role === 'admin') return data; // Admin sees all
    return data.filter(item => item.shopId === user.shopId);
};

// --- Auth Routes ---
mock.onPost('/auth/login').reply((config) => {
  const { email } = JSON.parse(config.data);
  
  const user = MOCK_USERS.find(u => u.email === email);
  
  if (user) {
      return [200, {
        success: true,
        message: 'Login successful',
        data: user
      }];
  }

  // Fallback for testing if user doesn't exist in static list
  return [200, {
    success: true,
    message: 'Login successful (Fallback)',
    data: {
        id: '999',
        shopId: 'shop_fallback',
        name: 'Demo User',
        email: email,
        role: 'manager',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User',
        plan: 'starter',
        token: 'mock-jwt-token-demo',
        status: 'active'
    }
  }];
});

mock.onPost('/auth/register').reply((config) => {
    const data = JSON.parse(config.data);
    const newShopId = `shop_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        shopId: newShopId, // New shop for new registration
        name: data.username,
        email: data.email,
        role: 'manager', // Registering user is manager of their shop
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=random`,
        plan: 'starter',
        token: `mock-jwt-token-${Date.now()}`,
        status: 'active'
    };
    MOCK_USERS.push(newUser);
    return [200, {
        success: true,
        message: 'Registration successful',
        data: newUser
    }];
});

mock.onPut(/\/auth\/profile\/.+/).reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

    const urlParts = config.url ? config.url.split('/') : [];
    const id = urlParts[urlParts.length - 1];
    const updates = JSON.parse(config.data);

    // Only allow updating self
    if (currentUser.id !== id) return [403, { success: false, message: 'Forbidden' }];

    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index > -1) {
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
        return [200, {
            success: true,
            message: 'Profile updated',
            data: MOCK_USERS[index]
        }];
    }
    return [404, { success: false, message: 'User not found' }];
});

// --- User Routes ---
mock.onGet('/users').reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];
    
    // Filter users: Only show users in the same shop, unless admin
    const shopUsers = filterByShop(MOCK_USERS, currentUser);
    
    return [200, {
        success: true,
        data: shopUsers
    }];
});

mock.onPost('/users').reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

    // RBAC: Staff cannot create users
    if (currentUser.role === 'staff') return [403, { success: false, message: 'Staff cannot create users' }];

    const newUserPayload = JSON.parse(config.data);
    const newUser: User = {
        ...newUserPayload,
        id: Math.random().toString(36).substr(2, 9),
        shopId: currentUser.shopId, // Inherit shop ID
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUserPayload.name)}&background=random`,
        status: newUserPayload.status || 'active',
        plan: currentUser.plan // Inherit plan (visual only, limits handled in UI)
    };
    MOCK_USERS.push(newUser);
    return [201, {
        success: true,
        message: 'User created',
        data: newUser
    }];
});

mock.onPut(/\/users\/.+/).reply((config) => {
   const currentUser = getCurrentUser(config.headers);
   if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

   // RBAC: Staff cannot edit other users (except profile, handled in auth route)
   if (currentUser.role === 'staff') return [403, { success: false, message: 'Staff cannot edit users' }];

   const urlParts = config.url ? config.url.split('/') : [];
   const id = urlParts[urlParts.length - 1];
   const updates = JSON.parse(config.data);

   const index = MOCK_USERS.findIndex(u => u.id === id);
   
   // Check permission: Must be same shop (or admin)
   if (index > -1) {
       const targetUser = MOCK_USERS[index];
       if (currentUser.role !== 'admin' && targetUser.shopId !== currentUser.shopId) {
           return [403, { success: false, message: 'Forbidden' }];
       }

       MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
       return [200, {
         success: true,
         message: 'User updated',
         data: MOCK_USERS[index]
       }];
   }
   return [404, { success: false, message: 'User not found' }];
});

mock.onDelete(/\/users\/.+/).reply((config) => {
   const currentUser = getCurrentUser(config.headers);
   if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

   // RBAC: Staff cannot delete users
   if (currentUser.role === 'staff') return [403, { success: false, message: 'Staff cannot delete users' }];

   const urlParts = config.url ? config.url.split('/') : [];
   const id = urlParts[urlParts.length - 1];
   
   const targetUser = MOCK_USERS.find(u => u.id === id);
   if (targetUser) {
       if (currentUser.role !== 'admin' && targetUser.shopId !== currentUser.shopId) {
           return [403, { success: false, message: 'Forbidden' }];
       }
       MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
       return [200, { success: true, message: 'User deleted', data: { id } }];
   }
   return [404, { success: false, message: 'User not found' }];
});

// --- Customer Routes ---
mock.onGet('/customers').reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];
    return [200, { success: true, data: filterByShop(MOCK_CUSTOMERS, currentUser) }];
});

mock.onPost('/customers').reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

    const newCustomer = JSON.parse(config.data);
    const customer: Customer = {
        ...newCustomer,
        id: Math.random().toString(36).substr(2, 9),
        shopId: currentUser.shopId, // Inherit Shop ID
        totalSpent: 0,
        joinDate: new Date().toISOString().split('T')[0]
    };
    MOCK_CUSTOMERS.push(customer);
    return [201, { success: true, message: 'Customer created', data: customer }];
});

mock.onPut(/\/customers\/.+/).reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

    const urlParts = config.url ? config.url.split('/') : [];
    const id = urlParts[urlParts.length - 1];
    const updates = JSON.parse(config.data);

    const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
    if (index > -1 && (currentUser.role === 'admin' || MOCK_CUSTOMERS[index].shopId === currentUser.shopId)) {
        MOCK_CUSTOMERS[index] = { ...MOCK_CUSTOMERS[index], ...updates };
        return [200, { success: true, message: 'Customer updated', data: MOCK_CUSTOMERS[index] }];
    }
    return [404, { success: false, message: 'Customer not found or access denied' }];
});

mock.onDelete(/\/customers\/.+/).reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];
    
    // Staff generally can view but maybe not delete customers? Let's allow them for now but could restrict.
    
    const urlParts = config.url ? config.url.split('/') : [];
    const id = urlParts[urlParts.length - 1];

    const target = MOCK_CUSTOMERS.find(c => c.id === id);
    if (target && (currentUser.role === 'admin' || target.shopId === currentUser.shopId)) {
        MOCK_CUSTOMERS = MOCK_CUSTOMERS.filter(c => c.id !== id);
        return [200, { success: true, message: 'Customer deleted', data: { id } }];
    }
    return [404, { success: false, message: 'Customer not found' }];
});

// --- Stock Routes ---
mock.onGet('/stock').reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];
    return [200, { success: true, data: filterByShop(MOCK_STOCK, currentUser) }];
});

mock.onPost('/stock').reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

    const newItem = JSON.parse(config.data);
    const quantity = Number(newItem.quantity);
    const item: StockItem = {
        ...newItem,
        quantity,
        id: Math.random().toString(36).substr(2, 9),
        shopId: currentUser.shopId,
        status: quantity === 0 ? 'Out of Stock' : quantity < 5 ? 'Low Stock' : 'In Stock'
    };
    MOCK_STOCK.push(item);
    return [201, { success: true, message: 'Item added', data: item }];
});

mock.onPut(/\/stock\/.+/).reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

    const urlParts = config.url ? config.url.split('/') : [];
    const id = urlParts[urlParts.length - 1];
    const updates = JSON.parse(config.data);
    
    const index = MOCK_STOCK.findIndex(i => i.id === id);
    if (index > -1 && (currentUser.role === 'admin' || MOCK_STOCK[index].shopId === currentUser.shopId)) {
        const updatedItem = { ...MOCK_STOCK[index], ...updates };
        if (updates.quantity !== undefined) {
             const qty = Number(updates.quantity);
             updatedItem.quantity = qty;
             updatedItem.status = qty === 0 ? 'Out of Stock' : qty < 5 ? 'Low Stock' : 'In Stock';
        }
        MOCK_STOCK[index] = updatedItem;
        return [200, { success: true, message: 'Item updated', data: MOCK_STOCK[index] }];
    }
    return [404, { success: false, message: 'Item not found' }];
});

mock.onDelete(/\/stock\/.+/).reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

    // RBAC: Staff cannot delete stock items
    if (currentUser.role === 'staff') return [403, { success: false, message: 'Staff cannot delete items' }];

    const urlParts = config.url ? config.url.split('/') : [];
    const id = urlParts[urlParts.length - 1];
    
    const target = MOCK_STOCK.find(i => i.id === id);
    if (target && (currentUser.role === 'admin' || target.shopId === currentUser.shopId)) {
        MOCK_STOCK = MOCK_STOCK.filter(i => i.id !== id);
        return [200, { success: true, message: 'Item deleted', data: { id } }];
    }
    return [404, { success: false, message: 'Item not found' }];
});

mock.onPost('/stock/bulk-delete').reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

    // RBAC: Staff cannot bulk delete
    if (currentUser.role === 'staff') return [403, { success: false, message: 'Staff cannot delete items' }];

    const { ids } = JSON.parse(config.data);
    // Filter out items not belonging to shop before deleting
    MOCK_STOCK = MOCK_STOCK.filter(i => {
        if (ids.includes(i.id)) {
            if (currentUser.role === 'admin' || i.shopId === currentUser.shopId) {
                return false; // Delete it
            }
        }
        return true; // Keep it
    });
    return [200, { success: true, message: 'Items deleted', data: { ids } }];
});

mock.onPost('/stock/bulk-update').reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

    const { ids, quantity } = JSON.parse(config.data);
    const qty = Number(quantity);
    const updatedItems: StockItem[] = [];
    
    MOCK_STOCK = MOCK_STOCK.map(item => {
        if (ids.includes(item.id) && (currentUser.role === 'admin' || item.shopId === currentUser.shopId)) {
            const status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 
                qty === 0 ? 'Out of Stock' : 
                qty < 5 ? 'Low Stock' : 'In Stock';
                
            const newItem: StockItem = { ...item, quantity: qty, status };
            updatedItems.push(newItem);
            return newItem;
        }
        return item;
    });
    return [200, { success: true, message: 'Items updated', data: updatedItems }];
});

// --- Invoice Routes ---
mock.onGet('/invoices').reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];
    return [200, { success: true, data: filterByShop(MOCK_INVOICES, currentUser) }];
});

mock.onPost('/invoices').reply((config) => {
    const currentUser = getCurrentUser(config.headers);
    if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

    const newInvoice = JSON.parse(config.data);
    const invoice: Invoice = {
        ...newInvoice,
        id: Math.random().toString(36).substr(2, 9),
        shopId: currentUser.shopId
    };
    MOCK_INVOICES.unshift(invoice);
    return [201, { success: true, message: 'Invoice created', data: invoice }];
});

mock.onPut(/\/invoices\/.+/).reply((config) => {
   const currentUser = getCurrentUser(config.headers);
   if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

   const urlParts = config.url ? config.url.split('/') : [];
   const id = urlParts[urlParts.length - 1];
   const updates = JSON.parse(config.data);

   const index = MOCK_INVOICES.findIndex(i => i.id === id);
   if (index > -1 && (currentUser.role === 'admin' || MOCK_INVOICES[index].shopId === currentUser.shopId)) {
     MOCK_INVOICES[index] = { ...MOCK_INVOICES[index], ...updates };
     return [200, { success: true, message: 'Invoice updated', data: MOCK_INVOICES[index] }];
   }
   return [404, { success: false, message: 'Invoice not found' }];
});

mock.onDelete(/\/invoices\/.+/).reply((config) => {
   const currentUser = getCurrentUser(config.headers);
   if (!currentUser) return [401, { success: false, message: 'Unauthorized' }];

   // Staff usually shouldn't delete invoices, but let's allow it for now or restrict it if needed.
   // For strong RBAC, restricting deletion is better.
   if (currentUser.role === 'staff') return [403, { success: false, message: 'Staff cannot delete invoices' }];

   const urlParts = config.url ? config.url.split('/') : [];
   const id = urlParts[urlParts.length - 1];
   
   const target = MOCK_INVOICES.find(i => i.id === id);
   if (target && (currentUser.role === 'admin' || target.shopId === currentUser.shopId)) {
       MOCK_INVOICES = MOCK_INVOICES.filter(i => i.id !== id);
       return [200, { success: true, message: 'Invoice deleted', data: { id } }];
   }
   return [404, { success: false, message: 'Invoice not found' }];
});

export default api;
