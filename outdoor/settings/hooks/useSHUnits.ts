import { useState, useEffect } from 'react';
import { outdoorApi } from '../../services/outdoorApi';
import { parseSpringPage } from '../../../shared/utils/springPage';

export interface SHUnit {
  id: number;
  name: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
}

export const useSHUnits = () => {
  const [units, setUnits] = useState<SHUnit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await outdoorApi.settings.getShUnits();
      const { data } = parseSpringPage<SHUnit>(response);
      setUnits(data);
    } catch (error) {
      console.error('Failed to fetch SH units:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const createUnit = async (data: { name: string; capacity: number }) => {
    await outdoorApi.settings.createShUnit(data);
    await fetchUnits();
  };

  const updateUnit = async (id: number, data: { name: string; capacity: number; is_active: boolean }) => {
    await outdoorApi.settings.updateShUnit(id, {
      name: data.name,
      capacity: data.capacity,
      active: data.is_active,
    });
    await fetchUnits();
  };

  const deleteUnit = async (id: number) => {
    await outdoorApi.settings.deleteShUnit(id);
    await fetchUnits();
  };

  return { units, loading, createUnit, updateUnit, deleteUnit };
};
