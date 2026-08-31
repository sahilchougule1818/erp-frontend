import { useState, useEffect, useCallback } from 'react';
import { indoorApi } from '../../api/indoorApi';
import { applySpringPage } from '../../../shared/utils/springPage';

export const useOperatorMaster = () => {
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLabFilter, setCurrentLabFilter] = useState<number | undefined>(undefined);
  const [operatorPagination, setOperatorPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  const fetchOperators = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await indoorApi.operators.getAll({ page, limit: 10 });
      applySpringPage(res, setOperators, setOperatorPagination);
    } catch (error) {
      console.error('Error:', error);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOperator = async (operatorData: any) => {
    await indoorApi.operators.create(operatorData);
    fetchOperators();
  };

  const updateOperator = async (id: number, operatorData: any) => {
    await indoorApi.operators.update(id, operatorData);
    fetchOperators();
  };

  const deleteOperator = async (id: number) => {
    await indoorApi.operators.delete(id);
    fetchOperators();
  };

  useEffect(() => {
    fetchOperators(currentPage);
  }, [currentPage, fetchOperators]);

  return {
    operators,
    loading,
    operatorPagination: {
      ...operatorPagination,
      onPageChange: setCurrentPage
    },
    setCurrentLabFilter,
    createOperator,
    updateOperator,
    deleteOperator,
    refetch: () => fetchOperators(currentPage)
  };
};
