import { useState, useEffect } from 'react';
import { indoorApi } from '../../services/indoorApi';
import { useLabContext } from '../../contexts/LabContext';

export function useIndoorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [stageDistribution, setStageDistribution] = useState<any[]>([]);
  const [readyForExport, setReadyForExport] = useState<any[]>([]);
  const [mediaPreparation, setMediaPreparation] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { labNumber } = useLabContext();

  useEffect(() => {
    fetchDashboardData();
  }, [labNumber]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, stageRes, exportRes, mediaRes] = await Promise.all([
        indoorApi.dashboard.getDashboardStats('', labNumber),
        indoorApi.dashboard.getStageDistribution(labNumber),
        indoorApi.dashboard.getReadyForExport(labNumber),
        indoorApi.autoclave.getPending({ lab_number: labNumber || undefined })
      ]);

      setStats(statsRes || {});
      setStageDistribution(stageRes || []);
      setReadyForExport(exportRes || []);
      setMediaPreparation(mediaRes || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    stageDistribution,
    readyForExport,
    mediaPreparation,
    loading,
    refetch: fetchDashboardData
  };
}
