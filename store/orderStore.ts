
import { create } from 'zustand';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { useNotificationStore } from './notificationStore';
import { useStockStore } from './stockStore';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Promise<boolean>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await orderService.getAll();
      if (response.success) {
        set({ orders: response.data });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to fetch orders'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ isLoading: true });
    try {
      const response = await orderService.create(orderData);
      if (response.success) {
        set((state) => ({ orders: [response.data, ...state.orders] }));
        useNotificationStore.getState().addNotification({
          type: 'success',
          message: 'Order placed successfully!'
        });
        // Refresh stock since order consumes items
        await useStockStore.getState().fetchItems();
        return true;
      }
      return false;
    } catch (error: any) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Order Failed',
        message: error.response?.data?.message || 'Could not place order.'
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await orderService.updateStatus(id, status);
      if (response.success) {
        set((state) => ({
            orders: state.orders.map(o => o.id === id ? response.data : o)
        }));
        useNotificationStore.getState().addNotification({
          type: 'success',
          message: `Order marked as ${status}`
        });
      }
    } catch (error) {
       useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to update order status'
      });
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await orderService.delete(id);
      if (response.success) {
        set((state) => ({
          orders: state.orders.filter(o => o.id !== id)
        }));
        useNotificationStore.getState().addNotification({
          type: 'success',
          message: 'Order deleted'
        });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to delete order'
      });
    }
  }
}));
