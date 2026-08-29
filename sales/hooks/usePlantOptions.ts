import { useState, useEffect } from 'react';
import apiClient from '../../shared/api/apiClient';
import { parseSpringPage } from '../../shared/utils/springPage';

export interface PlantOption {
  id: number;
  plantName: string;
  active: boolean;
}

/** Sales-owned hook for plant dropdown options (reads indoor plant master API). */
export function usePlantOptions() {
  const [plants, setPlants] = useState<PlantOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/indoor/settings/plants');
        const { data } = parseSpringPage<PlantOption>(response);
        if (!cancelled) setPlants(data.filter((p) => p.active));
      } catch {
        if (!cancelled) setPlants([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { plants, loading };
}
