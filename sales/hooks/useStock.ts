import { useState, useEffect, useCallback } from 'react';
import { stockApi } from '../services/salesApi';
import { parseSpringPage } from '../../shared/utils/springPage';
import { normalizeStockRow } from '../utils/normalize';

export const useIndoorStock = (phase?: string) => {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockApi.getIndoorStock(phase ? { phase } : undefined);
      const { data } = parseSpringPage<Record<string, unknown>>(res);
      setStock(data.map(normalizeStockRow));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [phase]);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  return { stock, loading, refetch: fetchStock };
};

export const useOutdoorStock = () => {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockApi.getOutdoorStock();
      const { data } = parseSpringPage<Record<string, unknown>>(res);
      setStock(data.map(normalizeStockRow));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  return { stock, loading, refetch: fetchStock };
};
