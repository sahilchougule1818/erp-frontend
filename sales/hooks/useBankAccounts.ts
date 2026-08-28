import { useState, useEffect, useCallback } from 'react';
import { bankAccountsApi, ledgerApi } from '../services/salesApi';
import { parseSpringPage } from '../../shared/utils/springPage';
import { normalizeBankAccount } from '../utils/normalize';
import type { BankAccount } from '../types';

export const useBankAccounts = (all = false) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bankAccountsApi.getAll({ all });
      const { data } = parseSpringPage<Record<string, unknown>>(response);
      setAccounts(data.map(normalizeBankAccount));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [all]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  return { accounts, loading, error, refetch: fetchAccounts };
};

export const useBankSummary = () => {
  const [summary, setSummary] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ledgerApi.getBankSummary();
      const rows = Array.isArray(data)
        ? data
        : parseSpringPage<Record<string, unknown>>(data).data;
      setSummary(rows.map(normalizeBankAccount));
    } catch (err: any) {
      setError(err.message);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
};
