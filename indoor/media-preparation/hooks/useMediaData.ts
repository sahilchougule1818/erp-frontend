import { useState, useEffect } from 'react';
import { useNotify } from '../../../shared/hooks/useNotify';
import { extractApiErrorMessage } from '../../../shared/services/apiClient';
import { indoorApi } from '../../services/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { parseSpringPage } from '../../../shared/utils/springPage';
import type { Operator } from '../../types';

export function useMediaData() {
  const notify = useNotify();
  const { labNumber } = useLabContext();
  const [mediaBatches, setMediaBatches] = useState<any[]>([]);
  const [pendingMediaBatches, setPendingMediaBatches] = useState<any[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0, limit: 10 });

  useEffect(() => {
    fetchMediaBatches();
    fetchPendingMediaBatches();
    fetchOperators();
  }, [page, labNumber]);

  const fetchMediaBatches = async () => {
    try {
      const res = await indoorApi.autoclave.getAll({ page, labNumber: labNumber || undefined });
      const { data, pagination: pageInfo } = parseSpringPage(res);
      setMediaBatches(data);
      setPagination({
        currentPage: pageInfo.page,
        totalPages: pageInfo.totalPages,
        total: pageInfo.total,
        limit: pageInfo.limit
      });
    } catch {
      setMediaBatches([]);
    }
  };

  const fetchPendingMediaBatches = async () => {
    try {
      const res = await indoorApi.autoclave.getPending({ labNumber: labNumber || undefined });
      const { data } = parseSpringPage(res);
      setPendingMediaBatches(data);
    } catch {
      setPendingMediaBatches([]);
    }
  };

  const fetchOperators = async () => {
    try {
      const data = await indoorApi.operators.getActive();
      setOperators(Array.isArray(data) ? data : []);
    } catch {
      setOperators([]);
    }
  };

  const saveMediaBatch = async (formData: any) => {
    setLoading(true);
    try {
      const { operator_ids: operatorIds, ...rest } = formData;

      if (formData.id) {
        await indoorApi.autoclave.update(formData.id, rest);
      } else {
        const created = await indoorApi.autoclave.create(rest) as { media_code?: string; mediaCode?: string };
        const mediaCode = created?.media_code || created?.mediaCode || rest.media_code;
        if (operatorIds?.length && mediaCode) {
          await Promise.all(
            operatorIds.map((operatorId: number) =>
              indoorApi.operators.addAssignment({
                operatorId,
                activityType: 'autoclave',
                mediaCode,
              })
            )
          );
        }
      }
      await fetchMediaBatches();
      await fetchPendingMediaBatches();
      return true;
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err) || 'Please try again';
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        notify.error('Media code already exists. Please use a different media code.');
      } else if (status === 403) {
        notify.error('Cannot edit this record in its current status.');
      } else {
        notify.error('Failed to save: ' + msg);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMediaBatch = async (id: number) => {
    setLoading(true);
    try {
      await indoorApi.autoclave.delete(id);
      await fetchMediaBatches();
      await fetchPendingMediaBatches();
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    mediaBatches,
    pendingMediaBatches,
    operators,
    loading,
    saveMediaBatch,
    deleteMediaBatch,
    pagination: { ...pagination, onPageChange: setPage }
  };
}
