import { useState, useEffect } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { Trash2 } from 'lucide-react';
import { OPERATOR_DESIGNATIONS, type OperatorDesignation } from '../constants/operatorDesignations';

const INITIAL_FORM = {
  id: null as number | null,
  firstName: '',
  middleName: '',
  lastName: '',
  designations: [] as OperatorDesignation[],
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
        firstName: initialData.firstName || '',
        middleName: initialData.middleName || '',
        lastName: initialData.lastName || '',
        designations: Array.isArray(initialData.designations) ? initialData.designations : [],
        isActive: initialData.isActive ?? initialData.active ?? true
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [initialData]);

  const toggleDesignation = (value: OperatorDesignation, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      designations: checked
        ? [...prev.designations, value]
        : prev.designations.filter((item) => item !== value)
    }));
  };

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || form.designations.length === 0) {
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || undefined,
      lastName: form.lastName.trim(),
      designations: form.designations,
      ...(form.id ? { id: form.id, isActive: form.isActive } : {})
    };

    onSubmit(payload);
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

        <div className="space-y-2">
          <Label>Designations *</Label>
          <div className="space-y-2 rounded-xl border border-slate-200 p-3">
            {OPERATOR_DESIGNATIONS.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={form.designations.includes(item.value)}
                  onChange={(e) => toggleDesignation(item.value, e.target.checked)}
                />
                {item.label}
              </label>
            ))}
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
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : form.id ? 'Update' : 'Register'}
        </Button>
      </div>
    </div>
  );
}
