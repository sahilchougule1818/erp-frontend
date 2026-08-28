import { useState, useEffect } from 'react';
import { dashboardApi } from '../services/salesApi';
import { normalizeDashboardStats } from '../utils/normalize';
import type { DashboardStats } from '../types';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getStats()
      .then(data => setStats(normalizeDashboardStats((data ?? {}) as Record<string, unknown>)))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
};
