import { useState, useEffect, useCallback } from 'react';
import { refundDisbursementsApi } from '../services/salesApi';
import { parseSpringPage } from '../../shared/utils/springPage';
import type { Refund, RefundDetail } from '../types';

export const useRefunds = (statusFilter?: string) => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
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

  const fetchRefunds = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await refundDisbursementsApi.getAll(statusFilter ? { status: statusFilter, page } : { page });
      const { data, pagination: pageInfo } = parseSpringPage<Refund>(response);
      setRefunds(data);
      setPagination({
        total: pageInfo.total,
        page: pageInfo.page,
        limit: pageInfo.limit,
        totalPages: pageInfo.totalPages,
        hasNext: pageInfo.hasNext,
        hasPrev: pageInfo.hasPrev
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  return { refunds, loading, error, pagination, refetch: fetchRefunds };
};

export const useRefundDetail = (refundId: string | null) => {
  const [refund, setRefund] = useState<RefundDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRefund = useCallback(async () => {
    if (!refundId) { setRefund(null); return; }
    try {
      setLoading(true);
      const data = await refundDisbursementsApi.getById(refundId);
      setRefund(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [refundId]);

  useEffect(() => { fetchRefund(); }, [fetchRefund]);

  return {
    refund, loading,
    createTerm: (data: any) => refundDisbursementsApi.createTerm(refundId!, data),
    deleteTerm: (termNumber: number) => refundDisbursementsApi.deleteTerm(refundId!, termNumber),
    refetch: fetchRefund
  };
};
