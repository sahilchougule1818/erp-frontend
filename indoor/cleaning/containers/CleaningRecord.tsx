import { CleaningTable } from '../components/CleaningTable';
import { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Button } from '../../../shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { Plus, Save, Users } from 'lucide-react';
import { useCleaningData } from '../hooks/useCleaningData';
import { CleaningRecordForm } from '../forms/CleaningRecordForm';
import { indoorApi } from '../../api/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { useNotify } from '../../../shared/hooks/useNotify';
import { OperatorSelector } from '../../operators/components/OperatorSelector';

export function CleaningRecord() {
  const { cleaningRecords, deepCleaningRecords, operators, saveCleaningRecord, saveDeepCleaningRecord, deleteCleaningRecord, deleteDeepCleaningRecord, refetch, cleaningPagination, deepCleaningPagination } = useCleaningData();
  const { labNumber } = useLabContext();
  const notify = useNotify();
  const [tab, setTab] = useState('cleaning');
  const [modal, setModal] = useState({ open: false, editData: null, type: 'cleaning' });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [operatorLines, setOperatorLines] = useState<any[]>([]);
  const [operatorWorkType, setOperatorWorkType] = useState<'standard' | 'deep'>('standard');
  const [editingOperators, setEditingOperators] = useState<{ recordId: number; type: 'standard' | 'deep'; label: string } | null>(null);
  const [selectedOperatorIds, setSelectedOperatorIds] = useState<number[]>([]);
  const [savingOperators, setSavingOperators] = useState(false);

  const cleaningColumns = [
    { key: 'date', label: 'Date', render: (val: string) => val?.split('T')[0] },
    { key: 'areaCleaned', label: 'Area Cleaned' },
    { key: 'notes', label: 'Notes' }
  ];

  const deepCleaningColumns = [
    { key: 'date', label: 'Date', render: (val: string) => val?.split('T')[0] },
    { key: 'instrumentCleaned', label: 'Instrument Cleaned' },
    { key: 'notes', label: 'Notes' }
  ];

  const operatorWorkColumns = [
    { key: 'recordDate', label: 'Date', render: (val: string) => val ? String(val).split('T')[0] : '—' },
    { key: 'referenceLabel', label: operatorWorkType === 'deep' ? 'Instrument' : 'Area' },
    { key: 'operatorShortName', label: 'Operator' },
    { key: 'recordType', label: 'Type', render: (val: string) => val === 'deep' ? 'Deep Cleaning' : 'Cleaning' },
  ];

  const fetchOperatorWork = useCallback(async () => {
    try {
      const res = await indoorApi.cleaning.getOperatorRegister({
        type: operatorWorkType,
        labNumber: labNumber || undefined,
      });
      const rows = Array.isArray(res) ? res : [];
      setOperatorLines(rows.map((row: any) => ({
        ...row,
        operatorShortName: row.shortName,
        referenceLabel: row.referenceLabel,
        recordDate: row.recordDate,
        recordType: row.recordType || operatorWorkType,
      })));
    } catch {
      setOperatorLines([]);
    }
  }, [operatorWorkType, labNumber]);

  useEffect(() => {
    if (tab === 'operator-work') {
      fetchOperatorWork();
    }
  }, [tab, fetchOperatorWork]);

  const openOperatorEdit = async (row: any) => {
    const type = (row.recordType === 'deep' ? 'deep' : 'standard') as 'standard' | 'deep';
    try {
      const assignments = await indoorApi.cleaning.getOperators(row.recordId, type);
      const ids = Array.isArray(assignments)
        ? assignments.map((item: any) => parseInt(item.operatorId, 10)).filter(Boolean)
        : [];
      setSelectedOperatorIds(ids);
      setEditingOperators({
        recordId: row.recordId,
        type,
        label: row.referenceLabel || '',
      });
    } catch {
      notify.error('Failed to load operators');
    }
  };

  const saveOperatorEdit = async () => {
    if (!editingOperators) return;
    setSavingOperators(true);
    try {
      await indoorApi.cleaning.replaceOperators(
        editingOperators.recordId,
        selectedOperatorIds,
        editingOperators.type
      );
      notify.success('Operators updated');
      setEditingOperators(null);
      await fetchOperatorWork();
      refetch();
    } catch (error: any) {
      notify.error(error.message || 'Failed to update operators');
    } finally {
      setSavingOperators(false);
    }
  };

  const handleSave = async (formData: any) => {
    const success = modal.type === 'cleaning' 
      ? await saveCleaningRecord(formData)
      : await saveDeepCleaningRecord(formData);
    if (success) {
      setModal({ open: false, editData: null, type: 'cleaning' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = tab === 'cleaning'
      ? await deleteCleaningRecord(deleteId)
      : await deleteDeepCleaningRecord(deleteId);
    if (success) {
      setDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="cleaning">Cleaning Record</TabsTrigger>
          <TabsTrigger value="deep">Deep Cleaning Record</TabsTrigger>
          <TabsTrigger value="operator-work">Operator Work</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cleaning">
          <CleaningTable
            title="Cleaning Record"
            columns={cleaningColumns}
            records={cleaningRecords}
            exportFileName="cleaning_records"
            onDelete={(record) => { setDeleteId(record.id); setDeleteConfirm(true); }}
            filterConfig={{
              filter1Key: 'date',
              filter1Label: 'Date',
              filter2Key: 'areaCleaned',
              filter2Label: 'Area Cleaned'
            }}
            pagination={cleaningPagination}
            addButton={
              <Button onClick={() => setModal({ open: true, editData: null, type: 'cleaning' })}>
                <Plus className="w-4 h-4 mr-2" />Add New
              </Button>
            }
          />
        </TabsContent>
        
        <TabsContent value="deep">
          <CleaningTable
            title="Deep Cleaning Record"
            columns={deepCleaningColumns}
            records={deepCleaningRecords}
            exportFileName="deep_cleaning_records"
            onDelete={(record) => { setDeleteId(record.id); setDeleteConfirm(true); }}
            filterConfig={{
              filter1Key: 'date',
              filter1Label: 'Date',
              filter2Key: 'instrumentCleaned',
              filter2Label: 'Instrument Cleaned'
            }}
            pagination={deepCleaningPagination}
            addButton={
              <Button onClick={() => setModal({ open: true, editData: null, type: 'deep' })}>
                <Plus className="w-4 h-4 mr-2" />Add New
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="operator-work">
          <CleaningTable
            title="Cleaning Operator Work"
            columns={operatorWorkColumns}
            records={operatorLines}
            exportFileName="cleaning_operator_work"
            onEdit={openOperatorEdit}
            filterConfig={{
              filter1Key: 'referenceLabel',
              filter1Label: operatorWorkType === 'deep' ? 'Instrument' : 'Area',
              filter2Key: 'operatorShortName',
              filter2Label: 'Operator',
            }}
            addButton={
              <div className="flex gap-2">
                <Button
                  variant={operatorWorkType === 'standard' ? 'default' : 'outline'}
                  onClick={() => setOperatorWorkType('standard')}
                >
                  Standard
                </Button>
                <Button
                  variant={operatorWorkType === 'deep' ? 'default' : 'outline'}
                  onClick={() => setOperatorWorkType('deep')}
                >
                  Deep
                </Button>
              </div>
            }
          />
        </TabsContent>
      </Tabs>

      <Dialog open={modal.open} onOpenChange={(o: boolean) => { if (!o) setModal({ ...modal, open: false }); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modal.editData ? 'Edit' : 'Add'} {modal.type === 'cleaning' ? 'Cleaning' : 'Deep Cleaning'} Record</DialogTitle>
          </DialogHeader>
          <CleaningRecordForm
            initialData={modal.editData}
            operators={operators}
            type={modal.type as 'cleaning' | 'deep'}
            onSubmit={handleSave}
            onDelete={(id) => { setDeleteId(id); setDeleteConfirm(true); setModal({ open: false, editData: null, type: modal.type }); }}
            onCancel={() => setModal({ open: false, editData: null, type: modal.type })}
          />
        </DialogContent>
      </Dialog>

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
              operators={operators}
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
