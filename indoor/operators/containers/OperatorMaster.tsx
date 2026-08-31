import { OperatorMasterTable } from '../components/OperatorMasterTable';
import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { UserPlus, Trash2, Edit2, Plus } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { useOperatorMaster } from '../hooks/useOperatorMaster';
import { OperatorForm } from '../forms/OperatorForm';
import { formatOperatorDesignations } from '../constants/operatorDesignations';
import { useLabContext } from '../../contexts/LabContext';
import { useNotify } from '../../../shared/hooks/useNotify';
import { extractApiErrorMessage } from '../../../shared/api/apiClient';

export function OperatorMaster() {
  const { labNumber } = useLabContext();
  const notify = useNotify();
  const {
    operators,
    createOperator,
    updateOperator,
    deleteOperator,
    operatorPagination,
    setCurrentLabFilter
  } = useOperatorMaster();

  const [modals, setModals] = useState({
    operator: false,
    delete: false
  });
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      notify.error(extractApiErrorMessage(error) || 'Failed to save operator');
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
      notify.success('Operator deleted');
    } catch (error) {
      notify.error(extractApiErrorMessage(error) || 'Failed to delete operator');
    }
  };

  const closeModal = () => {
    toggleModal('operator', false);
    setSelectedOperator(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <OperatorMasterTable
        title="Operator Master"
        records={operators}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'shortName', label: 'Short Name' },
          { key: 'fullName', label: 'Full Name', render: (_: any, op: any) => [op.firstName, op.middleName, op.lastName].filter(Boolean).join(' ') },
          { key: 'designations', label: 'Designations', render: (_: any, op: any) => formatOperatorDesignations(op.designations) },
          { key: 'isActive', label: 'State', render: (val: boolean, op: any) => (val ?? op.active) ? 'Active' : 'Inactive' }
        ]}
        onEdit={handleEdit}
        onDelete={(op: any) => { setDeleteId(op.id); toggleModal('delete', true); }}
        exportFileName="operator_directory"
        pagination={operatorPagination}
        addButton={
          <Button onClick={() => toggleModal('operator', true)} className="font-bold rounded-xl px-4 py-2 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Register Operator
          </Button>
        }
      />

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
