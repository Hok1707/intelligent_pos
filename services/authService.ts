
import api from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  login: async (email: string, password?: string) => {
    const response = await api.post<ApiResponse<User>>('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: { username: string; email: string; password: string }) => {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response.data;
  },

  updateProfile: async (id: string, data: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>(`/auth/profile/${id}`, data);
    return response.data;
  },

  logout: async () => {
    // In a real API, you might call an endpoint to invalidate the token
    // await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  }
};
