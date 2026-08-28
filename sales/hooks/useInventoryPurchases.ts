import { useState, useEffect, useCallback } from 'react';
import { inventoryPurchasesApi, inventoryPaymentsApi } from '../services/salesApi';
import { parseSpringPage } from '../../shared/utils/springPage';
import type { WithdrawEntry, InventoryItem, Supplier } from '../types';

export const useInventoryPurchases = () => {
  const [purchases, setPurchases] = useState<WithdrawEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryPurchasesApi.getAll();
      const { data: rows } = parseSpringPage<WithdrawEntry>(data);
      setPurchases(rows);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  return { purchases, loading, error, refetch: fetchPurchases };
};

export const useInventoryPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
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

  const fetchPayments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await inventoryPaymentsApi.getAll({ page });
      const { data, pagination: pageInfo } = parseSpringPage(response);
      setPayments(data);
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
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return { payments, loading, error, pagination, refetch: fetchPayments };
};

export const useInventoryItems = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inventoryPurchasesApi.getInventoryItems()
      .then((data) => {
        const rows = Array.isArray(data)
          ? data
          : parseSpringPage<InventoryItem>(data).data;
        setItems(rows);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
};

export const useWithdrawSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inventoryPurchasesApi.getSuppliers()
      .then((data) => {
        const rows = Array.isArray(data)
          ? data
          : parseSpringPage<Supplier>(data).data;
        setSuppliers(rows);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { suppliers, loading, error };
};
