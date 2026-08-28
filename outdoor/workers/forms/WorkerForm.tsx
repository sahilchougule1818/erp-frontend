import { useState, useEffect } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { Trash2 } from 'lucide-react';

const INITIAL_FORM = {
  id: null as number | null,
  firstName: '',
  middleName: '',
  lastName: '',
  isActive: true
};

interface WorkerFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

export function WorkerForm({ initialData, onSubmit, onDelete, onCancel }: WorkerFormProps) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        firstName: initialData.first_name,
        middleName: initialData.middle_name || '',
        lastName: initialData.last_name,
        isActive: initialData.is_active
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      // TODO: Add toast notification
      return;  // Please enter both first name and last name
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>First Name *</Label>
          <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" />
        </div>
        <div>
          <Label>Middle Name</Label>
          <Input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} placeholder="Middle name" />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        {form.id && onDelete && (
          <Button variant="destructive" onClick={() => onDelete(form.id!)}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        )}
        <Button style={{ backgroundColor: '#16a34a', color: '#fff' }} className="hover:opacity-90" onClick={handleSubmit}>
          {form.id ? 'Update' : 'Register'}
        </Button>
      </div>
    </div>
  );
}
