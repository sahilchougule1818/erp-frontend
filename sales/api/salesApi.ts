import apiClient from '../../shared/api/apiClient';
import { parseSpringPage, toSpringPageParams } from '../../shared/utils/springPage';
import type {
  BankAccount, Booking, BookingPayment, LedgerEntry, WithdrawEntry,
  Refund, RefundDetail, InventoryItem, Supplier,
  DashboardStats, UpcomingDelivery, Customer
} from '../types';
import type { InstantSale } from '../instant-sales/types/instantSale.types';
import type { PreBooking } from '../pre-bookings/types/preBooking.types';

type PagedParams = { page?: number; size?: number };

function springPageQuery<T extends PagedParams>(params?: T, sizeDefault = 10) {
  const { page = 1, size = sizeDefault, ...rest } = (params ?? {}) as T;
  return { ...rest, ...toSpringPageParams(page, size) };
}

export type { BankAccount, Booking, BookingPayment, LedgerEntry, WithdrawEntry, Refund, RefundDetail, Customer };

export const customersApi = {
  getAll: (params?: { page?: number; size?: number }) =>
    apiClient.get<Customer[]>('/sales/customers', { params: springPageQuery(params) }),
  getById: (customerId: string) => apiClient.get<Customer>(`/sales/customers/${customerId}`),
  create: (data: { name: string; phoneNumber?: string; address?: string }) =>
    apiClient.post<Customer>('/sales/customers', data),
  update: (customerId: string, data: Partial<Customer>) =>
    apiClient.put<Customer>(`/sales/customers/${customerId}`, data),
  delete: (customerId: string) => apiClient.delete(`/sales/customers/${customerId}`),
};

export const bankAccountsApi = {
  getAll: (params?: { all?: boolean; page?: number; size?: number }) => {
    const all = params?.all ?? false;
    return apiClient.get<BankAccount[]>('/sales/bank-accounts', {
      params: {
        all,
        ...springPageQuery({ page: params?.page, size: params?.size ?? (all ? 500 : 10) }),
      },
    });
  },
  getById: (id: number) => apiClient.get<BankAccount>(`/sales/bank-accounts/${id}`),
  create: (data: Omit<BankAccount, 'id' | 'createdAt' | 'totalCredits' | 'totalDebits'>) =>
    apiClient.post<BankAccount>('/sales/bank-accounts', data),
  update: (id: number, data: Partial<BankAccount>) => apiClient.put<BankAccount>(`/sales/bank-accounts/${id}`, data),
  delete: (id: number) => apiClient.delete(`/sales/bank-accounts/${id}`),
};

export const customerBookingsApi = {
  getAll: async (params?: { page?: number }) => {
    const [instantSalesRes, preBookingsRes] = await Promise.all([
      apiClient.get('/sales/instant-sales', { params: { limit: 200, offset: 0 } }),
      apiClient.get('/sales/pre-bookings', { params: { limit: 200, offset: 0 } })
    ]);

    const instantList = Array.isArray(instantSalesRes)
      ? instantSalesRes
      : parseSpringPage<InstantSale>(instantSalesRes).data;
    const preList = Array.isArray(preBookingsRes)
      ? preBookingsRes
      : parseSpringPage<PreBooking>(preBookingsRes).data;

    const mergedData = [...instantList, ...preList];

    return {
      data: mergedData,
      pagination: {
        total: mergedData.length,
        page: params?.page || 1,
        limit: mergedData.length || 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        currentPage: params?.page || 1
      }
    };
  },
  getById: (orderId: string) => {
    return apiClient.get<Booking>(`/sales/instant-sales/${orderId}`)
      .catch(() => apiClient.get<Booking>(`/sales/pre-bookings/${orderId}`));
  },
  create: (data: any) => {
    const isInstantSell = Boolean(data.isInstantSell);
    return isInstantSell
      ? apiClient.post<Booking>('/sales/instant-sales', data)
      : apiClient.post<Booking>('/sales/pre-bookings', data);
  },
  update: (orderId: string, data: any) =>
    apiClient.put<Booking>(`/sales/pre-bookings/${orderId}`, data),
  updateInstantSale: (orderId: string, data: any) =>
    apiClient.put<Booking>(`/sales/instant-sales/${orderId}`, data),
  updateStatus: (orderId: string, data: { deliveryStatus?: string }) =>
    apiClient.put<Booking>(`/sales/pre-bookings/${orderId}/status`, data),
  cancel: (orderId: string, data: { cancellationReason?: string }, isInstantSale: boolean) => {
    return isInstantSale
      ? apiClient.post<Booking>(`/sales/instant-sales/${orderId}/cancel`, data)
      : apiClient.post<Booking>(`/sales/pre-bookings/${orderId}/cancel`, data);
  },
  delete: (orderId: string, isInstantSale: boolean) => {
    return isInstantSale
      ? apiClient.delete(`/sales/instant-sales/${orderId}`)
      : apiClient.delete(`/sales/pre-bookings/${orderId}`);
  },
};

export const bookingPaymentsApi = {
  getByBooking: (orderId: string) => {
    return apiClient.get<BookingPayment[]>(`/sales/customer-payments/order/${orderId}`);
  },
  create: (data: {
    orderId: string;
    amount: number;
    paymentType?: string;
    paymentMethod: string;
    bankAccountId?: number | null;
    paymentReference?: string;
    notes?: string;
    paymentDate?: string;
  }) => apiClient.post<BookingPayment>('/sales/customer-payments', data),
  delete: (transactionNumber: string) => apiClient.delete(`/sales/customer-payments/${transactionNumber}`, {
    data: { deletedBy: 'system', reason: 'Payment undone' }
  }),
};

export const inventoryPurchasesApi = {
  getAll: () => apiClient.get<WithdrawEntry[]>('/sales/inventory-purchases'),
  getInventoryItems: () => apiClient.get<InventoryItem[]>('/sales/inventory-purchases/inventory-items'),
  getSuppliers: () => apiClient.get<Supplier[]>('/sales/inventory-purchases/suppliers'),
  create: (data: any) => apiClient.post<WithdrawEntry>('/sales/inventory-purchases', data),
  update: (id: string, data: any) => apiClient.put<WithdrawEntry>(`/sales/inventory-purchases/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sales/inventory-purchases/${id}`),
};

export const inventoryPaymentsApi = {
  getAll: (params?: { page?: number; size?: number }) =>
    apiClient.get<any[]>('/sales/stock/inventory-payments', { params: springPageQuery(params) }),
  getById: (id: number) => apiClient.get<any>(`/sales/stock/inventory-payments/${id}`),
  create: (data: any) => apiClient.post<any>('/sales/inventory-purchases', data),
};

export const stockApi = {
  getIndoorStock: (params?: { phase?: string }) => apiClient.get<any[]>('/sales/dashboard/indoor-stock', { params }),
  getOutdoorStock: () => apiClient.get<any[]>('/sales/dashboard/outdoor-stock'),
};

export const ledgerApi = {
  getLedgerEntries: (params: {
    bankAccountId?: string;
    cashOnly?: boolean;
    type?: 'credit' | 'debit' | 'all';
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    size?: number;
  }) => {
    const { bankAccountId, type, fromDate, toDate, search, cashOnly, page, size } = params;
    const query: Record<string, unknown> = { ...springPageQuery({ page, size }) };
    if (bankAccountId && bankAccountId !== 'all') query.bankAccountId = bankAccountId;
    if (type && type !== 'all') query.type = type;
    if (fromDate) query.fromDate = fromDate;
    if (toDate) query.toDate = toDate;
    if (search) query.search = search;
    if (cashOnly) query.cashOnly = cashOnly;
    return apiClient.get<LedgerEntry[]>('/sales/ledger', { params: query });
  },
  getBankSummary: () => apiClient.get<BankAccount[]>('/sales/ledger/bank-summary'),
};

export const refundDisbursementsApi = {
  getAll: (params?: { status?: string; page?: number; size?: number }) =>
    apiClient.get<Refund[]>('/sales/refund-disbursements', { params: springPageQuery(params) }),
  getById: (refundId: string) => apiClient.get<RefundDetail>(`/sales/refund-disbursements/${refundId}`),
  createTerm: (refundId: string, data: {
    amount: number;
    paymentDate?: string;
    paymentMethod: string;
    bankAccountId?: number | null;
    paymentReference?: string;
    notes?: string;
  }) => apiClient.post<RefundDetail>(`/sales/refund-disbursements/${refundId}/terms`, data),
  deleteTerm: (refundId: string, termNumber: number) =>
    apiClient.delete(`/sales/refund-disbursements/${refundId}/terms/${termNumber}`),
};

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>('/sales/dashboard/stats'),
  getPreBookingStats: () => apiClient.get<{ pendingDeliveries: number; outstandingAmount: number }>('/sales/dashboard/prebooking-stats'),
  getInstantSaleStats: () => apiClient.get<{ totalSales: number; outstandingAmount: number }>('/sales/dashboard/instantsale-stats'),
};

export const notificationsApi = {
  getUpcomingDeliveries: () => apiClient.get<UpcomingDelivery[]>('/sales/notifications/upcoming-deliveries'),
};

export const salesApi = {
  dashboard: dashboardApi,
};

export const billingApi = {
  downloadBill: async (orderId: string) => {
    try {
      const blob = await apiClient.get(`/sales/billing/orders/${orderId}/bill`, {
        responseType: 'blob'
      }) as unknown as Blob;

      if (!(blob instanceof Blob)) {
        throw new Error('Invalid response format');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Download bill error:', error);
      throw new Error(error?.message || 'Failed to download invoice');
    }
  },
};
