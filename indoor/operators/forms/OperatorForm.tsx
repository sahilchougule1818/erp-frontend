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

interface OperatorFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function OperatorForm({ initialData, onSubmit, onDelete, onCancel, isSubmitting = false }: OperatorFormProps) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        firstName: initialData.first_name || initialData.firstName || '',
        middleName: initialData.middle_name || initialData.middleName || '',
        lastName: initialData.last_name || initialData.lastName || '',
        isActive: initialData.is_active ?? initialData.isActive ?? true
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-3">
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
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        {form.id && onDelete && (
          <Button variant="destructive" onClick={() => onDelete(form.id!)}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        )}
        <Button style={{ backgroundColor: '#4f46e5', color: '#fff' }} className="hover:opacity-90" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : form.id ? 'Update' : 'Register'}
        </Button>
      </div>
    </div>
  );
};
