import { useState, useEffect, useCallback } from 'react';
import { cleaningApi } from '../api/cleaningApi';
import { applySpringPage } from '../../../shared/utils/springPage';
import { useLabContext } from '../../contexts/LabContext';

export function useCleaningData() {
  const { labNumber } = useLabContext();
  const [cleaningRecords, setCleaningRecords] = useState<any[]>([]);
  const [deepCleaningRecords, setDeepCleaningRecords] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleaningPage, setCleaningPage] = useState(1);
  const [deepCleaningPage, setDeepCleaningPage] = useState(1);
  const [cleaningPagination, setCleaningPagination] = useState({ currentPage: 1, totalPages: 1, total: 0, limit: 10 });
  const [deepCleaningPagination, setDeepCleaningPagination] = useState({ currentPage: 1, totalPages: 1, total: 0, limit: 10 });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const [stdRes, deepRes] = await Promise.all([
        cleaningApi.getAll({ type: 'standard', page: cleaningPage, labNumber: labNumber || undefined }),
        cleaningApi.getAll({ type: 'deep', page: deepCleaningPage, labNumber: labNumber || undefined })
      ]);
      applySpringPage(stdRes, setCleaningRecords, setCleaningPagination);
      applySpringPage(deepRes, setDeepCleaningRecords, setDeepCleaningPagination);
    } catch (err) {
      console.error('Failed to fetch cleaning records:', err);
    } finally {
      setLoading(false);
    }
  }, [cleaningPage, deepCleaningPage, labNumber]);

  const fetchOperators = useCallback(async () => {
    try {
      const data = await indoorApi.operators.getActive();
      setOperators(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch operators:', err);
      setOperators([]);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchOperators();
  }, [fetchRecords, fetchOperators]);

  const saveCleaningRecord = async (formData: any) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        type: 'standard',
        operatorId: parseInt(formData.operatorId)
      };

      if (formData.id) {
        await cleaningApi.update(formData.id, payload);
      } else {
        await cleaningApi.create(payload);
      }
      await fetchRecords();
      return true;
    } catch (err) {
      console.error('Failed to save cleaning record:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveDeepCleaningRecord = async (formData: any) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        type: 'deep',
        operatorId: parseInt(formData.operatorId)
      };

      if (formData.id) {
        await cleaningApi.update(formData.id, payload);
      } else {
        await cleaningApi.create(payload);
      }
      await fetchRecords();
      return true;
    } catch (err) {
      console.error('Failed to save deep cleaning record:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCleaningRecord = async (id: number) => {
    setLoading(true);
    try {
      await cleaningApi.delete(id, 'standard');
      await fetchRecords();
      return true;
    } catch (err) {
      console.error('Failed to delete cleaning record:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDeepCleaningRecord = async (id: number) => {
    setLoading(true);
    try {
      await cleaningApi.delete(id, 'deep');
      await fetchRecords();
      return true;
    } catch (err) {
      console.error('Failed to delete deep cleaning record:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    cleaningRecords,
    deepCleaningRecords,
    operators,
    loading,
    saveCleaningRecord,
    saveDeepCleaningRecord,
    deleteCleaningRecord,
    deleteDeepCleaningRecord,
    refetch: fetchRecords,
    cleaningPagination: {
      ...cleaningPagination,
      onPageChange: setCleaningPage
    },
    deepCleaningPagination: {
      ...deepCleaningPagination,
      onPageChange: setDeepCleaningPage
    }
  };
}
