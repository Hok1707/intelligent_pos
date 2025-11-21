
import api from './api';
import { ApiResponse, Invoice } from '../types';

export const invoiceService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Invoice[]>>('/invoices');
    return response.data;
  },

  create: async (invoice: Omit<Invoice, 'id'>) => {
    const response = await api.post<ApiResponse<Invoice>>('/invoices', invoice);
    return response.data;
  },

  update: async (id: string, updates: Partial<Invoice>) => {
    const response = await api.put<ApiResponse<Invoice>>(`/invoices/${id}`, updates);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<{ id: string }>>(`/invoices/${id}`);
    return response.data;
  }
};
