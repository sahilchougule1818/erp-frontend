import { useState, useEffect, useCallback } from 'react';
import { customersApi } from '../services/salesApi';
import { parseSpringPage } from '../../shared/utils/springPage';
import { normalizeCustomer } from '../utils/normalize';
import type { Customer } from '../types';

export const useCustomers = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 10;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: pageSize,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchCustomers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await customersApi.getAll({ page, size: pageSize });
      const { data, pagination: pageInfo } = parseSpringPage<Record<string, unknown>>(response);
      setCustomers(data.map(normalizeCustomer));
      setPagination({
        total: pageInfo.total,
        page: pageInfo.page,
        limit: pageInfo.limit,
        totalPages: pageInfo.totalPages,
        hasNext: pageInfo.hasNext,
        hasPrev: pageInfo.hasPrev
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return {
    customers,
    loading,
    pagination,
    refetch: fetchCustomers,
    createCustomer: customersApi.create,
  };
};
