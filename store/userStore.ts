import { create } from 'zustand';
import { User } from '../types';
import { userService } from '../services/userService';
import { useNotificationStore } from './notificationStore';

interface UserState {
  users: User[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (user: Partial<User>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const response = await userService.getAll();
      if (response.success) {
        set({ users: response.data });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to fetch users'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addUser: async (user) => {
    try {
      const response = await userService.create(user);
      if (response.success) {
        set((state) => ({ users: [...state.users, response.data] }));
        useNotificationStore.getState().addNotification({
            type: 'success',
            message: 'User added successfully'
        });
      }
    } catch (error) {
       useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to add user'
      });
    }
  },

  updateUser: async (id, updates) => {
    try {
        const response = await userService.update(id, updates);
        if (response.success) {
            set((state) => ({
                users: state.users.map(u => u.id === id ? response.data : u)
            }));
            useNotificationStore.getState().addNotification({
                type: 'success',
                message: 'User updated successfully'
            });
        }
    } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            message: 'Failed to update user'
        });
    }
  },

  deleteUser: async (id) => {
    try {
        const response = await userService.delete(id);
        if (response.success) {
            set((state) => ({
                users: state.users.filter(u => u.id !== id)
            }));
            useNotificationStore.getState().addNotification({
                type: 'success',
                message: 'User removed'
            });
        }
    } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            message: 'Failed to remove user'
        });
    }
  }
}));