import { PlantMasterTable } from './PlantMasterTable';
import { useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Plus, Edit2, Trash2, Leaf } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/alert-dialog';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { usePlantMaster, Plant } from '../hooks/usePlantMaster';

export function PlantMasterTab() {
  const { plants, createPlant, updatePlant, deletePlant } = usePlantMaster();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [deletePlantId, setDeletePlantId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ plantName: '', active: true });

  const handleEdit = (plant: Plant) => {
    setSelectedPlant(plant);
    setFormData({ plantName: plant.plantName, active: plant.active });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletePlantId) return;
    try {
      await deletePlant(deletePlantId);
      setShowDeleteDialog(false);
      setDeletePlantId(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete plant');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plantName.trim()) {
      alert('Plant name is required');
      return;
    }

    try {
      if (selectedPlant) {
        await updatePlant(selectedPlant.id, formData);
      } else {
        await createPlant({ plantName: formData.plantName.trim() });
      }
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save plant');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlant(null);
    setFormData({ plantName: '', active: true });
  };

  return (
    <>
      <PlantMasterTable
        title="Plant Master"
        records={plants}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'plantName', label: 'Plant Name' },
          { key: 'active', label: 'State', render: (val: boolean) => val ? 'Active' : 'Inactive' },
          { key: 'createdAt', label: 'Created', render: (val: string) => new Date(val).toLocaleDateString() }
        ]}
        onEdit={handleEdit}
        onDelete={(plant: Plant) => { setDeletePlantId(plant.id); setShowDeleteDialog(true); }}
        exportFileName="plant_master"
        addButton={
          <Button 
            onClick={() => setShowModal(true)} 
            className="font-bold rounded-xl px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Plant
          </Button>
        }
      />

      {showModal && (
        <ModalLayout
          title={selectedPlant ? 'Edit Plant' : 'Add New Plant'}
          icon={<Leaf className="w-5 h-5 text-indigo-600" />}
          maxWidth="480px"
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Plant Name *</Label>
                <Input
                  value={formData.plantName}
                  onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
                  placeholder="e.g., Banana, Teak, Mango"
                  required
                />
              </div>

              {selectedPlant && (
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
                  {selectedPlant ? 'Update Plant' : 'Create Plant'}
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
              Are you sure you want to delete this plant? This action cannot be undone.
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
