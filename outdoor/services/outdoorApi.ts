import apiClient from '../../shared/services/apiClient';
import { toSpringPageParams } from '../../shared/utils/springPage';
import type { ShiftPayload, TransitionPayload, UndoPayload } from '../types/outdoor.types';

const pageQuery = (uiPage = 1, size = 10, extra: Record<string, unknown> = {}) => ({
  ...toSpringPageParams(uiPage, size),
  ...extra,
});

export const outdoorApi = {
  batchOperations: {
    makeShift: (data: ShiftPayload) => apiClient.post('/outdoor/batch-operations/shift', data),
    phaseTransition: (data: TransitionPayload) => apiClient.post('/outdoor/batch-operations/transition', data),
    undoLastAction: (data: UndoPayload) => apiClient.post('/outdoor/batch-operations/undo', data),
    getUndoPreview: (batchCode: string) => apiClient.get(`/outdoor/batch-operations/undo-preview/${batchCode}`),
  },

  dashboard: {
    getAllBatches: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/dashboard/batches', { params: pageQuery(page, limit) }),
    getDashboardStats: (params?: string) => apiClient.get(`/outdoor/dashboard/stats${params || ''}`),
    getTunnelOccupancy: (params?: string) => apiClient.get(`/outdoor/dashboard/tunnel-occupancy${params || ''}`),
    getSHOccupancy: (params?: string) => apiClient.get(`/outdoor/dashboard/sh-occupancy${params || ''}`),
    getHoldingArea: () => apiClient.get('/outdoor/dashboard/holding-area'),
  },

  phaseViews: {
    getPrimaryHardening: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/primary-hardening', { params: pageQuery(page, limit) }),
    getSecondaryHardening: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/secondary-hardening', { params: pageQuery(page, limit) }),
    getTunnelShifts: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/tunnel-shifts', { params: pageQuery(page, limit) }),
    getHoldingArea: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/holding-area', { params: pageQuery(page, limit) }),
  },

  settings: {
    getPhTunnels: () => apiClient.get('/outdoor/settings/ph-tunnels', { params: { active: true } }),
    createPhTunnel: (data: { name: string; capacity?: number }) =>
      apiClient.post('/outdoor/settings/ph-tunnels', data),
    updatePhTunnel: (id: number, data: { name: string; capacity?: number; active?: boolean }) =>
      apiClient.put(`/outdoor/settings/ph-tunnels/${id}`, data),

    getShUnits: () => apiClient.get('/outdoor/settings/sh-units', { params: { active: true } }),
    createShUnit: (data: { name: string; capacity?: number }) =>
      apiClient.post('/outdoor/settings/sh-units', data),
    updateShUnit: (id: number, data: { name: string; capacity?: number; active?: boolean }) =>
      apiClient.put(`/outdoor/settings/sh-units/${id}`, data),
    deletePhTunnel: (id: number) => apiClient.delete(`/outdoor/settings/ph-tunnels/${id}`),
    deleteShUnit: (id: number) => apiClient.delete(`/outdoor/settings/sh-units/${id}`),
  },

  // Backward-compatible aliases used by existing hooks
  phUnits: {
    getAll: () => apiClient.get('/outdoor/settings/ph-tunnels', { params: { active: true } }),
    create: (data: { name: string; capacity?: number }) =>
      apiClient.post('/outdoor/settings/ph-tunnels', data),
    update: (id: number, data: { name: string; capacity?: number; active?: boolean }) =>
      apiClient.put(`/outdoor/settings/ph-tunnels/${id}`, data),
  },

  shUnits: {
    getAll: () => apiClient.get('/outdoor/settings/sh-units', { params: { active: true } }),
    create: (data: { name: string; capacity?: number }) =>
      apiClient.post('/outdoor/settings/sh-units', data),
    update: (id: number, data: { name: string; capacity?: number; active?: boolean }) =>
      apiClient.put(`/outdoor/settings/sh-units/${id}`, data),
  },

  workers: {
    getAll: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/workers', { params: pageQuery(page, limit) }),
    getLog: (page = 1, limit = 10, batch?: string) =>
      apiClient.get('/outdoor/workers/log', { params: pageQuery(page, limit, batch ? { batch } : {}) }),
    create: (data: any) => apiClient.post('/outdoor/workers', data),
    update: (id: number, data: any) => apiClient.put(`/outdoor/workers/${id}`, data),
    delete: (id: number) => apiClient.delete(`/outdoor/workers/${id}`),
    updateAssignment: (id: number, workerId: number) =>
      apiClient.put(`/outdoor/workers/assignment/${id}`, { workerId }),
    getAssignments: (eventCode: string, activityType = 'event', fertilizationId?: number) =>
      apiClient.get('/outdoor/workers/assignment', {
        params: { eventCode, activityType, fertilizationId },
      }),
    addAssignment: (data: {
      eventCode?: string;
      workerId: number;
      role?: string;
      tunnel?: string;
      phase?: string;
      activityType?: string;
      fertilizationId?: number;
    }) => apiClient.post('/outdoor/workers/assignment', data),
    removeAssignment: (id: number) => apiClient.delete(`/outdoor/workers/assignment/${id}`),
  },

  batches: {
    getAll: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/dashboard/batches', { params: pageQuery(page, limit) }),
    getIndoorAvailable: () => apiClient.get('/outdoor/batches/indoor-available'),
    importFromIndoor: (data: any) => apiClient.post('/outdoor/batches/import-from-indoor', data),
    delete: (batchCode: string) => apiClient.delete(`/outdoor/batch-operations/batch/${batchCode}`),
  },

  mortality: {
    getHistory: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/mortality', { params: pageQuery(page, limit) }),
    getLog: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/mortality/log', { params: pageQuery(page, limit) }),
    getSummary: () => apiClient.get('/outdoor/mortality/summary'),
    getByBatch: (batchCode: string) => apiClient.get(`/outdoor/mortality/batch/${batchCode}`),
    getCurrentStay: (batchCode: string) => apiClient.get(`/outdoor/mortality/current-stay/${batchCode}`),
    recordMortality: (batchCode: string, mortalityCount: number, reason?: string, expectedMortality?: number) =>
      apiClient.post(`/outdoor/mortality/${batchCode}`, { mortalityCount, reason, expectedMortality }),
  },

  fertilization: {
    getAll: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/fertilization/history', { params: pageQuery(page, limit) }),
    create: (data: any) => apiClient.post('/outdoor/fertilization', data),
    update: (id: number, data: any) => apiClient.put(`/outdoor/fertilization/${id}`, data),
    delete: (id: number) => apiClient.delete(`/outdoor/fertilization/${id}`),
  },

  sampling: {
    getSubmissions: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/sampling/create', { params: pageQuery(page, limit) }),
    getResults: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/sampling/report', { params: pageQuery(page, limit) }),
    getSummary: (page = 1, limit = 10) =>
      apiClient.get('/outdoor/sampling/summary', { params: pageQuery(page, limit) }),
    submit: (data: any) => apiClient.post('/outdoor/sampling/submit', data),
    reportResult: (id: number, data: any) => apiClient.put(`/outdoor/sampling/${id}/result`, data),
    deleteSubmission: (id: number) => apiClient.delete(`/outdoor/sampling/create/${id}`),
    deleteResult: (id: number) => apiClient.delete(`/outdoor/sampling/report/${id}`),
  },

  batchTimeline: {
    getBatches: () => apiClient.get('/outdoor/batch-timeline/batches'),
    getTimeline: (batchCode: string) => apiClient.get(`/outdoor/batch-timeline/${batchCode}`),
    getStats: (batchCode: string) => apiClient.get(`/outdoor/batch-timeline/${batchCode}/stats`),
  },
};
