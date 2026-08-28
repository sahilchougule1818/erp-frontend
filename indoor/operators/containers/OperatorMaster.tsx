import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { UserPlus, Trash2, Edit2, Plus } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useOperatorMaster } from '../hooks/useOperatorMaster';
import { OperatorForm } from '../forms/OperatorForm';
import { DataTable } from '../../../shared/components/DataTable';
import { useLabContext } from '../../contexts/LabContext';

export function OperatorMaster() {
  const { labNumber } = useLabContext();
  const {
    operators,
    activityLogs,
    createOperator,
    updateOperator,
    deleteOperator,
    operatorPagination,
    activityLogsPagination,
    setCurrentLabFilter
  } = useOperatorMaster();

  const [modals, setModals] = useState({
    operator: false,
    delete: false
  });
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update lab filter when global lab changes
  useEffect(() => {
    setCurrentLabFilter(labNumber || undefined);
  }, [labNumber, setCurrentLabFilter]);

  const toggleModal = (type: keyof typeof modals, open?: boolean) => {
    setModals(prev => ({ ...prev, [type]: open ?? !prev[type] }));
  };

  const handleOperatorSubmit = async (operatorData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (operatorData.id) {
        await updateOperator(operatorData.id, operatorData);
      } else {
        await createOperator(operatorData);
      }
      toggleModal('operator', false);
      setSelectedOperator(null);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (op: any) => {
    setSelectedOperator(op);
    toggleModal('operator', true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOperator(deleteId);
      toggleModal('delete', false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const closeModal = () => {
    toggleModal('operator', false);
    setSelectedOperator(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Tabs defaultValue="master" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="master">Operator Master</TabsTrigger>
          <TabsTrigger value="logs">Activity Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="master">
          <DataTable
            title=""
            records={operators}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'short_name', label: 'Short Name' },
              { key: 'full_name', label: 'Full Name', render: (_: any, op: any) => [op.first_name, op.middle_name, op.last_name].filter(Boolean).join(' ') },
              { key: 'is_active', label: 'State', render: (val: boolean) => val ? 'Active' : 'Inactive' }
            ]}
            onEdit={handleEdit}
            onDelete={(op: any) => { setDeleteId(op.id); toggleModal('delete', true); }}
            exportFileName="operator_directory"
            pagination={operatorPagination}
            addButton={
              <Button onClick={() => toggleModal('operator', true)} style={{ backgroundColor: '#4f46e5', color: '#fff' }} className="font-bold shadow-md shadow-indigo-100 rounded-xl px-4 py-2 flex items-center gap-2 transition-all hover:opacity-90 active:scale-95">
                <Plus className="w-4 h-4" />
                Register Operator
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="logs">
          <DataTable
            title=""
            records={activityLogs}
            columns={[
              { key: 'activity_date', label: 'Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '—' },
              { key: 'category', label: 'Category' },
              { key: 'reference_code', label: 'Reference' },
              { key: 'phase', label: 'Activity/Phase' },
              { key: 'stage', label: 'Stage', render: (val: string) => val || '-' },
              { key: 'lab_number', label: 'Lab', render: (val: number) => val ? `Lab ${val}` : '-' },
              { key: 'operator_id', label: 'Operator ID' },
              { key: 'short_name', label: 'Operator Short Name' },
              { key: 'notes', label: 'Notes', render: (val: string) => val || '-' }
            ]}
            filterConfig={{
              filter1Key: 'category',
              filter1Label: 'Category',
              filter2Key: 'reference_code',
              filter2Label: 'Batch / Media / Task'
            }}
            exportFileName="staff_utilization_audit"
            pagination={activityLogsPagination}
          />
        </TabsContent>
      </Tabs>

      {modals.operator && (
        <ModalLayout
          title={selectedOperator ? 'Edit Profile' : 'Register Operator'}
          icon={selectedOperator ? <Edit2 className="w-5 h-5 text-indigo-600" /> : <UserPlus className="w-5 h-5 text-indigo-600" />}
          maxWidth="480px"
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <OperatorForm
              initialData={selectedOperator}
              onSubmit={handleOperatorSubmit}
              onCancel={closeModal}
              isSubmitting={isSubmitting}
            />
          </div>
        </ModalLayout>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-red-600 flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base font-medium">
              Are you sure you want to remove this operator? This will permanently delete their directory record and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="rounded-xl font-bold h-11 px-6 border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold h-11 px-6 shadow-lg shadow-red-100">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
