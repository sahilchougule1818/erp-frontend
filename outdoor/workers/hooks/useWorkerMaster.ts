import { useState, useEffect, useCallback } from 'react';
import { outdoorApi } from '../../services/outdoorApi';
import { parseSpringPage } from '../../../shared/utils/springPage';
import type { Worker } from '../../types/outdoor.types';

export const useWorkerMaster = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerLogs, setWorkerLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPageWorkers, setCurrentPageWorkers] = useState(1);
  const [totalPagesWorkers, setTotalPagesWorkers] = useState(1);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [currentPageLogs, setCurrentPageLogs] = useState(1);
  const [totalPagesLogs, setTotalPagesLogs] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 10;

  const fetchWorkers = useCallback(async (pageWorkers = currentPageWorkers, pageLogs = currentPageLogs) => {
    setLoading(true);
    try {
      const [workersResponse, logsResponse] = await Promise.all([
        outdoorApi.workers.getAll(pageWorkers, limit),
        outdoorApi.workers.getLog(pageLogs, limit),
      ]);
      const workersPage = parseSpringPage<Worker>(workersResponse);
      const logsPage = parseSpringPage(logsResponse);
      setWorkers(workersPage.data);
      setWorkerLogs(logsPage.data);
      setCurrentPageWorkers(workersPage.pagination.page);
      setTotalPagesWorkers(workersPage.pagination.totalPages);
      setTotalWorkers(workersPage.pagination.total);
      setCurrentPageLogs(logsPage.pagination.page);
      setTotalPagesLogs(logsPage.pagination.totalPages);
      setTotalLogs(logsPage.pagination.total);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPageWorkers, currentPageLogs, limit]);

  useEffect(() => { fetchWorkers(); }, []);

  const createWorker = async (data: Partial<Worker>) => {
    await outdoorApi.workers.create(data);
    await fetchWorkers();
  };

  const updateWorker = async (id: number, data: Partial<Worker>) => {
    await outdoorApi.workers.update(id, data);
    await fetchWorkers();
  };

  const deleteWorker = async (id: number) => {
    await outdoorApi.workers.delete(id);
    await fetchWorkers();
  };

  const updateWorkerAssignment = async (id: number, workerId: number) => {
    await outdoorApi.workers.updateAssignment(id, workerId);
    await fetchWorkers();
  };

  const handlePageChangeWorkers = (page: number) => {
    setCurrentPageWorkers(page);
    fetchWorkers(page, currentPageLogs);
  };

  const handlePageChangeLogs = (page: number) => {
    setCurrentPageLogs(page);
    fetchWorkers(currentPageWorkers, page);
  };

  return {
    workers,
    workerLogs,
    loading,
    createWorker,
    updateWorker,
    deleteWorker,
    updateWorkerAssignment,
    refetch: fetchWorkers,
    paginationWorkers: {
      currentPage: currentPageWorkers,
      totalPages: totalPagesWorkers,
      total: totalWorkers,
      limit,
      onPageChange: handlePageChangeWorkers
    },
    paginationLogs: {
      currentPage: currentPageLogs,
      totalPages: totalPagesLogs,
      total: totalLogs,
      onPageChange: handlePageChangeLogs
    }
  };
};
