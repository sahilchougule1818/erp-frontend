import { useState, useEffect } from 'react';
import { indoorApi } from '../../services/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { parseSpringPage } from '../../../shared/utils/springPage';

export const useRootingData = () => {
  const [rootedBatches, setRootedBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { labNumber } = useLabContext();
  const limit = 50;

  useEffect(() => {
    fetchRootedBatches(currentPage);
  }, [currentPage, labNumber]);

  const fetchRootedBatches = async (page: number) => {
    setLoading(true);
    try {
      const response = await indoorApi.rooting.getRootedBatches(page, limit, labNumber);
      const { data, pagination } = parseSpringPage(response);
      setRootedBatches(data);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
      setError(null);
    } catch (err: any) {
      console.error('Rooting fetch error:', err);
      setError(err.message || 'Failed to fetch rooted batches');
      setRootedBatches([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    rootedBatches,
    loading,
    error,
    pagination: {
      currentPage,
      totalPages,
      total,
      limit,
      onPageChange: setCurrentPage
    },
    refetch: () => fetchRootedBatches(currentPage)
  };
};
