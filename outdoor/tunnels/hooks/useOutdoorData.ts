import { useState, useEffect, useCallback } from 'react';
import { parseSpringPage } from '../../../shared/utils/springPage';

export function useOutdoorData(apiEndpoint: { getAll: (page: number, limit: number) => Promise<unknown> }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiEndpoint.getAll(page, limit);
      const parsed = parseSpringPage(response);
      setRecords(parsed.data);
      setCurrentPage(parsed.pagination.currentPage);
      setTotalPages(parsed.pagination.totalPages);
      setTotal(parsed.pagination.total);
    } catch (error) {
      console.error('Failed to fetch records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, limit]);

  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage, fetchRecords]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    records,
    loading,
    refetch: fetchRecords,
    pagination: {
      currentPage,
      totalPages,
      total,
      limit,
      onPageChange: handlePageChange,
    },
  };
}
