import { useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { Plus } from 'lucide-react';
import { useMediaData } from '../hooks/useMediaData';
import { MediaBatchForm } from '../forms/MediaBatchForm';
import { DataTable } from '../../../shared/components/DataTable';

const STATUS_COLORS: Record<string, string> = {};

export function MediaPreparation() {
  const { mediaBatches, saveMediaBatch, deleteMediaBatch, pagination } = useMediaData();
  const [modal, setModal] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const columns = [
    { key: 'created_at', label: 'Created Date', render: (v: any) => <span>{v ? String(v).split('T')[0] : '—'}</span> },
    { key: 'media_code', label: 'Media Code' },
    { key: 'media_type', label: 'Media Type', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'started_at', label: 'Autoclave ON', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'media_loaded_at', label: 'Media Load Time', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'pressure_reached_at', label: 'Pressure Time', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'ended_at', label: 'Off Time', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'opened_at', label: 'Open Time', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'media_volume', label: 'Media Volume', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'bottles_count', label: 'Bottles', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'temperature', label: 'Temp (°C)', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'pressure', label: 'Pressure (PSI)', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'status', label: 'State' },
  ];

  const handleSave = async (formData: any) => {
    const success = await saveMediaBatch(formData);
    if (success) setModal({ open: false, data: null });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await deleteMediaBatch(deleteId);
    if (success) { setDeleteConfirm(false); setDeleteId(null); }
  };

  return (
    <div className="p-6">
      <DataTable
        title=""
        columns={columns}
        records={mediaBatches}
        onEdit={(record) => setModal({ open: true, data: record })}
        filterConfig={{
          filter1Key: 'created_at',
          filter1Label: 'Date',
          filter2Key: 'media_code',
          filter2Label: 'Media Code'
        }}
        exportFileName="media_preparation"
        pagination={pagination}
        addButton={
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setModal({ open: true, data: null })}>
            <Plus className="w-4 h-4 mr-2" />Add New
          </Button>
        }
      />

      <MediaBatchForm
        open={modal.open}
        initialData={modal.data}
        operators={[]}
        onSubmit={handleSave}
        onDelete={(id) => { setDeleteId(id); setDeleteConfirm(true); setModal({ open: false, data: null }); }}
        onClose={() => setModal({ open: false, data: null })}
      />

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
