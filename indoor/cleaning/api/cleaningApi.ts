import apiClient from '../../../shared/api/apiClient';
import { toSpringPageParams, resolveLabNumber } from '../../../shared/utils/springPage';

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

export const cleaningApi = {
  getAll: (params?: { type?: string; page?: number; limit?: number; size?: number; labNumber?: number }) => {
    const { type, page = 1, limit = 10, size, labNumber } = params || {};
    return apiClient.get('/indoor/cleaning', {
      params: pageQuery(page, size ?? limit, { ...(type ? { type } : {}), labNumber }),
    });
  },
  create: (data: Record<string, unknown>) => apiClient.post('/indoor/cleaning', data),
  update: (id: number | string, data: Record<string, unknown>) => apiClient.put(`/indoor/cleaning/${id}`, data),
  delete: (id: number | string, type: string) => apiClient.delete(`/indoor/cleaning/${id}?type=${type}`),
};
