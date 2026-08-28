import { useState, useEffect } from 'react';
import apiClient from '../../../shared/services/apiClient';
import { parseSpringPage } from '../../../shared/utils/springPage';

export interface Lab {
  id: number;
  labNumber: number;
  labName: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const useLabMaster = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/indoor/settings/labs');
      const { data } = parseSpringPage<Lab>(response);
      setLabs(data);
    } catch (error) {
      console.error('Failed to fetch labs:', error);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const createLab = async (data: { labNumber: number; labName: string }) => {
    await apiClient.post('/indoor/settings/labs', data);
    await fetchLabs();
  };

  const updateLab = async (id: number, data: { labName: string; active: boolean }) => {
    await apiClient.put(`/indoor/settings/labs/${id}`, data);
    await fetchLabs();
  };

  const deleteLab = async (id: number) => {
    await apiClient.delete(`/indoor/settings/labs/${id}`);
    await fetchLabs();
  };

  return { labs, loading, createLab, updateLab, deleteLab };
};
