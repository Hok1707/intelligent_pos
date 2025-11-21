
export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  shopId: string; // key for multi-tenancy
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  avatar?: string;
  plan: SubscriptionTier;
  token?: string;
  phone?: string;
  status?: 'active' | 'inactive';
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalSpent: number;
  status: 'active' | 'inactive';
  joinDate: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StockItem {
  id: string;
  shopId: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  brand: string;
  image?: string; // Base64 image string or URL
}

export interface StockLog {
  id: string;
  stockId: string;
  shopId: string;
  action: 'create' | 'update' | 'delete' | 'bulk_update';
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price: number;
  durationMonths: number;
  features: string[];
  maxUsers: number;
}

export interface InstallmentPlan {
  id: string;
  shopId: string;
  customerName: string;
  deviceName: string;
  totalAmount: number;
  interestRate: number;
  months: number;
  monthlyPayment: number;
  remainingBalance: number;
  nextDueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ImageGenerationConfig {
  prompt: string;
  size: '1K' | '2K' | '4K';
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  size: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  shopId: string;
  number: string;
  customerName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  shopId: string;
  orderNumber: string;
  customerName: string;
  subtotal: number;
  tax: number; // assuming flat rate or calc
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod: 'cash' | 'khqr' | 'card';
  items: OrderItem[];
  createdAt: string;
}
