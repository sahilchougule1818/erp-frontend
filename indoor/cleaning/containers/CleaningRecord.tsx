import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Button } from '../../../shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { Plus } from 'lucide-react';
import { useCleaningData } from '../hooks/useCleaningData';
import { CleaningRecordForm } from '../forms/CleaningRecordForm';
import { DataTable } from '../../../shared/components/DataTable';
import { UnifiedOperatorEditModal } from '../../operators/components/UnifiedOperatorEditModal';

export function CleaningRecord() {
  const { cleaningRecords, deepCleaningRecords, operators, saveCleaningRecord, saveDeepCleaningRecord, deleteCleaningRecord, deleteDeepCleaningRecord, refetch, cleaningPagination, deepCleaningPagination } = useCleaningData();
  const [tab, setTab] = useState('cleaning');
  const [modal, setModal] = useState({ open: false, editData: null, type: 'cleaning' });
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const cleaningColumns = [
    { key: 'date', label: 'Date', render: (val: string) => val?.split('T')[0] },
    { key: 'area_cleaned', label: 'Area Cleaned' },
    { key: 'notes', label: 'Notes' }
  ];

  const deepCleaningColumns = [
    { key: 'date', label: 'Date', render: (val: string) => val?.split('T')[0] },
    { key: 'instrument_cleaned', label: 'Instrument Cleaned' },
    { key: 'notes', label: 'Notes' }
  ];

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
        </TabsList>
        
        <TabsContent value="cleaning">
          <DataTable
            title=""
            columns={cleaningColumns}
            records={cleaningRecords}
            exportFileName="cleaning_records"
            onEdit={(record) => setEditingAssignment({ ...record, type: 'standard' })}
            onDelete={(record) => { setDeleteId(record.id); setDeleteConfirm(true); }}
            filterConfig={{
              filter1Key: 'date',
              filter1Label: 'Date',
              filter2Key: 'area_cleaned',
              filter2Label: 'Area Cleaned'
            }}
            pagination={cleaningPagination}
            addButton={
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setModal({ open: true, editData: null, type: 'cleaning' })}>
                <Plus className="w-4 h-4 mr-2" />Add New
              </Button>
            }
          />
        </TabsContent>
        
        <TabsContent value="deep">
          <DataTable
            title=""
            columns={deepCleaningColumns}
            records={deepCleaningRecords}
            exportFileName="deep_cleaning_records"
            onEdit={(record) => setEditingAssignment({ ...record, type: 'deep' })}
            onDelete={(record) => { setDeleteId(record.id); setDeleteConfirm(true); }}
            filterConfig={{
              filter1Key: 'date',
              filter1Label: 'Date',
              filter2Key: 'instrument_cleaned',
              filter2Label: 'Instrument Cleaned'
            }}
            pagination={deepCleaningPagination}
            addButton={
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setModal({ open: true, editData: null, type: 'deep' })}>
                <Plus className="w-4 h-4 mr-2" />Add New
              </Button>
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

      {editingAssignment && (
        <UnifiedOperatorEditModal 
          cleaning_id={editingAssignment.id}
          cleaning_type={editingAssignment.type}
          onClose={() => setEditingAssignment(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
