import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../settings/settingsApi';
import { useNotify } from '../../shared/hooks/useNotify';

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getCompanySettings();
      setSettings(response.data);
    } catch (error: any) {
      console.error('Fetch settings error:', error);
      // Don't show error notification on initial load if it's just empty
      if (error?.message && !error.message.includes('Authentication')) {
        notify.error('Failed to load company settings');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (data: any) => {
    try {
      setLoading(true);
      const response = await settingsApi.updateCompanySettings(data);
      notify.success('Company settings updated successfully');
      await fetchSettings();
      return response;
    } catch (error: any) {
      console.error('Update settings error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to update company settings';
      notify.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, updateSettings, refetch: fetchSettings };
};

export const usePlantTerms = () => {
  const [plantTerms, setPlantTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  const fetchAllPlantTerms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getAllPlantTerms();
      setPlantTerms(response.data || []);
    } catch (error: any) {
      console.error('Fetch plant terms error:', error);
      // Don't show error notification on initial load if it's just empty
      if (error?.message && !error.message.includes('Authentication')) {
        notify.error('Failed to load plant terms');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertPlantTerms = async (plantName: string, terms: string[]) => {
    try {
      setLoading(true);
      const response = await settingsApi.upsertPlantTerms(plantName, terms);
      notify.success('Plant terms saved successfully');
      await fetchAllPlantTerms();
      return response;
    } catch (error: any) {
      console.error('Upsert plant terms error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to save plant terms';
      notify.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePlantTerms = async (plantName: string) => {
    try {
      setLoading(true);
      const response = await settingsApi.deletePlantTerms(plantName);
      notify.success('Plant terms deleted successfully');
      await fetchAllPlantTerms();
      return response;
    } catch (error: any) {
      console.error('Delete plant terms error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to delete plant terms';
      notify.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPlantTerms();
  }, [fetchAllPlantTerms]);

  return { plantTerms, loading, upsertPlantTerms, deletePlantTerms, refetch: fetchAllPlantTerms };
};
