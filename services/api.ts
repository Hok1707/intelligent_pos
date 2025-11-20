import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { StockItem, User } from '../types';

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
    // Handle global errors like 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Redirect to login or clear store
      console.error("Unauthorized access");
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// MOCK SERVER SETUP (Remove this block when connecting to real API)
// ============================================================================

const mock = new MockAdapter(api, { delayResponse: 600 }); // Simulate network delay

// --- Mock Data ---
let MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Alex Manager',
    email: 'user@smartpos.com',
    role: 'admin',
    avatar: 'https://picsum.photos/100/100',
    plan: 'starter',
    token: 'mock-jwt-token-123'
  }
];

let MOCK_STOCK: StockItem[] = [
  { id: '1', name: 'iPhone 15 Pro', sku: 'APL-15P-128', brand: 'Apple', category: 'Phone', price: 999, quantity: 12, status: 'In Stock' },
  { id: '2', name: 'Samsung S24 Ultra', sku: 'SAM-S24U-256', brand: 'Samsung', category: 'Phone', price: 1199, quantity: 4, status: 'Low Stock' },
  { id: '3', name: 'USB-C Cable', sku: 'ACC-USBC-1M', brand: 'Generic', category: 'Accessory', price: 19, quantity: 50, status: 'In Stock' },
  { id: '4', name: 'Pixel 8', sku: 'GOO-P8-128', brand: 'Google', category: 'Phone', price: 699, quantity: 0, status: 'Out of Stock' },
];

// --- Auth Routes ---
mock.onPost('/auth/login').reply((config) => {
  const { email } = JSON.parse(config.data);
  // Simple mock login logic
  const user = MOCK_USERS.find(u => u.email === email) || {
    id: '1',
    name: 'Alex Manager',
    email: email,
    role: 'admin',
    avatar: 'https://picsum.photos/100/100',
    plan: 'starter',
    token: 'mock-jwt-token-123'
  };
  
  return [200, {
    success: true,
    message: 'Login successful',
    data: user
  }];
});

mock.onPost('/auth/register').reply((config) => {
    const data = JSON.parse(config.data);
    const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.username,
        email: data.email,
        role: 'admin',
        avatar: 'https://picsum.photos/100/100',
        plan: 'starter',
        token: 'mock-jwt-token-new'
    };
    MOCK_USERS.push(newUser as User);
    return [200, {
        success: true,
        message: 'Registration successful',
        data: newUser
    }];
});

// --- Stock Routes ---
mock.onGet('/stock').reply(200, {
  success: true,
  message: 'Stock items fetched',
  data: MOCK_STOCK
});

mock.onPost('/stock').reply((config) => {
  const newItem = JSON.parse(config.data);
  const quantity = Number(newItem.quantity);
  const item: StockItem = {
      ...newItem,
      quantity,
      id: Math.random().toString(36).substr(2, 9),
      status: quantity === 0 ? 'Out of Stock' : quantity < 5 ? 'Low Stock' : 'In Stock'
  };
  MOCK_STOCK.push(item);
  return [201, {
    success: true,
    message: 'Item added',
    data: item
  }];
});

mock.onPut(/\/stock\/.+/).reply((config) => {
    const urlParts = config.url ? config.url.split('/') : [];
    const id = urlParts[urlParts.length - 1];
    const updates = JSON.parse(config.data);
    
    const index = MOCK_STOCK.findIndex(i => i.id === id);
    if (index > -1) {
        const updatedItem = { ...MOCK_STOCK[index], ...updates };
        // Recalc status if quantity changed
        if (updates.quantity !== undefined) {
             const qty = Number(updates.quantity);
             updatedItem.quantity = qty;
             updatedItem.status = qty === 0 ? 'Out of Stock' : qty < 5 ? 'Low Stock' : 'In Stock';
        }
        MOCK_STOCK[index] = updatedItem;
        
        return [200, {
            success: true,
            message: 'Item updated',
            data: MOCK_STOCK[index]
        }];
    }
    return [404, { success: false, message: 'Item not found', data: null }];
});

mock.onDelete(/\/stock\/.+/).reply((config) => {
    const urlParts = config.url ? config.url.split('/') : [];
    const id = urlParts[urlParts.length - 1];
    MOCK_STOCK = MOCK_STOCK.filter(i => i.id !== id);
    return [200, {
        success: true,
        message: 'Item deleted',
        data: { id }
    }];
});

mock.onPost('/stock/bulk-delete').reply((config) => {
    const { ids } = JSON.parse(config.data);
    MOCK_STOCK = MOCK_STOCK.filter(i => !ids.includes(i.id));
    return [200, {
        success: true,
        message: 'Items deleted',
        data: { ids }
    }];
});

mock.onPost('/stock/bulk-update').reply((config) => {
    const { ids, quantity } = JSON.parse(config.data);
    const qty = Number(quantity);
    const updatedItems: StockItem[] = [];
    
    MOCK_STOCK = MOCK_STOCK.map(item => {
        if (ids.includes(item.id)) {
            const status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 
                qty === 0 ? 'Out of Stock' : 
                qty < 5 ? 'Low Stock' : 'In Stock';
                
            const newItem: StockItem = { 
                ...item, 
                quantity: qty, 
                status
            };
            updatedItems.push(newItem);
            return newItem;
        }
        return item;
    });
    return [200, {
        success: true,
        message: 'Items updated',
        data: updatedItems
    }];
});

// ============================================================================

export default api;