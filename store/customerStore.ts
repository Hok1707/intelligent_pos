
import { create } from 'zustand';
import { Customer } from '../types';
import { customerService } from '../services/customerService';
import { useNotificationStore } from './notificationStore';

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'joinDate'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  isLoading: false,

  fetchCustomers: async () => {
    set({ isLoading: true });
    try {
      const response = await customerService.getAll();
      if (response.success) {
        set({ customers: response.data });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to fetch customers'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addCustomer: async (customerData) => {
    try {
      const response = await customerService.create(customerData);
      if (response.success) {
        set((state) => ({ customers: [...state.customers, response.data] }));
        useNotificationStore.getState().addNotification({
          type: 'success',
          message: 'Customer added successfully'
        });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to add customer'
      });
    }
  },

  updateCustomer: async (id, updates) => {
    try {
      const response = await customerService.update(id, updates);
      if (response.success) {
        set((state) => ({
          customers: state.customers.map(c => c.id === id ? response.data : c)
        }));
        useNotificationStore.getState().addNotification({
          type: 'success',
          message: 'Customer updated successfully'
        });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to update customer'
      });
    }
  },

  deleteCustomer: async (id) => {
    try {
      const response = await customerService.delete(id);
      if (response.success) {
        set((state) => ({
          customers: state.customers.filter(c => c.id !== id)
        }));
        useNotificationStore.getState().addNotification({
          type: 'success',
          message: 'Customer deleted'
        });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to delete customer'
      });
    }
  }
}));
