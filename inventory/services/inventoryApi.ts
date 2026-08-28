import apiClient from '../../shared/services/apiClient';
import { toSpringPageParams } from '../../shared/utils/springPage';

export const inventoryApi = {
  // Item Master
  items: {
    getAll: (page?: number, limit?: number) =>
      apiClient.get('/inventory/items', { params: toSpringPageParams(page, limit ?? 10) }),
    getDashboardStats: () => apiClient.get('/inventory/items/dashboard-stats'),
    create: (data: any) => apiClient.post('/inventory/items', data),
    update: (id: number, data: any) => apiClient.put(`/inventory/items/${id}`, data),
    delete: (id: number) => apiClient.delete(`/inventory/items/${id}`),
  },

  // Supplier Master
  suppliers: {
    getAll: (page?: number, limit?: number) =>
      apiClient.get('/inventory/suppliers', { params: toSpringPageParams(page, limit ?? 10) }),
    create: (data: any) => apiClient.post('/inventory/suppliers', data),
    update: (id: number, data: any) => apiClient.put(`/inventory/suppliers/${id}`, data),
    delete: (id: number) => apiClient.delete(`/inventory/suppliers/${id}`),
  },

  // Stock Usage & History
  stockUsage: {
    getHistory: (page?: number, limit?: number) =>
      apiClient.get('/inventory/stock-withdrawals/history', { params: toSpringPageParams(page, limit ?? 10) }),
    getStockLevels: (page?: number, limit?: number) =>
      apiClient.get('/inventory/stock-withdrawals/stock-levels', { params: toSpringPageParams(page, limit ?? 10) }),
    getItemsWithLastWithdrawal: (page?: number, limit?: number) =>
      apiClient.get('/inventory/stock-withdrawals/items-with-last-withdrawal', {
        params: toSpringPageParams(page, limit ?? 10),
      }),
    create: (data: {
      item_id: number;
      quantity: number;
      date?: string;
      reason?: string | null;
      notes?: string | null;
    }) => apiClient.post('/inventory/stock-withdrawals', data),
    undoLast: (itemId: number) => apiClient.post(`/inventory/stock-withdrawals/undo/${itemId}`, {}),
  }
};
