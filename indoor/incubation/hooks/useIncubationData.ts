import { useState, useEffect } from 'react';
import { indoorApi } from '../../services/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { parseSpringPage } from '../../../shared/utils/springPage';
import type { IncubationRecord } from '../../types';

export function useIncubationData() {
  const [records, setRecords] = useState<IncubationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { labNumber } = useLabContext();
  const limit = 10;

  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage, labNumber]);

  const fetchRecords = async (page: number) => {
    setLoading(true);
    try {
      const res = await indoorApi.phaseViews.getIncubation(page, limit, labNumber);
      const { data, pagination } = parseSpringPage<IncubationRecord>(res);
      setRecords(data);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return { 
    records, 
    loading, 
    refetch: () => fetchRecords(currentPage),
    pagination: {
      currentPage,
      totalPages,
      total,
      limit,
      onPageChange: setCurrentPage
    }
  };
}
