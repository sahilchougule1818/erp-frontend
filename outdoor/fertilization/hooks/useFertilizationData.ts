import { useState, useCallback, useEffect } from 'react';
import { outdoorApi } from '../../api/outdoorApi';
import { parseSpringPage } from '../../../shared/utils/springPage';

export const useFertilizationData = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [response, batchesResponse] = await Promise.all([
        outdoorApi.fertilization.getAll(page, limit),
        outdoorApi.batches.getAll(1, 500),
      ]);
      const recordsPage = parseSpringPage(response);
      const batchesPage = parseSpringPage(batchesResponse);
      setRecords(recordsPage.data);
      setCurrentPage(recordsPage.pagination.currentPage);
      setTotalPages(recordsPage.pagination.totalPages);
      setTotal(recordsPage.pagination.total);
      setBatches(batchesPage.data);
    } catch (error) {
      console.error('Failed to fetch fertilization data or batches:', error);
      setRecords([]);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveRecord = async (formData: any) => {
    try {
      if (formData.id) {
        await outdoorApi.fertilization.update(formData.id, formData);
      }
      await fetchData(currentPage);
      return true;
    } catch (error) {
      console.error('Failed to save fertilization record:', error);
      return false;
    }
  };

  const deleteRecord = async (id: number) => {
    try {
      await outdoorApi.fertilization.delete(id);
      await fetchData(currentPage);
      return true;
    } catch (error) {
      console.error('Failed to delete fertilization record:', error);
      return false;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page);
  };

  return {
    records,
    batches,
    loading,
    saveRecord,
    deleteRecord,
    loadData: fetchData,
    refetch: fetchData,
    pagination: {
      currentPage,
      totalPages,
      total,
      limit,
      onPageChange: handlePageChange,
    },
  };
};
