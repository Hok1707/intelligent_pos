
import { create } from 'zustand';
import { Invoice } from '../types';
import { invoiceService } from '../services/invoiceService';
import { useNotificationStore } from './notificationStore';

interface InvoiceState {
  invoices: Invoice[];
  isLoading: boolean;
  fetchInvoices: () => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  isLoading: false,

  fetchInvoices: async () => {
    set({ isLoading: true });
    try {
      const response = await invoiceService.getAll();
      if (response.success) {
        set({ invoices: response.data });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to fetch invoices'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createInvoice: async (invoiceData) => {
    set({ isLoading: true });
    try {
      const response = await invoiceService.create(invoiceData);
      if (response.success) {
        set((state) => ({ invoices: [response.data, ...state.invoices] }));
        useNotificationStore.getState().addNotification({
          type: 'success',
          message: 'Invoice created successfully'
        });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to create invoice'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteInvoice: async (id) => {
    try {
      const response = await invoiceService.delete(id);
      if (response.success) {
        set((state) => ({ invoices: state.invoices.filter(i => i.id !== id) }));
        useNotificationStore.getState().addNotification({
          type: 'success',
          message: 'Invoice deleted'
        });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to delete invoice'
      });
    }
  },

  markAsPaid: async (id) => {
    try {
      const response = await invoiceService.update(id, { status: 'paid' });
      if (response.success) {
        set((state) => ({
          invoices: state.invoices.map(i => i.id === id ? response.data : i)
        }));
        useNotificationStore.getState().addNotification({
          type: 'success',
          message: 'Invoice marked as paid'
        });
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to update invoice status'
      });
    }
  }
}));
