import apiClient from '../../../shared/api/apiClient';
import { parseSpringPage } from '../../../shared/utils/springPage';
import { PreBooking, CreatePreBookingRequest, UpdatePreBookingRequest, DeliverPreBookingRequest, UndeliverPreBookingRequest, CancelPreBookingRequest } from '../types/preBooking.types';

const BASE_URL = '/sales/pre-bookings';

const toList = (response: unknown) => {
  if (Array.isArray(response)) return response;
  return parseSpringPage<PreBooking>(response).data;
};

export const preBookingApi = {
  getAll: async (limit = 200, offset = 0): Promise<PreBooking[]> => {
    const res = await apiClient.get(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    return toList(res);
  },

  getById: async (orderId: string): Promise<PreBooking> => {
    return await apiClient.get(`${BASE_URL}/${orderId}`);
  },

  create: async (bookingData: CreatePreBookingRequest): Promise<{ orderId: string; message: string }> => {
    return await apiClient.post(BASE_URL, bookingData);
  },

  update: async (orderId: string, updateData: UpdatePreBookingRequest): Promise<PreBooking> => {
    return await apiClient.put(`${BASE_URL}/${orderId}`, updateData);
  },

  deliver: async (orderId: string, deliveryData: DeliverPreBookingRequest): Promise<PreBooking> => {
    return await apiClient.post(`${BASE_URL}/${orderId}/deliver`, deliveryData);
  },

  undeliver: async (orderId: string, data?: UndeliverPreBookingRequest): Promise<PreBooking> => {
    return await apiClient.post(`${BASE_URL}/${orderId}/undeliver`, data ?? {});
  },

  cancel: async (orderId: string, cancelData: CancelPreBookingRequest): Promise<PreBooking> => {
    return await apiClient.post(`${BASE_URL}/${orderId}/cancel`, cancelData);
  },
};
