export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  avatar?: string;
  plan: SubscriptionTier;
  token?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: 'Phone' | 'Accessory' | 'Part';
  price: number;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  brand: string;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price: number;
  durationMonths: number;
  features: string[];
}

export interface InstallmentPlan {
  id: string;
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