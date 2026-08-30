import { FertilizationTable } from '../components/FertilizationTable';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { useFertilizationData } from '../hooks';
import { FertilizationEditModal } from '../components/FertilizationEditModal';
import { useNotify } from '../../../shared/hooks/useNotify';

export function Fertilization() {
  const { records, deleteRecord, pagination, loadData } = useFertilizationData();
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const notify = useNotify();

  const columns = [
    { key: 'createdAt', label: 'Date', render: (val: string) => val?.split('T')[0] || '' },
    { key: 'batchCode', label: 'Batch Code' },
    { key: 'plantName', label: 'Plant Name' },
    { key: 'currentPhase', label: 'Phase' },
    { key: 'currentTunnel', label: 'Tunnel' },
    { key: 'fertilizerName', label: 'Fertilizer' },
    { key: 'quantity', label: 'Quantity' }
  ];



  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await deleteRecord(deleteId);
    if (success) {
      setDeleteConfirm(false);
      setDeleteId(null);
      notify.success('Deleted successfully!');
    } else {
      notify.error('Failed to delete fertilization record');
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="fertilization" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="fertilization">Fertilization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fertilization">
          <FertilizationTable
            title="Fertilization Records"
            columns={columns}
            records={records}
            onEdit={handleEdit}
            filterConfig={{ filter1Key: 'plantName', filter1Label: 'Plant Name', filter2Key: 'batchCode', filter2Label: 'Batch Code' }}
            exportFileName="fertilization"
            pagination={pagination}
          />
        </TabsContent>
      </Tabs>

      {editingRecord && (
        <FertilizationEditModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSuccess={() => loadData()}
        />
      )}

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this fertilization record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
}