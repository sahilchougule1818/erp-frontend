// DEPRECATED: Use ContaminationEditModal component instead of browser prompts.
// This utility is kept temporarily to avoid immediate breakage in other containers
// but logic has been moved to a premium Dialog-based UI.

import { indoorApi } from '../../services/indoorApi';
import { useNotify } from '../shared/hooks/useNotify';

export const handleEditContamination = async (record: any, notify: any, onSuccess: () => void) => {
  // Logic still exists for emergency fallback but should be phased out
  try {
    if (record.state && record.state !== 'ACTIVE') {
      notify?.error ? notify.error('Cannot modify contamination for a completed phase.') : notify.error('Cannot modify contamination for a completed phase.');
      return;
    }
    
    const newCountStr = window.prompt(`Enter new contamination count for ${record.batch_code}:`, record.qty_contaminated || 0);
    if (newCountStr === null) return;
    
    const newCount = parseInt(newCountStr, 10);
    if (isNaN(newCount) || newCount < 0) {
      notify?.error ? notify.error('Invalid contamination count.') : notify.error('Invalid contamination count.');
      return;
    }

    await indoorApi.contamination.update(record.id, { qty_contaminated: newCount, contamination_count: newCount });
    if (notify?.success) notify.success('Contamination updated successfully');
    onSuccess();
  } catch (error: any) {
    console.error('Failed to update contamination', error);
    if (notify?.error) {
      notify.error('Failed to update contamination: ' + (error.response?.data?.message || error.message));
    } else {
      notify.error('Failed to update contamination: ' + (error.response?.data?.message || error.message));
    }
  }
};