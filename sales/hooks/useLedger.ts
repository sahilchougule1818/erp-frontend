import { useState, useEffect, useCallback } from 'react';
import { ledgerApi } from '../services/salesApi';
import { parseSpringPage } from '../../shared/utils/springPage';
import { normalizeLedgerEntry } from '../utils/normalize';
import type { LedgerEntry } from '../types';

export const useLedger = (params: any) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
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

  const fetchLedger = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await ledgerApi.getLedgerEntries({ ...params, page });
      const { data, pagination: pageInfo } = parseSpringPage<Record<string, unknown>>(response);
      setEntries(data.map(normalizeLedgerEntry));
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
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchLedger(); }, [fetchLedger]);

  return { entries, loading, error, pagination, refetch: fetchLedger };
};
