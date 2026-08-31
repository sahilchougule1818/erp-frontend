import apiClient from '../../shared/api/apiClient';
import { toSpringPageParams, resolveLabNumber } from '../../shared/utils/springPage';
import { cleaningApi } from '../cleaning/api/cleaningApi';

const pageQuery = (uiPage = 1, size = 10, extra: Record<string, unknown> = {}) => {
  const params: Record<string, unknown> = { ...toSpringPageParams(uiPage, size), ...extra };
  if ('labNumber' in params) {
    const resolved = resolveLabNumber(params.labNumber as number | undefined);
    if (resolved === undefined) {
      delete params.labNumber;
    } else {
      params.labNumber = resolved;
    }
  }
  return params;
};

export const indoorApi = {
  batchOperations: {
    getAllBatches: (params?: { page?: number; limit?: number; size?: number; labNumber?: number }) => {
      const { page = 1, limit = 10, size, labNumber } = params || {};
      return apiClient.get('/indoor/batches', { params: pageQuery(page, size ?? limit, { labNumber }) });
    },
    createBatch:          (data: any) => apiClient.post('/indoor/batches', data),
    firstMultiplication:      (data: any) => apiClient.post('/indoor/batches/first-multiplication', data),
    fullMultiplication:       (data: any) => apiClient.post('/indoor/incubation/full-multiplication', data),
    makePartialMultiplication:  (data: any) => apiClient.post('/indoor/incubation/partial-multiplication', data),
    exportBatch:          (data: any) => apiClient.post('/indoor/batches/export', data),
    unexportBatch:        (data: any) => apiClient.post('/indoor/batches/unexport', data),
    undoLastAction:       (data: any) => apiClient.post('/indoor/batches/undo', data),
    getUndoPreview:       (batchCode: string) => apiClient.get(`/indoor/batches/undo-preview/${batchCode}`),
    deleteBatch:          (batchCode: string) => apiClient.delete(`/indoor/batches/${batchCode}`)
  },

  dashboard: {
    getDashboardStats:    (params?: string, labNumber?: number) => {
      const queryParams = params || '';
      const resolved = resolveLabNumber(labNumber);
      const labParam = resolved !== undefined ? `${queryParams ? '&' : '?'}labNumber=${resolved}` : '';
      return apiClient.get(`/indoor/dashboard/indoor-stats${queryParams}${labParam}`);
    },
    getStageDistribution: (labNumber?: number) => {
      const resolved = resolveLabNumber(labNumber);
      return apiClient.get('/indoor/dashboard/stage-distribution', {
        params: resolved !== undefined ? { labNumber: resolved } : {},
      });
    },
    getReadyForExport:    (labNumber?: number) => {
      const resolved = resolveLabNumber(labNumber);
      return apiClient.get('/indoor/dashboard/ready-for-export', {
        params: resolved !== undefined ? { labNumber: resolved } : {},
      });
    },
  },

  phaseViews: {
    getMultiplication: (page = 1, limit = 10, labNumber?: number) =>
      apiClient.get('/indoor/multiplication', { params: pageQuery(page, limit, { labNumber }) }),
    incubate: (data: any) => apiClient.post('/indoor/multiplication/incubate', data),
    getIncubation: (page = 1, limit = 10, labNumber?: number) =>
      apiClient.get('/indoor/incubation', { params: pageQuery(page, limit, { labNumber }) }),
  },

  sampling: {
    getSubmissions: (params?: { page?: number; limit?: number; size?: number; labNumber?: number }) => {
      const { page = 1, limit = 10, size, labNumber } = params || {};
      return apiClient.get('/indoor/sampling/submissions', { params: pageQuery(page, size ?? limit, { labNumber }) });
    },
    getResults: (params?: { page?: number; limit?: number; size?: number; labNumber?: number }) => {
      const { page = 1, limit = 10, size, labNumber } = params || {};
      return apiClient.get('/indoor/sampling/results', { params: pageQuery(page, size ?? limit, { labNumber }) });
    },
    getSummary: (params?: { page?: number; limit?: number; size?: number; labNumber?: number }) => {
      const { page = 1, limit = 10, size, labNumber } = params || {};
      return apiClient.get('/indoor/sampling/summary', { params: pageQuery(page, size ?? limit, { labNumber }) });
    },
    submit:            (data: any) => apiClient.post('/indoor/sampling/submit', data),
    reportResult:      (id: number | string, data: any) => apiClient.put(`/indoor/sampling/result/${id}`, data),
    deleteSubmission:  (id: number | string) => apiClient.delete(`/indoor/sampling/submission/${id}`),
    deleteResult:      (id: number | string) => apiClient.delete(`/indoor/sampling/result/${id}`)
  },

  contamination: {
    getAll: (params?: { page?: number; limit?: number; size?: number; labNumber?: number }) => {
      const { page = 1, limit = 10, size, labNumber } = params || {};
      return apiClient.get('/indoor/contamination', { params: pageQuery(page, size ?? limit, { labNumber }) });
    },
    getSummary:       (labNumber?: number) => apiClient.get('/indoor/contamination/summary', { params: { labNumber } }),
    getByBatch:       (batchCode: string) => apiClient.get(`/indoor/contamination/batch/${batchCode}`),
    getActiveRecord:  (batchCode: string) => apiClient.get(`/indoor/contamination/batch/${batchCode}/active`),
    update: (id: number | string, data: { qtyContaminated: number; notes?: string | null; expectedContamination?: number; sourceTable?: string }) =>
      data.sourceTable === 'rooted_batches'
        ? apiClient.put(`/indoor/rooting/${id}/contamination`, data)
        : apiClient.put(`/indoor/incubation/${id}/contamination`, data)
  },

  operators: {
    getAll: (params?: { page?: number; limit?: number; size?: number }) => {
      const { page = 1, limit = 10, size } = params || {};
      return apiClient.get('/indoor/operators', { params: pageQuery(page, size ?? limit) });
    },
    getActive: (params?: { designation?: string }) =>
      apiClient.get('/indoor/operators/active', { params }),
    create:    (data: any) => apiClient.post('/indoor/operators', data),
    update:    (id: number | string, data: any) => apiClient.put(`/indoor/operators/${id}`, data),
    delete:    (id: number | string) => apiClient.delete(`/indoor/operators/${id}`),
  },

  batchOperatorLines: {
    get: (params: {
      batchCode?: string;
      stage?: string;
      eventCode?: string;
      sourceTable?: string;
      sourceRecordId?: number;
      labNumber?: number;
    } = {}) => apiClient.get('/indoor/batch-operator-lines', { params }),
    update: (data: {
      sourceTable: string;
      sourceRecordId: number;
      eventCode: string;
      notes?: string;
      operators: { id: number; qtyIn?: number; qtyOut?: number; qtyContaminated?: number }[];
    }) => apiClient.put('/indoor/batch-operator-lines', data),
    finalizeMultiplication: (eventCode: string) =>
      apiClient.post(`/indoor/batch-operator-lines/finalize-multiplication/${encodeURIComponent(eventCode)}`),
    recordContamination: (eventCode: string, data: {
      lines: { lineId: number; qtyContaminated: number }[];
      notes?: string;
    }) => apiClient.post(`/indoor/batch-operator-lines/contamination?eventCode=${encodeURIComponent(eventCode)}`, data),
  },

  mediaStorage: {
    list: (params?: { status?: string; labNumber?: number }) =>
      apiClient.get('/indoor/media-storage', { params }),
    getImportable: (labNumber?: number) =>
      apiClient.get('/indoor/media-storage/importable', { params: labNumber != null ? { labNumber } : {} }),
    import: (data: { autoclaveCycleId: number; notes?: string }) =>
      apiClient.post('/indoor/media-storage/import', data),
    markReady: (id: number) => apiClient.post(`/indoor/media-storage/${id}/mark-ready`),
    markImported: (id: number) => apiClient.post(`/indoor/media-storage/${id}/mark-imported`),
    revertToPreparation: (id: number) => apiClient.delete(`/indoor/media-storage/${id}`),
    getReadyCodes: (labNumber?: number) =>
      apiClient.get('/indoor/media-storage/ready-codes', { params: labNumber != null ? { labNumber } : {} }),
  },

  batchTimeline: {
    getBatches:  () => apiClient.get('/indoor/batch-master/batches'),
    getTimeline: (batchCode: string) => apiClient.get(`/indoor/batch-master/${batchCode}`)
  },

    autoclave: {
    getAll:       (params?: { page?: number; status?: string; labNumber?: number }) => apiClient.get('/indoor/media-preparation', { params }),
    getPending:   (params?: { labNumber?: number }) => apiClient.get('/indoor/media-preparation', { params: { ...params, status: 'pending' } }),
    getCompleted: (params?: { labNumber?: number }) => apiClient.get('/indoor/media-preparation', { params: { ...params, status: 'completed' } }),
    getMediaCodes: () => apiClient.get('/indoor/media-preparation/media-codes'),
    create:       (data: any) => apiClient.post('/indoor/media-preparation', data),
    update:       (id: number | string, data: any) => apiClient.put(`/indoor/media-preparation/${id}`, data),
    delete:       (id: number | string) => apiClient.delete(`/indoor/media-preparation/${id}`),
    getOperatorRegister: (params?: { labNumber?: number }) =>
      apiClient.get('/indoor/media-preparation/operator-register', { params }),
    getOperators: (id: number | string) => apiClient.get(`/indoor/media-preparation/${id}/operators`),
    replaceOperators: (id: number | string, operatorIds: number[]) =>
      apiClient.put(`/indoor/media-preparation/${id}/operators`, { operatorIds }),
  },

  cleaning: {
    getAll: cleaningApi.getAll,
    create: cleaningApi.create,
    update: cleaningApi.update,
    delete: cleaningApi.delete,
    getOperatorRegister: (params?: { type?: string; labNumber?: number }) =>
      apiClient.get('/indoor/cleaning/operator-register', { params }),
    getOperators: (id: number | string, type: 'standard' | 'deep' = 'standard') =>
      apiClient.get(`/indoor/cleaning/${id}/operators`, { params: { type } }),
    replaceOperators: (id: number | string, operatorIds: number[], type: 'standard' | 'deep' = 'standard') =>
      apiClient.put(`/indoor/cleaning/${id}/operators`, { operatorIds }, { params: { type } }),
  },

  rooting: {
    getRootedBatches: (page = 1, limit = 50, labNumber?: number) =>
      apiClient.get('/indoor/rooting', { params: pageQuery(page, limit, { labNumber }) }),
    makePartialRooting:     (data: any) => apiClient.post('/indoor/incubation/partial-rooting', data),
    moveFullBatchToRooting: (data: any) => apiClient.post('/indoor/incubation/full-rooting', data),
    moveToTerminalIncubation: (id: number, data: any) => apiClient.post(`/indoor/rooting/${id}/terminal-incubation`, data),
    undoRootedBatch:        (id: number, createdBy: string) => apiClient.delete(`/indoor/rooting/${id}`, { data: { createdBy } }),
    recordContamination: (id: number, data: { qtyContaminated: number; notes?: string; sourceTable?: string }) =>
      data.sourceTable === 'incubation_records'
        ? apiClient.put(`/indoor/incubation/${id}/contamination`, data)
        : apiClient.put(`/indoor/rooting/${id}/contamination`, data),
    markAvailableForOutdoor:(id: number) => apiClient.post(`/indoor/rooting/${id}/mark-outdoor`),
    unmarkFromOutdoor:      (id: number) => apiClient.post(`/indoor/rooting/${id}/unmark-outdoor`)
  },

  labs: {
    getLabs:   () => apiClient.get('/indoor/settings/labs'),
    createLab: (data: { labNumber: number; labName: string }) => apiClient.post('/indoor/settings/labs', data),
    updateLab: (id: number, data: { labName: string; active: boolean }) => apiClient.put(`/indoor/settings/labs/${id}`, data),
    deleteLab: (id: number) => apiClient.delete(`/indoor/settings/labs/${id}`)
  },

  plants: {
    getPlants:    () => apiClient.get('/indoor/settings/plants'),
    createPlant:  (data: { plantName: string; plantSubtype?: string }) => apiClient.post('/indoor/settings/plants', data),
    updatePlant:  (id: number, data: { plantName: string; active: boolean }) => apiClient.put(`/indoor/settings/plants/${id}`, data),
    deletePlant:  (id: number) => apiClient.delete(`/indoor/settings/plants/${id}`)
  },

  batchActions: {
    getPermissions:       (batchCode: string) => apiClient.get(`/indoor/batch-master/${batchCode}/permissions`),
    checkPermission:      (batchCode: string, action: string) => apiClient.get(`/indoor/batch-master/${batchCode}/can/${action}`)
  }
};
