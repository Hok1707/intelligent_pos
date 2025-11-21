
import api from './api';
import { ApiResponse, Customer } from '../types';

export const customerService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Customer[]>>('/customers');
    return response.data;
  },

  create: async (customer: Omit<Customer, 'id' | 'totalSpent' | 'joinDate'>) => {
    const response = await api.post<ApiResponse<Customer>>('/customers', customer);
    return response.data;
  },

  update: async (id: string, updates: Partial<Customer>) => {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, updates);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<{ id: string }>>(`/customers/${id}`);
    return response.data;
  }
};
