import { useState, useEffect, useCallback } from 'react';
import { customerBookingsApi, bookingPaymentsApi } from '../services/salesApi';
import { parseSpringPage } from '../../shared/utils/springPage';
import type { Booking, BookingPayment } from '../types';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchBookings = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await customerBookingsApi.getAll({ page });
      const { data, pagination: pageInfo } = parseSpringPage<Booking>(response);
      setBookings(data);
      setPagination({
        total: pageInfo.total,
        page: pageInfo.page,
        limit: pageInfo.limit,
        totalPages: pageInfo.totalPages,
        hasNext: pageInfo.hasNext,
        hasPrev: pageInfo.hasPrev,
        currentPage: pageInfo.page
      } as any);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return {
    bookings, loading, error, pagination,
    refetch: fetchBookings,
    createBooking: customerBookingsApi.create,
    updateBooking: customerBookingsApi.update,
    updateStatus: customerBookingsApi.updateStatus,
    cancelBooking: customerBookingsApi.cancel,
    deleteBooking: customerBookingsApi.delete,
  };
};

export const useCustomerBookings = useBookings;

export const useBookingPayments = (orderId: string | null | undefined) => {
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!orderId) { setPayments([]); return; }
    try {
      setLoading(true);
      const data = await bookingPaymentsApi.getByBooking(orderId);
      setPayments(Array.isArray(data) ? data : parseSpringPage<BookingPayment>(data).data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return {
    payments,
    loading,
    createPayment: bookingPaymentsApi.create,
    deletePayment: bookingPaymentsApi.delete,
    refetch: fetchPayments
  };
};
