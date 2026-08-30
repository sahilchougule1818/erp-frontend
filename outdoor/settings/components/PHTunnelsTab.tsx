import { PHTunnelsTable } from './PHTunnelsTable';
import { useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Plus, Edit2, Home } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { usePHTunnels, Tunnel } from '../hooks/usePHTunnels';

export function PHTunnelsTab() {
  const { tunnels, createTunnel, updateTunnel } = usePHTunnels();
  const [showModal, setShowModal] = useState(false);
  const [selectedTunnel, setSelectedTunnel] = useState<Tunnel | null>(null);
  const [formData, setFormData] = useState({ name: '', capacity: 0 });

  const handleEdit = (tunnel: Tunnel) => {
    setSelectedTunnel(tunnel);
    setFormData({ name: tunnel.name, capacity: tunnel.capacity || 0 });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Tunnel name is required');
      return;
    }

    try {
      if (selectedTunnel) {
        await updateTunnel(selectedTunnel.id, { name: formData.name, capacity: formData.capacity });
      } else {
        await createTunnel({ name: formData.name, capacity: formData.capacity });
      }
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save tunnel');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTunnel(null);
    setFormData({ name: '', capacity: 0 });
  };

  return (
    <>
      <PHTunnelsTable
        title="PH Tunnels"
        records={tunnels.filter(t => /^[A-E]\d+$/.test(t.name))}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Tunnel Name' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'currentOccupancy', label: 'Current Occupancy' },
          { key: 'isActive', label: 'State', render: (val: boolean) => val ? 'Active' : 'Inactive' },
          { key: 'createdAt', label: 'Created', render: (val: string) => new Date(val).toLocaleDateString() }
        ]}
        onEdit={handleEdit}
        exportFileName="ph_tunnels"
        addButton={
          <Button 
            onClick={() => setShowModal(true)} 
            style={{ backgroundColor: '#16a34a', color: '#fff' }} 
            className="font-bold shadow-md shadow-green-100 rounded-xl px-4 py-2 flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Tunnel
          </Button>
        }
      />

      {showModal && (
        <ModalLayout
          title={selectedTunnel ? 'Edit PH Tunnel' : 'Add New PH Tunnel'}
          icon={<Home className="w-5 h-5 text-green-600" />}
          maxWidth="480px"
          onClose={closeModal}
        >
          <div className="px-6 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tunnel Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., A1, B2, C3"
                  required
                  disabled={!!selectedTunnel}
                />
              </div>

              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 5000"
                  min={0}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedTunnel ? 'Update Tunnel' : 'Create Tunnel'}
                </Button>
              </div>
            </form>
          </div>
        </ModalLayout>
      )}
    </>
  );
}
