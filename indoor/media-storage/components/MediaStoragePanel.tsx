import { useCallback, useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { indoorApi } from '../../api/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { useNotify } from '../../../shared/hooks/useNotify';
import { Button } from '../../../shared/ui/button';
import { MediaPreparationTable } from '../../media-preparation/components/MediaPreparationTable';
import { MediaStorageImportModal } from '../forms/MediaStorageImportModal';
import { MediaStorageEditForm } from '../forms/MediaStorageEditForm';
import type { MediaStorageRecord } from '../../types';

export function MediaStoragePanel() {
  const { labNumber } = useLabContext();
  const notify = useNotify();
  const [records, setRecords] = useState<MediaStorageRecord[]>([]);
  const [importable, setImportable] = useState<MediaStorageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MediaStorageRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [storageRes, importableRes] = await Promise.all([
        indoorApi.mediaStorage.list({ labNumber }),
        indoorApi.mediaStorage.getImportable(labNumber),
      ]);
      setRecords(Array.isArray(storageRes) ? storageRes : []);
      setImportable(Array.isArray(importableRes) ? importableRes : []);
    } catch (error: any) {
      notify.error('Failed to load media storage: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [labNumber, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenImport = async () => {
    setImportModalOpen(true);
    try {
      const importableRes = await indoorApi.mediaStorage.getImportable(labNumber);
      setImportable(Array.isArray(importableRes) ? importableRes : []);
    } catch (error: any) {
      notify.error('Failed to load importable cycles: ' + (error.message || 'Unknown error'));
    }
  };

  const handleImport = async (autoclaveCycleId: number, notes?: string) => {
    setImporting(true);
    try {
      await indoorApi.mediaStorage.import({ autoclaveCycleId, notes });
      notify.success('Media imported to storage');
      setImportModalOpen(false);
      await loadData();
    } catch (error: any) {
      notify.error('Import failed: ' + (error.message || 'Unknown error'));
    } finally {
      setImporting(false);
    }
  };

  const handleSaveEdit = async (data: { status: string; notes?: string }) => {
    if (!editingRecord?.id) return;
    setSaving(true);
    try {
      const currentStatus = editingRecord.status || 'IMPORTED';
      if (data.status === 'READY' && currentStatus !== 'READY') {
        await indoorApi.mediaStorage.markReady(editingRecord.id);
      } else if (data.status === 'IMPORTED' && currentStatus === 'READY') {
        await indoorApi.mediaStorage.markImported(editingRecord.id);
      }
      notify.success('Storage record updated');
      setEditingRecord(null);
      await loadData();
    } catch (error: any) {
      notify.error('Failed to save: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'importedAt', label: 'Imported', render: (v: string) => <span>{v ? String(v).split('T')[0] : '—'}</span> },
    { key: 'mediaCode', label: 'Media Code' },
    { key: 'mediaType', label: 'Media Type', render: (v: string) => <span>{v || '—'}</span> },
    { key: 'bottlesCount', label: 'Bottles' },
    { key: 'volumeMl', label: 'Volume (ml)', render: (v: number) => <span>{v ?? '—'}</span> },
    { key: 'status', label: 'Status' },
    { key: 'readyAt', label: 'Ready Date', render: (v: string) => <span>{v ? String(v).split('T')[0] : '—'}</span> },
  ];

  return (
    <>
      <MediaPreparationTable
        title="Storage Register"
        columns={columns}
        records={loading ? [] : records}
        onEdit={(record) => setEditingRecord(record)}
        filterConfig={{
          filter1Key: 'mediaCode',
          filter1Label: 'Media Code',
          filter2Key: 'status',
          filter2Label: 'Status',
        }}
        exportFileName="media_storage"
        hideBorder={true}
        addButton={
          <Button onClick={handleOpenImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        }
      />

      <MediaStorageImportModal
        open={importModalOpen}
        importable={importable}
        loading={loading}
        importing={importing}
        onImport={handleImport}
        onClose={() => setImportModalOpen(false)}
      />

      <MediaStorageEditForm
        open={!!editingRecord}
        record={editingRecord}
        saving={saving}
        onSave={handleSaveEdit}
        onClose={() => setEditingRecord(null)}
      />
    </>
  );
}
