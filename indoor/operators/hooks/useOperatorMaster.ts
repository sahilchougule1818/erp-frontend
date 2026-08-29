import { useState, useEffect, useCallback } from 'react';
import { indoorApi } from '../../api/indoorApi';
import apiClient from '../../../shared/api/apiClient';
import { applySpringPage, toSpringPageParams } from '../../../shared/utils/springPage';

export const useOperatorMaster = () => {
  const [operators, setOperators] = useState<any[]>([]);
  const [batches, setBatches] = useState<Array<{batchCode: string}>>([]);
  const [mediaBatches, setMediaBatches] = useState<Array<{mediaCode: string, preparedDate: string, status: string}>>([]);
  const [cleaningTasks, setCleaningTasks] = useState<Array<{referenceCode: string}>>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedMediaBatch, setSelectedMediaBatch] = useState('');
  const [selectedCleaningTask, setSelectedCleaningTask] = useState('');
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activityLogsPage, setActivityLogsPage] = useState(1);
  const [currentLabFilter, setCurrentLabFilter] = useState<number | undefined>(undefined);
  const [operatorPagination, setOperatorPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const [activityLogsPagination, setActivityLogsPagination] = useState({
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

  const loadBatches = useCallback(async () => {
    try {
      const data = await apiClient.get('/indoor/operator-log/batches');
      setBatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading batches:', error);
      setBatches([]);
    }
  }, []);

  const loadMediaBatchList = useCallback(async () => {
    try {
      const data = await apiClient.get('/indoor/operator-log/media-batch-list');
      setMediaBatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading media batches:', error);
      setMediaBatches([]);
    }
  }, []);

  const loadCleaningTaskList = useCallback(async () => {
    try {
      const data = await apiClient.get('/indoor/operator-log/cleaning-tasks');
      setCleaningTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading cleaning tasks:', error);
      setCleaningTasks([]);
    }
  }, []);

  const loadActivityLogs = useCallback(async (params: { operatorId?: number, referenceCode?: string, category?: string, page?: number, labNumber?: number } = {}) => {
    setLoading(true);
    try {
      const uiPage = params.page ?? activityLogsPage;
      const requestParams = {
        ...toSpringPageParams(uiPage, 10),
        ...(params.operatorId != null ? { operatorId: params.operatorId } : {}),
        ...(params.referenceCode ? { referenceCode: params.referenceCode } : {}),
        ...(params.category ? { category: params.category } : {}),
        labNumber: params.labNumber !== undefined ? params.labNumber : currentLabFilter,
      };

      const data = await apiClient.get('/indoor/operator-log/activity-logs', { params: requestParams });
      applySpringPage(data, setActivityLogs, setActivityLogsPagination);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  }, [activityLogsPage, currentLabFilter]);

  const handleBatchChange = (value: string) => {
    setSelectedBatch(value);
    setSelectedMediaBatch('');
    setSelectedCleaningTask('');
    setActivityLogsPage(1);
    loadActivityLogs({ referenceCode: value === 'all' ? undefined : value, category: 'Production', page: 1 });
  };

  const handleMediaBatchChange = (value: string) => {
    setSelectedMediaBatch(value);
    setSelectedBatch('');
    setSelectedCleaningTask('');
    setActivityLogsPage(1);
    loadActivityLogs({ referenceCode: value === 'all' ? undefined : value, category: 'Media Batches', page: 1 });
  };

  const handleCleaningTaskChange = (value: string) => {
    setSelectedCleaningTask(value);
    setSelectedBatch('');
    setSelectedMediaBatch('');
    setActivityLogsPage(1);
    loadActivityLogs({ referenceCode: value === 'all' ? undefined : value, category: 'Cleaning', page: 1 });
  };

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

  useEffect(() => {
    loadBatches();
    loadMediaBatchList();
    loadCleaningTaskList();
  }, [loadBatches, loadMediaBatchList, loadCleaningTaskList]);

  useEffect(() => {
    loadActivityLogs({ page: activityLogsPage });
  }, [activityLogsPage, currentLabFilter, loadActivityLogs]);

  return {
    operators,
    batches,
    mediaBatches,
    cleaningTasks,
    selectedBatch,
    selectedMediaBatch,
    selectedCleaningTask,
    activityLogs,
    loading,
    operatorPagination: {
      ...operatorPagination,
      onPageChange: setCurrentPage
    },
    activityLogsPagination: {
      ...activityLogsPagination,
      onPageChange: setActivityLogsPage
    },
    handleBatchChange,
    handleMediaBatchChange,
    handleCleaningTaskChange,
    loadActivityLogs,
    setCurrentLabFilter,
    createOperator,
    updateOperator,
    deleteOperator,
    refetch: () => fetchOperators(currentPage)
  };
};