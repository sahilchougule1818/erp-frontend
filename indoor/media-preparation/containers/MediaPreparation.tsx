import { MediaPreparationTable } from '../components/MediaPreparationTable';
import { MediaStoragePanel } from '../../media-storage/components/MediaStoragePanel';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { Plus } from 'lucide-react';
import { useMediaData } from '../hooks/useMediaData';
import { MediaBatchForm } from '../forms/MediaBatchForm';
import { indoorApi } from '../../api/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { useNotify } from '../../../shared/hooks/useNotify';
import { extractApiErrorMessage } from '../../../shared/api/apiClient';
import { resolveLabNumber } from '../../../shared/utils/springPage';

const STATUS_COLORS: Record<string, string> = {};

export function MediaPreparation() {
  const { mediaBatches, saveMediaBatch, deleteMediaBatch, pagination } = useMediaData();
  const { labNumber } = useLabContext();
  const notify = useNotify();
  const [modal, setModal] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [operatorLines, setOperatorLines] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('preparation');

  const fetchOperatorWork = useCallback(async () => {
    try {
      const res = await indoorApi.autoclave.getOperatorRegister({
        labNumber: resolveLabNumber(labNumber),
      });
      const rows = Array.isArray(res) ? res : [];
      setOperatorLines(rows.map((row: any) => ({
        ...row,
        operatorShortName: row.shortName || '—',
        referenceLabel: row.mediaCode || row.referenceLabel,
        recordDate: row.recordDate,
        status: row.status,
      })));
    } catch (err) {
      notify.error(extractApiErrorMessage(err) || 'Failed to load media operator work');
      setOperatorLines([]);
    }
  }, [labNumber, notify]);

  useEffect(() => {
    if (activeTab === 'operator-work') {
      fetchOperatorWork();
    }
  }, [activeTab, fetchOperatorWork]);

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
    if (success) {
      setModal({ open: false, data: null });
      if (activeTab === 'operator-work') {
        fetchOperatorWork();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await deleteMediaBatch(deleteId);
    if (success) { setDeleteConfirm(false); setDeleteId(null); }
  };

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="preparation">Preparation</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="operator-work">Operator Work</TabsTrigger>
        </TabsList>

        <TabsContent value="preparation">
      <MediaPreparationTable
        title="Preparation Register"
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

        <TabsContent value="storage">
          <MediaStoragePanel />
        </TabsContent>

        <TabsContent value="operator-work">
          <MediaPreparationTable
            title="Media Operator Work"
            description="Read-only register. Edit operators from Preparation → Edit batch → Operators tab."
            columns={[
              { key: 'recordDate', label: 'Date', render: (v: any) => <span>{v ? String(v).split('T')[0] : '—'}</span> },
              { key: 'referenceLabel', label: 'Media Code' },
              { key: 'operatorShortName', label: 'Operator' },
              { key: 'status', label: 'Status', render: (v: any) => <span>{v || '—'}</span> },
            ]}
            records={operatorLines}
            filterConfig={{
              filter1Key: 'referenceLabel',
              filter1Label: 'Media Code',
              filter2Key: 'operatorShortName',
              filter2Label: 'Operator',
            }}
            exportFileName="media_operator_work"
            hideBorder={true}
          />
        </TabsContent>
      </Tabs>

      <MediaBatchForm
        open={modal.open}
        initialData={modal.data}
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
