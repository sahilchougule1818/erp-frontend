import { useState, useEffect } from 'react';
import apiClient from '../../../shared/api/apiClient';
import { parseSpringPage } from '../../../shared/utils/springPage';

export interface Plant {
  id: number;
  plantName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function usePlantMaster() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/indoor/settings/plants');
      const { data } = parseSpringPage<Plant>(response);
      setPlants(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch plants');
      console.error('Failed to fetch plants:', err);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const createPlant = async (plantData: { plantName: string }) => {
    await apiClient.post('/indoor/settings/plants', plantData);
    await fetchPlants();
  };

  const updatePlant = async (id: number, plantData: { plantName: string; active: boolean }) => {
    await apiClient.put(`/indoor/settings/plants/${id}`, plantData);
    await fetchPlants();
  };

  const deletePlant = async (id: number) => {
    await apiClient.delete(`/indoor/settings/plants/${id}`);
    await fetchPlants();
  };

  return {
    plants,
    loading,
    error,
    createPlant,
    updatePlant,
    deletePlant,
    refetch: fetchPlants,
  };
}
