import { useState } from 'react';

/**
 * Custom hook to manage unified phase record editing (Mortality + Workers).
 * Centralizes state and logic for the phase-view containers.
 */
export function usePhaseEditing(refetch: () => void) {
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const onEditRecord = (record: any) => {
    setEditingRecord(record);
  };

  const closeEdit = () => {
    setEditingRecord(null);
    refetch();
  };

  return {
    editingRecord,
    onEditRecord,
    closeEdit,
  };
}
