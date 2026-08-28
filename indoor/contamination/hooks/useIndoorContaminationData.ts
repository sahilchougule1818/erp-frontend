import { useState, useCallback, useEffect } from 'react';
import { indoorApi } from '../../services/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { applySpringPage } from '../../../shared/utils/springPage';
import { ContaminationRecord } from '../types';

export const useIndoorContaminationData = () => {
  const [records, setRecords] = useState<ContaminationRecord[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { labNumber } = useLabContext();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  const fetchRecords = useCallback(async (batchCode?: string, page?: number) => {
    try {
      setIsLoading(true);
      const res = batchCode
        ? await indoorApi.contamination.getByBatch(batchCode)
        : await indoorApi.contamination.getAll({ page: page || currentPage, labNumber });
      applySpringPage<ContaminationRecord>(res, setRecords, setPagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load records');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, labNumber]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await indoorApi.contamination.getSummary(labNumber);
      setSummary(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error(err);
    }
  }, [labNumber]);

  const updateContamination = async (id: number | string, count: number) => {
    await indoorApi.contamination.update(id, { qtyContaminated: count });
    await fetchRecords();
    await fetchSummary();
  };

  useEffect(() => {
    fetchRecords(undefined, currentPage);
  }, [currentPage, labNumber]);

  return {
    records,
    summary,
    isLoading,
    error,
    fetchRecords,
    fetchSummary,
    updateContamination,
    pagination: {
      ...pagination,
      onPageChange: setCurrentPage
    }
  };
};
