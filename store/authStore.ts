
import { create } from 'zustand';
import { User, SubscriptionTier } from '../types';
import { useNotificationStore } from './notificationStore';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name?: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  setSubscription: (tier: SubscriptionTier) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, name?: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(email);
      if (response.success) {
        // If name is provided from UI (like mock register), override mock name
        const userData = { ...response.data, ...(name ? { name } : {}) };
        
        localStorage.setItem('auth_token', userData.token || '');
        set({ isAuthenticated: true, user: userData });
        
        useNotificationStore.getState().addNotification({
            type: 'success',
            message: `Welcome back, ${userData.name}!`
        });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Login Failed',
        message: 'Please check your credentials.'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
      set({ isLoading: true });
      try {
          const response = await authService.register(data);
          if (response.success) {
              localStorage.setItem('auth_token', response.data.token || '');
              set({ isAuthenticated: true, user: response.data });
              useNotificationStore.getState().addNotification({
                type: 'success',
                message: `Account created! Welcome ${response.data.name}.`
            });
          }
      } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            title: 'Registration Failed',
            message: 'Could not create account.'
          });
      } finally {
          set({ isLoading: false });
      }
  },

  updateProfile: async (data) => {
      const currentUser = get().user;
      if (!currentUser) return;
      
      set({ isLoading: true });
      try {
          const response = await authService.updateProfile(currentUser.id, data);
          if (response.success) {
              set({ user: response.data });
              useNotificationStore.getState().addNotification({
                type: 'success',
                message: 'Profile updated successfully'
            });
          }
      } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            message: 'Failed to update profile'
          });
      } finally {
          set({ isLoading: false });
      }
  },

  logout: () => {
    authService.logout();
    set({ isAuthenticated: false, user: null });
  },

  setSubscription: (tier) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, plan: tier } });
      
      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Plan Updated',
        message: `You have successfully switched to the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan.`
      });
    }
  }
}));