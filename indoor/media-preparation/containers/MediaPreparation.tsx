import { MediaPreparationTable } from '../components/MediaPreparationTable';
import { useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { Plus } from 'lucide-react';
import { useMediaData } from '../hooks/useMediaData';
import { MediaBatchForm } from '../forms/MediaBatchForm';
const STATUS_COLORS: Record<string, string> = {};

export function MediaPreparation() {
  const { mediaBatches, saveMediaBatch, deleteMediaBatch, pagination } = useMediaData();
  const [modal, setModal] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const columns = [
    { key: 'createdAt', label: 'Created Date', render: (v: any) => <span>{v ? String(v).split('T')[0] : '—'}</span> },
    { key: 'mediaCode', label: 'Media Code' },
    { key: 'mediaType', label: 'Media Type', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'startedAt', label: 'Autoclave ON', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'mediaLoadedAt', label: 'Media Load Time', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'pressureReachedAt', label: 'Pressure Time', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'endedAt', label: 'Off Time', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'openedAt', label: 'Open Time', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'mediaVolume', label: 'Media Volume', render: (v: any) => <span>{v || '—'}</span> },
    { key: 'bottlesCount', label: 'Bottles', render: (v: any) => <span>{v || '—'}</span> },
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
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="register">Media Preparation Register</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
      <MediaPreparationTable
        title="Media Preparation Register"
        columns={columns}
        records={mediaBatches}
        onEdit={(record) => setModal({ open: true, data: record })}
        filterConfig={{
          filter1Key: 'createdAt',
          filter1Label: 'Date',
          filter2Key: 'mediaCode',
          filter2Label: 'Media Code'
        }}
        exportFileName="media_preparation"
        pagination={pagination}
        hideBorder={true}
        addButton={
          <Button onClick={() => setModal({ open: true, data: null })}>
            <Plus className="w-4 h-4 mr-2" />Add New
          </Button>
        }
      />
        </TabsContent>
      </Tabs>

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
