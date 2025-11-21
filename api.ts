
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
    shopId: 'shop_1',
    name: 'Alex Manager',
    email: 'user@smartpos.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Manager&background=2563eb&color=fff',
    plan: 'starter',
    token: 'mock-jwt-token-123',
    phone: '+1 (555) 123-4567',
    status: 'active'
  },
  {
    id: '2',
    shopId: 'shop_1',
    name: 'Sarah Staff',
    email: 'staff@smartpos.com',
    role: 'staff',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Staff&background=10b981&color=fff',
    plan: 'starter',
    token: 'mock-jwt-token-456',
    phone: '+1 (555) 987-6543',
    status: 'active'
  },
  {
    id: '3',
    shopId: 'shop_1',
    name: 'Mike Technician',
    email: 'tech@smartpos.com',
    role: 'staff',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Tech&background=f59e0b&color=fff',
    plan: 'starter',
    token: 'mock-jwt-token-789',
    phone: '+1 (555) 456-7890',
    status: 'inactive'
  }
];

let MOCK_STOCK: StockItem[] = [
  { id: '1', shopId: 'shop_1', name: 'iPhone 15 Pro', sku: 'APL-15P-128', brand: 'Apple', category: 'Phone', price: 999, quantity: 12, status: 'In Stock' },
  { id: '2', shopId: 'shop_1', name: 'Samsung S24 Ultra', sku: 'SAM-S24U-256', brand: 'Samsung', category: 'Phone', price: 1199, quantity: 4, status: 'Low Stock' },
  { id: '3', shopId: 'shop_1', name: 'USB-C Cable', sku: 'ACC-USBC-1M', brand: 'Generic', category: 'Accessory', price: 19, quantity: 50, status: 'In Stock' },
  { id: '4', shopId: 'shop_1', name: 'Pixel 8', sku: 'GOO-P8-128', brand: 'Google', category: 'Phone', price: 699, quantity: 0, status: 'Out of Stock' },
];

let MOCK_CUSTOMERS: Customer[] = [
  { 
    id: '1',
    shopId: 'shop_1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '+1 (555) 123-4567', 
    address: '123 Main St', 
    totalSpent: 1250.00, 
    status: 'active', 
    joinDate: '2023-01-15',
    notes: 'Prefer text updates. interested in new iPhone cases.'
  },
  { 
    id: '2',
    shopId: 'shop_1', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '+1 (555) 987-6543', 
    address: '456 Oak Ave', 
    totalSpent: 3400.50, 
    status: 'active', 
    joinDate: '2023-03-20',
    notes: 'VIP customer. Always buys extended warranty.'
  },
  { 
    id: '3',
    shopId: 'shop_1', 
    name: 'Bob Johnson', 
    email: 'bob@example.com', 
    phone: '+1 (555) 555-5555', 
    address: '789 Pine Ln', 
    totalSpent: 0.00, 
    status: 'inactive', 
    joinDate: '2023-11-05' 
  },
];

let MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    shopId: 'shop_1',
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
  {
    id: '2',
    shopId: 'shop_1',
    number: 'INV-2024-002',
    customerName: 'Jane Smith',
    date: '2024-03-10',
    dueDate: '2024-03-24',
    items: [
        { id: '1', description: 'Samsung S24 Ultra', quantity: 2, price: 1199 },
        { id: '2', description: 'USB-C Cable', quantity: 5, price: 19 }
    ],
    subtotal: 2493,
    tax: 249.3,
    total: 2742.3,
    status: 'pending'
  },
  {
      id: '3',
      shopId: 'shop_1',
      number: 'INV-2024-003',
      customerName: 'Jane Smith',
      date: '2023-12-15',
      dueDate: '2023-12-30',
      items: [{ id: '1', description: 'Pixel 8', quantity: 1, price: 699 }],
      subtotal: 699,
      tax: 69.9,
      total: 768.9,
      status: 'paid'
  }
];

// --- Auth Routes ---
mock.onPost('/auth/login').reply((config) => {
  const { email } = JSON.parse(config.data);
  // Simple mock login logic
  const user = MOCK_USERS.find(u => u.email === email) || {
    id: '1',
    shopId: 'shop_1',
    name: 'Alex Manager',
    email: email,
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Manager&background=2563eb&color=fff',
    plan: 'starter',
    token: 'mock-jwt-token-123',
    phone: '+1 (555) 000-0000',
    status: 'active'
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
        shopId: 'shop_1',
        name: data.username,
        email: data.email,
        role: 'admin',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=random`,
        plan: 'starter',
        token: 'mock-jwt-token-new',
        status: 'active'
    };
    MOCK_USERS.push(newUser as User);
    return [200, {
        success: true,
        message: 'Registration successful',
        data: newUser
    }];
});

mock.onPut(/\/auth\/profile\/.+/).reply((config) => {
    const urlParts = config.url ? config.url.split('/') : [];
    const id = urlParts[urlParts.length - 1];
    const updates = JSON.parse(config.data);

    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index > -1) {
        // Check unique email if changed
        if (updates.email && MOCK_USERS.some(u => u.email === updates.email && u.id !== id)) {
             return [400, { success: false, message: 'Email already in use' }];
        }

        MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
        return [200, {
            success: true,
            message: 'Profile updated',
            data: MOCK_USERS[index]
        }];
    }
    return [404, { success: false, message: 'User not found', data: null }];
});

// --- User Routes ---
mock.onGet('/users').reply(200, {
  success: true,
  message: 'Users fetched',
  data: MOCK_USERS
});

mock.onPost('/users').reply((config) => {
  const newUser = JSON.parse(config.data);
  const user = {
    ...newUser,
    id: Math.random().toString(36).substr(2, 9),
    shopId: 'shop_1',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random`,
    plan: newUser.plan || 'starter',
    status: newUser.status || 'active'
  };
  MOCK_USERS.push(user as User);
  return [201, {
    success: true,
    message: 'User created',
    data: user
  }];
});

mock.onPut(/\/users\/.+/).reply((config) => {
   const urlParts = config.url ? config.url.split('/') : [];
   const id = urlParts[urlParts.length - 1];
   const updates = JSON.parse(config.data);

   const index = MOCK_USERS.findIndex(u => u.id === id);
   if (index > -1) {
     MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
     return [200, {
       success: true,
       message: 'User updated',
       data: MOCK_USERS[index]
     }];
   }
   return [404, { success: false, message: 'User not found', data: null }];
});

mock.onDelete(/\/users\/.+/).reply((config) => {
   const urlParts = config.url ? config.url.split('/') : [];
   const id = urlParts[urlParts.length - 1];
   MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
   return [200, {
     success: true,
     message: 'User deleted',
     data: { id }
   }];
});

// --- Customer Routes ---
mock.onGet('/customers').reply(200, {
  success: true,
  message: 'Customers fetched',
  data: MOCK_CUSTOMERS
});

mock.onPost('/customers').reply((config) => {
  const newCustomer = JSON.parse(config.data);
  const customer = {
    ...newCustomer,
    id: Math.random().toString(36).substr(2, 9),
    shopId: 'shop_1',
    totalSpent: 0,
    joinDate: new Date().toISOString().split('T')[0]
  };
  MOCK_CUSTOMERS.push(customer);
  return [201, {
    success: true,
    message: 'Customer created',
    data: customer
  }];
});

mock.onPut(/\/customers\/.+/).reply((config) => {
  const urlParts = config.url ? config.url.split('/') : [];
  const id = urlParts[urlParts.length - 1];
  const updates = JSON.parse(config.data);

  const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
  if (index > -1) {
    MOCK_CUSTOMERS[index] = { ...MOCK_CUSTOMERS[index], ...updates };
    return [200, {
      success: true,
      message: 'Customer updated',
      data: MOCK_CUSTOMERS[index]
    }];
  }
  return [404, { success: false, message: 'Customer not found', data: null }];
});

mock.onDelete(/\/customers\/.+/).reply((config) => {
  const urlParts = config.url ? config.url.split('/') : [];
  const id = urlParts[urlParts.length - 1];
  MOCK_CUSTOMERS = MOCK_CUSTOMERS.filter(c => c.id !== id);
  return [200, {
    success: true,
    message: 'Customer deleted',
    data: { id }
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
      shopId: 'shop_1',
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

// --- Invoice Routes ---
mock.onGet('/invoices').reply(200, {
  success: true,
  message: 'Invoices fetched',
  data: MOCK_INVOICES
});

mock.onPost('/invoices').reply((config) => {
  const newInvoice = JSON.parse(config.data);
  const invoice = {
    ...newInvoice,
    id: Math.random().toString(36).substr(2, 9),
    shopId: 'shop_1',
  };
  MOCK_INVOICES.unshift(invoice);
  return [201, {
    success: true,
    message: 'Invoice created',
    data: invoice
  }];
});

mock.onPut(/\/invoices\/.+/).reply((config) => {
   const urlParts = config.url ? config.url.split('/') : [];
   const id = urlParts[urlParts.length - 1];
   const updates = JSON.parse(config.data);

   const index = MOCK_INVOICES.findIndex(i => i.id === id);
   if (index > -1) {
     MOCK_INVOICES[index] = { ...MOCK_INVOICES[index], ...updates };
     return [200, {
       success: true,
       message: 'Invoice updated',
       data: MOCK_INVOICES[index]
     }];
   }
   return [404, { success: false, message: 'Invoice not found', data: null }];
});

mock.onDelete(/\/invoices\/.+/).reply((config) => {
   const urlParts = config.url ? config.url.split('/') : [];
   const id = urlParts[urlParts.length - 1];
   MOCK_INVOICES = MOCK_INVOICES.filter(i => i.id !== id);
   return [200, {
     success: true,
     message: 'Invoice deleted',
     data: { id }
   }];
});

// ============================================================================

export default api;
