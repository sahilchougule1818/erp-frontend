import { useState, useCallback, useEffect } from 'react';
import { outdoorApi } from '../../api/outdoorApi';
import { parseSpringPage } from '../../../shared/utils/springPage';

export const useMortalityData = () => {
  const [log, setLog] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPageLog, setCurrentPageLog] = useState(1);
  const [totalPagesLog, setTotalPagesLog] = useState(1);
  const [totalLog, setTotalLog] = useState(0);
  const limit = 10;

  const fetchData = useCallback(async (pageLog = 1) => {
    setLoading(true);
    try {
      const [logResponse, summaryResponse] = await Promise.all([
        outdoorApi.mortality.getLog(pageLog, limit),
        outdoorApi.mortality.getSummary(),
      ]);
      const logPage = parseSpringPage(logResponse);
      setLog(logPage.data);
      setCurrentPageLog(logPage.pagination.currentPage);
      setTotalPagesLog(logPage.pagination.totalPages);
      setTotalLog(logPage.pagination.total);
      setSummary(Array.isArray(summaryResponse) ? summaryResponse : []);
    } catch (error) {
      console.error('Failed to fetch mortality data:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChangeLog = (page: number) => {
    setCurrentPageLog(page);
    fetchData(page);
  };

  return {
    log,
    summary,
    loading,
    refetch: fetchData,
    paginationLog: {
      currentPage: currentPageLog,
      totalPages: totalPagesLog,
      total: totalLog,
      limit,
      onPageChange: handlePageChangeLog,
    },
    paginationSummary: {
      currentPage: 1,
      totalPages: 1,
      total: summary.length,
      limit,
      onPageChange: () => {},
    },
  };
};
