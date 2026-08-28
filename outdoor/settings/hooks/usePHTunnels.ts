import { useState, useEffect } from 'react';
import apiClient from '../../../shared/services/apiClient';
import { parseSpringPage } from '../../../shared/utils/springPage';

export interface Tunnel {
  id: number;
  name: string;
  capacity: number;
  current_occupancy?: number;
  is_active: boolean;
  created_at: string;
  display_name?: string;
}

export const usePHTunnels = () => {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTunnels = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/outdoor/settings/ph-tunnels');
      const { data } = parseSpringPage<Tunnel>(response);
      setTunnels(data);
    } catch (error) {
      console.error('Failed to fetch PH tunnels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTunnels();
  }, []);

  const createTunnel = async (data: { name: string; capacity: number }) => {
    await apiClient.post('/outdoor/settings/ph-tunnels', data);
    await fetchTunnels();
  };

  const updateTunnel = async (id: number, data: { name: string; capacity: number }) => {
    await apiClient.put(`/outdoor/settings/ph-tunnels/${id}`, data);
    await fetchTunnels();
  };

  return { tunnels, loading, createTunnel, updateTunnel };
};
