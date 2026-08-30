import { LabMasterTable } from './LabMasterTable';
import { useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Plus, Edit2, Trash2, FlaskConical } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { useLabMaster, Lab } from '../hooks/useLabMaster';

export function LabMasterTab() {
  const { labs, createLab, updateLab, deleteLab } = useLabMaster();
  console.log('LabMasterTab - labs:', labs, 'length:', labs?.length);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [deleteLabId, setDeleteLabId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ labNumber: 1, labName: '', active: true });

  const handleEdit = (lab: Lab) => {
    setSelectedLab(lab);
    setFormData({ labNumber: lab.labNumber, labName: lab.labName, active: lab.active });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteLabId) return;
    try {
      await deleteLab(deleteLabId);
      setShowDeleteDialog(false);
      setDeleteLabId(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete lab');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.labName.trim()) {
      alert('Lab name is required');
      return;
    }

    try {
      if (selectedLab) {
        await updateLab(selectedLab.id, { labName: formData.labName.trim(), active: formData.active });
      } else {
        await createLab({ labNumber: formData.labNumber, labName: formData.labName.trim() });
      }
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save lab');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLab(null);
    setFormData({ labNumber: 1, labName: '', active: true });
  };

  return (
    <>
      <LabMasterTable
        title="Lab Master"
        records={labs}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'labNumber', label: 'Lab Number' },
          { key: 'labName', label: 'Lab Name' },
          { key: 'active', label: 'State', render: (val: boolean) => val ? 'Active' : 'Inactive' },
          { key: 'createdAt', label: 'Created', render: (val: string) => new Date(val).toLocaleDateString() }
        ]}
        onEdit={handleEdit}
        onDelete={(lab: Lab) => { setDeleteLabId(lab.id); setShowDeleteDialog(true); }}
        exportFileName="lab_master"
        addButton={
          <Button 
            onClick={() => setShowModal(true)} 
            className="font-bold rounded-xl px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Lab
          </Button>
        }
      />

      {showModal && (
        <ModalLayout
          title={selectedLab ? 'Edit Lab' : 'Add New Lab'}
          icon={<FlaskConical className="w-5 h-5 text-indigo-600" />}
          maxWidth="480px"
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!selectedLab && (
                <div className="space-y-2">
                  <Label>Lab Number *</Label>
                  <Input
                    type="number"
                    value={formData.labNumber}
                    onChange={(e) => setFormData({ ...formData, labNumber: parseInt(e.target.value) })}
                    placeholder="e.g., 1, 2, 3"
                    required
                    min={1}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Lab Name *</Label>
                <Input
                  value={formData.labName}
                  onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                  placeholder="e.g., Main Lab, Research Lab"
                  required
                />
              </div>

              {selectedLab && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.active ? 'active' : 'inactive'}
                    onValueChange={(value) => setFormData({ ...formData, active: value === 'active' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {selectedLab ? 'Update Lab' : 'Create Lab'}
                </Button>
              </div>
            </form>
          </div>
        </ModalLayout>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-red-600 flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base font-medium">
              Are you sure you want to delete this lab? This action cannot be undone.
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
    </>
  );
}
