import apiClient from '../../../shared/services/apiClient';
import { parseSpringPage } from '../../../shared/utils/springPage';
import { normalizeInstantSale } from '../../utils/normalize';
import { InstantSale, CreateInstantSaleRequest, UpdateInstantSaleRequest, CancelInstantSaleRequest } from '../types/instantSale.types';

const BASE_URL = '/sales/instant-sales';

const toList = (response: unknown) => {
  if (Array.isArray(response)) return response;
  return parseSpringPage<Record<string, unknown>>(response).data;
};

export const instantSaleApi = {
  getAll: async (limit = 200, offset = 0): Promise<InstantSale[]> => {
    const res = await apiClient.get(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    return toList(res).map((item) => normalizeInstantSale(item));
  },

  getById: async (orderId: string): Promise<InstantSale> => {
    const res = await apiClient.get(`${BASE_URL}/${orderId}`);
    return normalizeInstantSale(res as Record<string, unknown>);
  },

  create: async (saleData: CreateInstantSaleRequest): Promise<{ order_id: string; message: string }> => {
    return await apiClient.post(BASE_URL, saleData);
  },

  update: async (orderId: string, updateData: UpdateInstantSaleRequest): Promise<InstantSale> => {
    const res = await apiClient.put(`${BASE_URL}/${orderId}`, updateData);
    return normalizeInstantSale(res as Record<string, unknown>);
  },

  cancel: async (orderId: string, cancelData: CancelInstantSaleRequest): Promise<InstantSale> => {
    const res = await apiClient.post(`${BASE_URL}/${orderId}/cancel`, cancelData);
    return normalizeInstantSale(res as Record<string, unknown>);
  },
};
