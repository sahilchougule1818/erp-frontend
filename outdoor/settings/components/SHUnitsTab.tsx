import { useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { DataTable } from '../../../shared/components/DataTable';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { useSHUnits, SHUnit } from '../hooks/useSHUnits';

export function SHUnitsTab() {
  const { units, createUnit, updateUnit, deleteUnit } = useSHUnits();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<SHUnit | null>(null);
  const [deleteUnitId, setDeleteUnitId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', capacity: 0, is_active: true });

  const handleEdit = (unit: SHUnit) => {
    setSelectedUnit(unit);
    setFormData({ name: unit.name, capacity: unit.capacity || 0, is_active: unit.is_active });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteUnitId) return;
    try {
      await deleteUnit(deleteUnitId);
      setShowDeleteDialog(false);
      setDeleteUnitId(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete unit');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Unit name is required');
      return;
    }

    try {
      if (selectedUnit) {
        await updateUnit(selectedUnit.id, { name: formData.name, capacity: formData.capacity, is_active: formData.is_active });
      } else {
        await createUnit({ name: formData.name, capacity: formData.capacity });
      }
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save unit');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUnit(null);
    setFormData({ name: '', capacity: 0, is_active: true });
  };

  return (
    <>
      <DataTable
        title=""
        records={units}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Unit Name' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'is_active', label: 'State', render: (val: boolean) => val ? 'Active' : 'Inactive' },
          { key: 'created_at', label: 'Created', render: (val: string) => new Date(val).toLocaleDateString() }
        ]}
        onEdit={handleEdit}
        onDelete={(unit: SHUnit) => { setDeleteUnitId(unit.id); setShowDeleteDialog(true); }}
        exportFileName="sh_units"
        addButton={
          <Button 
            onClick={() => setShowModal(true)} 
            style={{ backgroundColor: '#16a34a', color: '#fff' }} 
            className="font-bold shadow-md shadow-green-100 rounded-xl px-4 py-2 flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Unit
          </Button>
        }
      />

      {showModal && (
        <ModalLayout
          title={selectedUnit ? 'Edit SH Unit' : 'Add New SH Unit'}
          icon={<Building2 className="w-5 h-5 text-green-600" />}
          maxWidth="480px"
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Unit Name *</Label>
                <Select
                  value={formData.name}
                  onValueChange={(value) => setFormData({ ...formData, name: value })}
                  disabled={!!selectedUnit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SH-A">SH-A</SelectItem>
                    <SelectItem value="SH-B">SH-B</SelectItem>
                    <SelectItem value="SH-C">SH-C</SelectItem>
                    <SelectItem value="SH-D">SH-D</SelectItem>
                    <SelectItem value="SH-E">SH-E</SelectItem>
                    <SelectItem value="SH-F">SH-F</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 10000"
                  min={0}
                />
              </div>

              {selectedUnit && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onValueChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}
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
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {selectedUnit ? 'Update Unit' : 'Create Unit'}
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
              Are you sure you want to delete this unit? This action cannot be undone.
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
