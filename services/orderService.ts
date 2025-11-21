
import api from './api';
import { ApiResponse, Order } from '../types';

export const orderService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Order[]>>('/orders');
    return response.data;
  },

  create: async (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    const response = await api.post<ApiResponse<Order>>('/orders', order);
    return response.data;
  },

  updateStatus: async (id: string, status: Order['status']) => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<{ id: string }>>(`/orders/${id}`);
    return response.data;
  }
};
