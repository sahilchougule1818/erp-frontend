import apiClient from '../../shared/services/apiClient';
import { parseSpringPage } from '../../shared/utils/springPage';

function asReportRows(response: unknown): Record<string, unknown>[] {
  if (Array.isArray(response)) return response;
  return parseSpringPage<Record<string, unknown>>(response).data;
}

function normalizeReportRow(row: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'month') {
      normalized[key] = value;
      continue;
    }
    if (value === null || value === undefined || value === '') {
      normalized[key] = 0;
      continue;
    }
    const num = Number(value);
    normalized[key] = Number.isFinite(num) ? num : value;
  }
  return normalized;
}

export const reportsApi = {
  fetchReport: async (tab: string, params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get(`/reports/${tab}`, { params });
    return asReportRows(response).map(normalizeReportRow);
  },
};
