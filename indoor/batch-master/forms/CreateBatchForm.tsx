import { useState, useEffect } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { indoorApi } from '../../services/indoorApi';
import { useAuth } from '../../../auth/AuthContext';
import { usePlantMaster } from '../../settings/hooks/usePlantMaster';

interface CreateBatchFormProps {
  mediaCodes?: string[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function CreateBatchForm({ mediaCodes = [], onSubmit, onCancel }: CreateBatchFormProps) {
  const { user } = useAuth();
  const isLocked = user?.role === 'IndoorManager';
  const { plants } = usePlantMaster();

  const [form, setForm] = useState({
    batchCode: '',
    plantId: '',
    labNumber: ''
  });

  // Sync locked lab once user is available
  useEffect(() => {
    if (isLocked && user?.labNumber) {
      setForm(prev => ({ ...prev, labNumber: user.labNumber!.toString() }));
    }
  }, [user, isLocked]);

  const [labs, setLabs] = useState<any[]>([]);

  useEffect(() => {
    if (!isLocked) fetchLabs();
  }, [isLocked]);

  const fetchLabs = async () => {
    try {
      const data = await indoorApi.labs.getLabs();
      const activeLabs = data.filter((lab: any) => lab.is_active);
      setLabs(activeLabs);
      if (activeLabs.length === 1) {
        setForm(prev => ({ ...prev, labNumber: activeLabs[0].lab_number.toString() }));
      }
    } catch (error) {
      console.error('Failed to fetch labs:', error);
    }
  };

  const handleSubmit = () => {
    if (!form.batchCode || !form.plantId || !form.labNumber) {
      alert('Please fill all required fields including lab selection');
      return;
    }
    onSubmit({
      batchCode: form.batchCode,
      plantId: parseInt(form.plantId),
      labNumber: parseInt(form.labNumber)
    });
  };

  return (
    <div className="px-6 py-4 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Batch Code *</Label>
          <Input
            value={form.batchCode}
            onChange={(e) => setForm({...form, batchCode: e.target.value})}
            placeholder="Enter batch code"
          />
        </div>
        <div className="space-y-2">
          <Label>Plant Name *</Label>
          <Select value={form.plantId} onValueChange={(value) => setForm({...form, plantId: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select plant" />
            </SelectTrigger>
            <SelectContent>
              {plants.filter(p => p.is_active).map((plant) => (
                <SelectItem key={plant.id} value={plant.id.toString()}>
                  {plant.plant_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Lab *</Label>
          {isLocked ? (
            <Input value={`Lab ${form.labNumber}`} disabled />
          ) : (
            <Select value={form.labNumber} onValueChange={(value) => setForm({...form, labNumber: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select lab" />
              </SelectTrigger>
              <SelectContent>
                {labs.map((lab) => (
                  <SelectItem key={lab.lab_number} value={lab.lab_number.toString()}>
                    Lab {lab.lab_number} - {lab.lab_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Create Batch</Button>
      </div>
    </div>
  );
}