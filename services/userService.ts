import api from './api';
import { ApiResponse, User } from '../types';

export const userService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data;
  },

  create: async (user: Partial<User>) => {
    const response = await api.post<ApiResponse<User>>('/users', user);
    return response.data;
  },

  update: async (id: string, updates: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, updates);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<{ id: string }>>(`/users/${id}`);
    return response.data;
  }
};