import apiClient from '../../../shared/api/apiClient';
import { parseSpringPage } from '../../../shared/utils/springPage';
import { InstantSale, CreateInstantSaleRequest, UpdateInstantSaleRequest, CancelInstantSaleRequest } from '../types/instantSale.types';

const BASE_URL = '/sales/instant-sales';

const toList = (response: unknown) => {
  if (Array.isArray(response)) return response;
  return parseSpringPage<InstantSale>(response).data;
};

export const instantSaleApi = {
  getAll: async (limit = 200, offset = 0): Promise<InstantSale[]> => {
    const res = await apiClient.get(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    return toList(res);
  },

  getById: async (orderId: string): Promise<InstantSale> => {
    return await apiClient.get(`${BASE_URL}/${orderId}`);
  },

  create: async (saleData: CreateInstantSaleRequest): Promise<{ orderId: string; message: string }> => {
    return await apiClient.post(BASE_URL, saleData);
  },

  update: async (orderId: string, updateData: UpdateInstantSaleRequest): Promise<InstantSale> => {
    return await apiClient.put(`${BASE_URL}/${orderId}`, updateData);
  },

  cancel: async (orderId: string, cancelData: CancelInstantSaleRequest): Promise<InstantSale> => {
    return await apiClient.post(`${BASE_URL}/${orderId}/cancel`, cancelData);
  },
};
