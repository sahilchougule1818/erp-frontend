import { useState, useEffect } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Button } from '../../../shared/ui/button';
import { Trash2 } from 'lucide-react';

interface CleaningRecordFormProps {
  initialData: any;
  operators: any[];
  type: 'cleaning' | 'deep';
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

export function CleaningRecordForm({ initialData, operators, type, onSubmit, onDelete, onCancel }: CleaningRecordFormProps) {
  const [form, setForm] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    operatorId: '',
    areaCleaned: '',
    instrumentCleaned: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        date: initialData.date?.split('T')[0] || '',
        operatorId: initialData.operator_id?.toString() || '',
        areaCleaned: initialData.area_cleaned || '',
        instrumentCleaned: initialData.instrument_cleaned || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit({
      ...form,
      operatorId: form.operatorId ? parseInt(form.operatorId) : null
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Operator</Label>
          <Select value={form.operatorId} onValueChange={(v: string) => setForm({...form, operatorId: v})}>
            <SelectTrigger><SelectValue placeholder="Select operator" /></SelectTrigger>
            <SelectContent>
              {operators.map((op: any) => (
                <SelectItem key={op.id} value={op.id.toString()}>{op.short_name} ({op.first_name} {op.last_name})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-2 space-y-2">
          <Label>{type === 'cleaning' ? 'Area Cleaned' : 'Instrument Cleaned'}</Label>
          <Input 
            placeholder={type === 'cleaning' ? "e.g., Transfer Room" : "e.g., Autoclave A"}
            value={type === 'cleaning' ? form.areaCleaned : form.instrumentCleaned} 
            onChange={(e) => setForm({...form, [type === 'cleaning' ? 'areaCleaned' : 'instrumentCleaned']: e.target.value})} 
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Notes</Label>
          <Textarea 
            placeholder="Additional details..."
            value={form.notes} 
            onChange={(e) => setForm({...form, notes: e.target.value})} 
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        {initialData && onDelete && (
          <Button variant="destructive" onClick={() => onDelete(form.id)}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        )}
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
}
