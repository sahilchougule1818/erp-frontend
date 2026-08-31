import { MediaPreparationTable } from '../components/MediaPreparationTable';
import { MediaStoragePanel } from '../../media-storage/components/MediaStoragePanel';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { Plus, Save, Users } from 'lucide-react';
import { useMediaData } from '../hooks/useMediaData';
import { MediaBatchForm } from '../forms/MediaBatchForm';
import { indoorApi } from '../../api/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { useNotify } from '../../../shared/hooks/useNotify';
import { OperatorSelector } from '../../operators/components/OperatorSelector';
const STATUS_COLORS: Record<string, string> = {};

export function MediaPreparation() {
  const { mediaBatches, saveMediaBatch, deleteMediaBatch, pagination } = useMediaData();
  const { labNumber } = useLabContext();
  const notify = useNotify();
  const [modal, setModal] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [operatorLines, setOperatorLines] = useState<any[]>([]);
  const [editingOperators, setEditingOperators] = useState<{ recordId: number; label: string } | null>(null);
  const [selectedOperatorIds, setSelectedOperatorIds] = useState<number[]>([]);
  const [mediaOperators, setMediaOperators] = useState<any[]>([]);
  const [savingOperators, setSavingOperators] = useState(false);
  const [activeTab, setActiveTab] = useState('preparation');

  const fetchOperatorWork = useCallback(async () => {
    try {
      const res = await indoorApi.autoclave.getOperatorRegister({ labNumber: labNumber || undefined });
      const rows = Array.isArray(res) ? res : [];
      setOperatorLines(rows.map((row: any) => ({
        ...row,
        operatorShortName: row.shortName,
        referenceLabel: row.mediaCode || row.referenceLabel,
        recordDate: row.recordDate,
      })));
    } catch {
      setOperatorLines([]);
    }
  }, [labNumber]);

  useEffect(() => {
    if (activeTab === 'operator-work') {
      fetchOperatorWork();
      indoorApi.operators.getActive({ designation: 'MEDIA_PREPARATION' })
        .then((res) => setMediaOperators(Array.isArray(res) ? res : []))
        .catch(() => setMediaOperators([]));
    }
  }, [activeTab, fetchOperatorWork]);

  const openOperatorEdit = async (row: any) => {
    try {
      const assignments = await indoorApi.autoclave.getOperators(row.recordId);
      const ids = Array.isArray(assignments)
        ? assignments.map((item: any) => parseInt(item.operatorId, 10)).filter(Boolean)
        : [];
      setSelectedOperatorIds(ids);
      setEditingOperators({
        recordId: row.recordId,
        label: row.referenceLabel || row.mediaCode || '',
      });
    } catch {
      notify.error('Failed to load operators');
    }
  };

  const saveOperatorEdit = async () => {
    if (!editingOperators) return;
    setSavingOperators(true);
    try {
      await indoorApi.autoclave.replaceOperators(editingOperators.recordId, selectedOperatorIds);
      notify.success('Operators updated');
      setEditingOperators(null);
      fetchOperatorWork();
    } catch (error: any) {
      notify.error(error.message || 'Failed to update operators');
    } finally {
      setSavingOperators(false);
    }
  };

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
            columns={[
              { key: 'recordDate', label: 'Date', render: (v: any) => <span>{v ? String(v).split('T')[0] : '—'}</span> },
              { key: 'referenceLabel', label: 'Media Code' },
              { key: 'operatorShortName', label: 'Operator' },
              { key: 'status', label: 'Status', render: (v: any) => <span>{v || '—'}</span> },
            ]}
            records={operatorLines}
            onEdit={openOperatorEdit}
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

      {editingOperators && (
        <Dialog open onOpenChange={(open) => !open && !savingOperators && setEditingOperators(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Manage Operators
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{editingOperators.label}</p>
            <OperatorSelector
              operators={mediaOperators}
              selectedIds={selectedOperatorIds}
              onChange={setSelectedOperatorIds}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingOperators(null)} disabled={savingOperators}>
                Cancel
              </Button>
              <Button onClick={saveOperatorEdit} disabled={savingOperators}>
                <Save className="w-4 h-4 mr-2" />
                {savingOperators ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
