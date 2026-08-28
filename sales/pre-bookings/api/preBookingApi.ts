import apiClient from '../../../shared/services/apiClient';
import { parseSpringPage } from '../../../shared/utils/springPage';
import { normalizePreBooking } from '../../utils/normalize';
import { PreBooking, CreatePreBookingRequest, UpdatePreBookingRequest, DeliverPreBookingRequest, UndeliverPreBookingRequest, CancelPreBookingRequest } from '../types/preBooking.types';

const BASE_URL = '/sales/pre-bookings';

const toList = (response: unknown) => {
  if (Array.isArray(response)) return response;
  return parseSpringPage<Record<string, unknown>>(response).data;
};

export const preBookingApi = {
  getAll: async (limit = 50, offset = 0): Promise<PreBooking[]> => {
    const res = await apiClient.get(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    return toList(res).map((item) => normalizePreBooking(item));
  },

  getById: async (orderId: string): Promise<PreBooking> => {
    const res = await apiClient.get(`${BASE_URL}/${orderId}`);
    return normalizePreBooking(res as Record<string, unknown>);
  },

  create: async (bookingData: CreatePreBookingRequest): Promise<{ order_id: string; message: string }> => {
    return await apiClient.post(BASE_URL, bookingData);
  },

  update: async (orderId: string, updateData: UpdatePreBookingRequest): Promise<PreBooking> => {
    const res = await apiClient.put(`${BASE_URL}/${orderId}`, updateData);
    return normalizePreBooking(res as Record<string, unknown>);
  },

  deliver: async (orderId: string, deliveryData: DeliverPreBookingRequest): Promise<PreBooking> => {
    const res = await apiClient.post(`${BASE_URL}/${orderId}/deliver`, deliveryData);
    return normalizePreBooking(res as Record<string, unknown>);
  },

  undeliver: async (orderId: string, data?: UndeliverPreBookingRequest): Promise<PreBooking> => {
    const res = await apiClient.post(`${BASE_URL}/${orderId}/undeliver`, data ?? {});
    return normalizePreBooking(res as Record<string, unknown>);
  },

  cancel: async (orderId: string, cancelData: CancelPreBookingRequest): Promise<PreBooking> => {
    const res = await apiClient.post(`${BASE_URL}/${orderId}/cancel`, cancelData);
    return normalizePreBooking(res as Record<string, unknown>);
  },
};
