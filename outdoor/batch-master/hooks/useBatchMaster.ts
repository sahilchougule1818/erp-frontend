import { useState, useEffect, useCallback } from 'react';
import { outdoorApi } from '../../services/outdoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';
import { parseSpringPage } from '../../../shared/utils/springPage';
import { extractApiErrorMessage } from '../../../shared/services/apiClient';
import type { Batch, Tunnel, Worker } from '../../types/outdoor.types';

function normalizeIndoorBatch(raw: any) {
  if (Array.isArray(raw)) {
    return {
      id: raw[0] != null ? Number(raw[0]) : undefined,
      batchCode: raw[1],
      plantName: raw[2],
      createdAt: raw[3],
      sourceType: raw[4],
    };
  }
  return {
    id: raw?.id != null ? Number(raw.id) : raw?.indoorBatchId != null ? Number(raw.indoorBatchId) : undefined,
    batchCode: raw?.batchCode ?? raw?.batch_code,
    plantName: raw?.plantName ?? raw?.plant_name,
    createdAt: raw?.createdAt ?? raw?.created_at,
    sourceType: raw?.sourceType ?? raw?.source_type,
  };
}

export function useBatchMaster() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [shUnits, setShUnits] = useState<Tunnel[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [indoorBatches, setIndoorBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const notify = useNotify();

  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [batchesRes, phUnitsRes, shUnitsRes, workersRes] = await Promise.all([
        outdoorApi.dashboard.getAllBatches(page, limit),
        outdoorApi.phUnits.getAll(),
        outdoorApi.shUnits.getAll(),
        outdoorApi.workers.getAll(1, 500),
      ]);

      const batchesPage = parseSpringPage<Batch>(batchesRes);
      const workersPage = parseSpringPage<Worker>(workersRes);

      setBatches(batchesPage.data);
      setCurrentPage(batchesPage.pagination.currentPage);
      setTotalPages(batchesPage.pagination.totalPages);
      setTotal(batchesPage.pagination.total);

      setTunnels((Array.isArray(phUnitsRes) ? phUnitsRes : []).map((t: any) => ({
        ...t,
        availableSpace: t.availableSpace ?? t.capacity ?? 0,
      })));
      setShUnits(Array.isArray(shUnitsRes) ? shUnitsRes : []);
      setWorkers(workersPage.data);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      notify.error(extractApiErrorMessage(error) || 'Failed to load data');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [limit, notify]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadData(page);
  };

  const loadIndoorBatches = async () => {
    try {
      const data = await outdoorApi.batches.getIndoorAvailable();
      const rows = Array.isArray(data) ? data : [];
      setIndoorBatches(rows.map(normalizeIndoorBatch));
      return true;
    } catch {
      setIndoorBatches([]);
      notify.error('Failed to load indoor batches');
      return false;
    }
  };

  const importFromIndoor = async (indoorBatch: any, data: any) => {
    const normalized = normalizeIndoorBatch(indoorBatch);
    const indoorBatchId = data.indoorBatchId ?? normalized.id;
    const batchCode = data.batchCode ?? normalized.batchCode;

    if (!indoorBatchId && !batchCode) {
      notify.error('Indoor batch is missing. Please go back and select the batch again.');
      return false;
    }

    try {
      const payload: Record<string, unknown> = {
        batchCode,
        sourceType: data.sourceType ?? normalized.sourceType ?? 'batch',
        unit: data.newTunnel,
        plants: data.plants,
        trays: data.trays ?? [],
        workers: data.selectedWorkers,
      };
      if (indoorBatchId) {
        payload.indoorBatchId = indoorBatchId;
      }

      await outdoorApi.batches.importFromIndoor(payload);
      notify.success('Batch imported successfully');
      await loadData(currentPage);
      return true;
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to import batch');
      return false;
    }
  };

  const makeShift = async (batchCode: string, data: any) => {
    try {
      await outdoorApi.batchOperations.makeShift({
        batchCode,
        newTunnel: data.newTunnel,
        newUnit: data.newUnit,
        plants: data.plants,
        mortalityCount: data.mortalityCount,
        reason: data.reason,
        trays: data.trays ?? [],
        workers: data.selectedWorkers,
      });
      notify.success('Shift created successfully');
      await loadData(currentPage);
      return true;
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to create shift');
      return false;
    }
  };

  const phaseTransition = async (batchCode: string, _currentTunnel: string, data: any) => {
    try {
      await outdoorApi.batchOperations.phaseTransition({
        batchCode,
        targetPhase: data.targetPhase,
        newTunnel: data.newTunnel,
        unit: data.unit,
        plants: data.plants,
        mortalityCount: data.mortalityCount,
        reason: data.reason,
        trays: data.trays ?? [],
        workers: data.selectedWorkers,
      });
      notify.success('Phase transition completed');
      await loadData(currentPage);
      return true;
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to transition phase');
      return false;
    }
  };

  const undoLastAction = async (batchCode: string, versionToken?: number) => {
    try {
      const response = await outdoorApi.batchOperations.undoLastAction({ batchCode, versionToken });
      const data = (response as any)?.data ?? response;
      const isImportUndo = data?.batchDeleted === true;
      notify.success(
        isImportUndo ? 'Batch import undone — batch removed' : (data?.message || 'Action undone successfully')
      );
      await loadData(currentPage);
      return true;
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to undo action');
      return false;
    }
  };

  const recordFertilization = async (batchCode: string, data: any) => {
    try {
      await outdoorApi.fertilization.create({
        batchCode,
        fertilizerName: data.fertilizerName,
        quantity: data.quantity,
        workerIds: data.selectedWorkers,
      });
      notify.success('Fertilization recorded');
      return true;
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to record fertilization');
      return false;
    }
  };

  const submitSample = async (batchCode: string, data: any) => {
    try {
      await outdoorApi.sampling.submit({
        batchCode,
        sampleDate: data.sampleDate,
        notes: data.sampleNotes,
      });
      notify.success('Sample submitted successfully');
      await loadData(currentPage);
      return true;
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to submit sample');
      return false;
    }
  };

  const reportSampleResult = async (batchCode: string, data: any) => {
    try {
      const submissionsRes = await outdoorApi.sampling.getSubmissions(1, 500);
      const { data: submissionData } = parseSpringPage<any>(submissionsRes);
      const submission = submissionData.find((s: any) => s.batchCode === batchCode);
      if (!submission) {
        notify.error('Sample submission record not found');
        return false;
      }
      await outdoorApi.sampling.reportResult(submission.id, {
        receivedDate: data.resultDate,
        status: data.status,
        certificateNumber: data.seedCertificateNumber || null,
        reason: data.notes || null,
      });
      notify.success('Sample result reported successfully');
      await loadData(currentPage);
      return true;
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to report sample result');
      return false;
    }
  };

  const getAvailableTunnels = () => tunnels.filter(t => (t.availableSpace ?? 0) > 0);

  return {
    batches,
    tunnels,
    shUnits,
    workers,
    indoorBatches,
    loading,
    loadData,
    loadIndoorBatches,
    importFromIndoor,
    makeShift,
    phaseTransition,
    undoLastAction,
    recordFertilization,
    submitSample,
    reportSampleResult,
    getAvailableTunnels,
    pagination: {
      page: currentPage,
      currentPage,
      totalPages,
      total,
      limit,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      onPageChange: handlePageChange,
    },
  };
}
