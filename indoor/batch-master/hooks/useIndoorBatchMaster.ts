import { useState, useCallback } from 'react';
import { indoorApi } from '../../api/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { parseSpringPage } from '../../../shared/utils/springPage';
import { Batch, Operator } from '../../types';

export const useIndoorBatchMaster = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { labNumber } = useLabContext();
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchBatches = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: { page: number; limit: number; labNumber?: number } = { page, limit: 10 };
      if (labNumber !== 0) {
        params.labNumber = labNumber;
      }
      const res = await indoorApi.batchOperations.getAllBatches(params);
      const { data, pagination: pageInfo } = parseSpringPage<Batch>(res);
      setBatches(data);
      setPagination({
        total: pageInfo.total,
        page: pageInfo.page,
        limit: pageInfo.limit,
        totalPages: pageInfo.totalPages,
        hasNext: pageInfo.hasNext,
        hasPrev: pageInfo.hasPrev
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  }, [labNumber]);

  const fetchOperators = useCallback(async (designation?: string) => {
    try {
      const data = await indoorApi.operators.getActive(
        designation ? { designation } : undefined
      );
      setOperators(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch operators', err);
    }
  }, []);

  const createBatch = async (data: any) => {
    try {
      const res = await indoorApi.batchOperations.createBatch(data);
      await fetchBatches();
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const recordSubculture = async (batchCode: string, data: any) => {
    try {
      const res = await indoorApi.batchOperations.subculture({ batchCode, ...data });
      await fetchBatches();
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const recordIncubation = async (batchCode: string, data: any) => {
    try {
      const res = await indoorApi.batchOperations.incubate({ batchCode, ...data });
      await fetchBatches();
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const exportToOutdoor = async (batchCode: string, data: any) => {
    try {
      const res = await indoorApi.batchOperations.exportBatch({ batchCode, ...data });
      await fetchBatches();
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const unexportFromOutdoor = async (batchCode: string) => {
    try {
      const res = await indoorApi.batchOperations.unexportBatch({ batchCode });
      await fetchBatches();
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const previewUndo = async (batchCode: string) => {
    try {
      const res = await indoorApi.batchOperations.getUndoPreview(batchCode);
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const undoLastAction = async (batchCode: string) => {
    try {
      await indoorApi.batchOperations.undoLastAction({ batchCode });
      await fetchBatches();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const getBatchTimeline = async (batchCode: string) => {
    try {
      const res = await indoorApi.batchTimeline.getTimeline(batchCode);
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const submitSample = async (batchCode: string, data: any) => {
    try {
      await indoorApi.sampling.submit({
        batchCode,
        sampleDate: data.sampleDate,
        notes: data.sampleNotes
      });
      await fetchBatches();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const reportSampleResult = async (batchCode: string, data: any) => {
    try {
      await indoorApi.sampling.reportResult(batchCode, {
        receivedDate: data.receivedDate,
        status: data.status,
        governmentDigitalCode: data.governmentDigitalCode,
        reason: data.reason
      });
      await fetchBatches();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return {
    batches,
    operators,
    loading,
    error,
    pagination,
    fetchBatches,
    fetchOperators,
    createBatch,
    recordSubculture,
    recordIncubation,
    exportToOutdoor,
    unexportFromOutdoor,
    previewUndo,
    undoLastAction,
    getBatchTimeline,
    submitSample,
    reportSampleResult
  };
};
