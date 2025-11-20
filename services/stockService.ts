import api from './api';
import { ApiResponse, StockItem } from '../types';

export const stockService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<StockItem[]>>('/stock');
    return response.data;
  },

  create: async (item: Omit<StockItem, 'id' | 'status'>) => {
    const response = await api.post<ApiResponse<StockItem>>('/stock', item);
    return response.data;
  },

  update: async (id: string, updates: Partial<StockItem>) => {
    const response = await api.put<ApiResponse<StockItem>>(`/stock/${id}`, updates);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<{ id: string }>>(`/stock/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: string[]) => {
    const response = await api.post<ApiResponse<{ ids: string[] }>>('/stock/bulk-delete', { ids });
    return response.data;
  },

  bulkUpdateQuantity: async (ids: string[], quantity: number) => {
    const response = await api.post<ApiResponse<StockItem[]>>('/stock/bulk-update', { ids, quantity });
    return response.data;
  }
};