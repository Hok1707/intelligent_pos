import { create } from 'zustand';
import { StockItem } from '../types';
import { useNotificationStore } from './notificationStore';
import { stockService } from '../services/stockService';

interface StockState {
  items: StockItem[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<StockItem, 'id' | 'status'>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  deleteItems: (ids: string[]) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  updateQuantities: (ids: string[], quantity: number) => Promise<void>;
  updateItem: (id: string, updates: Partial<StockItem>) => Promise<void>;
}

export const useStockStore = create<StockState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchItems: async () => {
    set({ isLoading: true });
    try {
      const response = await stockService.getAll();
      if (response.success) {
        set({ items: response.data });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to fetch inventory items.'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (newItem) => {
    try {
      const response = await stockService.create(newItem);
      if (response.success) {
        set((state) => ({ items: [...state.items, response.data] }));

        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Product Added',
          message: `${response.data.name} successfully added to inventory.`
        });

        if (response.data.status === 'Low Stock') {
           setTimeout(() => {
             useNotificationStore.getState().addNotification({
               type: 'warning',
               title: 'Low Stock Warning',
               message: `New item ${response.data.name} added with low stock (${response.data.quantity}).`
             });
           }, 500);
        }
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to add item.'
      });
    }
  },

  deleteItem: async (id) => {
    try {
      const response = await stockService.delete(id);
      if (response.success) {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        }));
        useNotificationStore.getState().addNotification({
          type: 'info',
          message: 'Item deleted from inventory.'
        });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to delete item.'
      });
    }
  },

  deleteItems: async (ids) => {
    try {
      const response = await stockService.bulkDelete(ids);
      if (response.success) {
        set((state) => ({
          items: state.items.filter((item) => !ids.includes(item.id))
        }));
        useNotificationStore.getState().addNotification({
          type: 'info',
          message: `${ids.length} items deleted from inventory.`
        });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to delete items.'
      });
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      const response = await stockService.update(id, { quantity });
      if (response.success) {
          const updatedItem = response.data;
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? updatedItem : item
            )
          }));

         useNotificationStore.getState().addNotification({
           type: 'success',
           message: `Updated stock for ${updatedItem.name}. New qty: ${quantity}`
         });

         if (quantity < 5 && quantity > 0) {
            useNotificationStore.getState().addNotification({
              type: 'warning',
              title: 'Low Stock Alert',
              message: `${updatedItem.name} is running low. Reorder recommended.`
            });
         } else if (quantity === 0) {
            useNotificationStore.getState().addNotification({
              type: 'error',
              title: 'Stock Depleted',
              message: `${updatedItem.name} is now Out of Stock!`
            });
         }
      }
    } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            message: 'Failed to update quantity.'
        });
    }
  },

  updateQuantities: async (ids, quantity) => {
    try {
        const response = await stockService.bulkUpdateQuantity(ids, quantity);
        if (response.success) {
            const updatedItems = response.data;
            // Map updates into local state
            set((state) => ({
                items: state.items.map((item) => {
                    const updated = updatedItems.find(u => u.id === item.id);
                    return updated || item;
                })
            }));
            useNotificationStore.getState().addNotification({
                type: 'success',
                message: `Updated quantity for ${ids.length} items.`
            });
        }
    } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            message: 'Failed to bulk update quantities.'
        });
    }
  },

  updateItem: async (id, updates) => {
    try {
        const response = await stockService.update(id, updates);
        if (response.success) {
            set((state) => ({
              items: state.items.map((item) => 
                item.id === id ? response.data : item
              )
            }));
            useNotificationStore.getState().addNotification({
              type: 'success',
              title: 'Item Updated',
              message: 'Inventory item details updated successfully.'
            });
        }
    } catch (error) {
        useNotificationStore.getState().addNotification({
            type: 'error',
            message: 'Failed to update item details.'
        });
    }
  }
}));