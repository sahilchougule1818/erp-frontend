import apiClient from '../../shared/services/apiClient';
import { toSpringPageParams, resolveLabNumber } from '../../shared/utils/springPage';

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
    subculture:           (data: any) => apiClient.post('/indoor/subculturing', data),
    incubate:             (data: any) => apiClient.post('/indoor/incubation', data),
    exportBatch:          (data: any) => apiClient.post('/indoor/batches/export', data),
    unexportBatch:        (data: any) => apiClient.post('/indoor/batches/unexport', data),
    undoLastAction:       (data: any) => apiClient.post('/indoor/batches/undo', data),
    getUndoPreview:       (batchCode: string) => apiClient.get(`/indoor/batches/undo-preview/${batchCode}`),
    deleteBatch:          (batchCode: string) => apiClient.delete(`/indoor/batches/${batchCode}`)
  },

  dashboard: {
    getDashboardStats:    (params?: string, labNumber?: number) => {
      const queryParams = params || '';
      const labParam = labNumber !== undefined ? `${queryParams ? '&' : '?'}labNumber=${labNumber}` : '';
      return apiClient.get(`/indoor/dashboard/indoor-stats${queryParams}${labParam}`);
    },
    getStageDistribution: (labNumber?: number) => apiClient.get('/indoor/dashboard/stage-distribution', { params: { labNumber } }),
    getReadyForExport:    (labNumber?: number) => apiClient.get('/indoor/dashboard/ready-for-export', { params: { labNumber } })
  },

  phaseViews: {
    getSubculturing: (page = 1, limit = 10, labNumber?: number) =>
      apiClient.get('/indoor/subculturing', { params: pageQuery(page, limit, { labNumber }) }),
    getIncubation: (page = 1, limit = 10, labNumber?: number) =>
      apiClient.get('/indoor/incubation', { params: pageQuery(page, limit, { labNumber }) }),
    updateIncubationDetails: (eventCode: string, data: { incubationPeriod: number; temperature?: number; humidity?: number; lightIntensity?: number }) =>
      apiClient.put(`/indoor/incubation/${eventCode}`, data)
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
    update:           (id: number | string, data: { qtyContaminated: number; notes?: string | null; expectedContamination?: number }) => apiClient.put(`/indoor/contamination/${id}`, data)
  },

  operators: {
    getAll: (params?: { page?: number; limit?: number; size?: number }) => {
      const { page = 1, limit = 10, size } = params || {};
      return apiClient.get('/indoor/operators', { params: pageQuery(page, size ?? limit) });
    },
    getActive: () => apiClient.get('/indoor/operators/active'),
    getLog:    () => apiClient.get('/indoor/operator-log'),
    create:    (data: any) => apiClient.post('/indoor/operators', data),
    update:    (id: number | string, data: any) => apiClient.put(`/indoor/operators/${id}`, data),
    delete:    (id: number | string) => apiClient.delete(`/indoor/operators/${id}`),
    getAssignments: (params: {
      eventCode?: string; event_code?: string;
      activityType?: string; activity_type?: string;
      mediaCode?: string; media_code?: string;
      cleaningId?: number; cleaning_id?: number;
      cleaningType?: string; cleaning_type?: string;
    } = {}) => {
      const eventCode = params.eventCode ?? params.event_code;
      const activityType = params.activityType ?? params.activity_type ?? 'event';
      const mediaCode = params.mediaCode ?? params.media_code;
      const cleaningId = params.cleaningId ?? params.cleaning_id;
      const cleaningType = params.cleaningType ?? params.cleaning_type;
      let url = `/indoor/operators/assignment?activityType=${activityType}`;
      if (mediaCode) url += `&mediaCode=${mediaCode}`;
      if (eventCode) url += `&eventCode=${eventCode}`;
      if (cleaningId) url += `&cleaningId=${cleaningId}&cleaningType=${cleaningType}`;
      return apiClient.get(url);
    },
    addAssignment: (data: {
      eventCode?: string;
      operatorId: number;
      role?: string;
      activityType?: string;
      mediaCode?: string;
      batchCode?: string;
      stage?: string;
      cleaningId?: number;
      cleaningType?: string;
    }) => apiClient.post('/indoor/operators/assignment', data),
    removeAssignment: (id: number) => apiClient.delete(`/indoor/operators/assignment/${id}`)
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
    delete:       (id: number | string) => apiClient.delete(`/indoor/media-preparation/${id}`)
  },

  cleaning: {
    getAll: (params?: { type?: string; page?: number; limit?: number; size?: number }) => {
      const { type, page = 1, limit = 10, size } = params || {};
      return apiClient.get('/indoor/cleaning', { params: pageQuery(page, size ?? limit, type ? { type } : {}) });
    },
    create:  (data: any) => apiClient.post('/indoor/cleaning', data),
    update:  (id: number | string, data: any) => apiClient.put(`/indoor/cleaning/${id}`, data),
    delete:  (id: number | string, type: string) => apiClient.delete(`/indoor/cleaning/${id}?type=${type}`)
  },

  rooting: {
    getRootedBatches: (page = 1, limit = 50, labNumber?: number) =>
      apiClient.get('/indoor/rooting', { params: pageQuery(page, limit, { labNumber }) }),
    makePartialRooting:     (data: any) => apiClient.post('/indoor/rooting/partial', data),
    moveFullBatchToRooting: (data: any) => apiClient.post('/indoor/rooting/full', data),
    moveToTerminalIncubation: (id: number, data: any) => apiClient.post(`/indoor/rooting/${id}/terminal-incubation`, data),
    undoRootedBatch:        (id: number, createdBy: string) => apiClient.delete(`/indoor/rooting/${id}`, { data: { createdBy } }),
    recordContamination:    (id: number, data: { qtyContaminated: number; notes?: string; sourceTable?: string }) => apiClient.put(`/indoor/rooting/${id}/contamination`, data),
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
    createPlant:  (data: { plantName: string }) => apiClient.post('/indoor/settings/plants', data),
    updatePlant:  (id: number, data: { plantName: string; active: boolean }) => apiClient.put(`/indoor/settings/plants/${id}`, data),
    deletePlant:  (id: number) => apiClient.delete(`/indoor/settings/plants/${id}`)
  },

  batchActions: {
    getPermissions:       (batchCode: string) => apiClient.get(`/indoor/batch-master/${batchCode}/permissions`),
    checkPermission:      (batchCode: string, action: string) => apiClient.get(`/indoor/batch-master/${batchCode}/can/${action}`)
  }
};
