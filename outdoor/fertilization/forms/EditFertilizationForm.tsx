import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { Trash2 } from 'lucide-react';

type FormValues = {
  applicationDate: string;
  batchCode: string;
  fertilizerName: string;
  quantity: string;
  notes: string;
};

interface EditFertilizationFormProps {
  initialData?: any;
  batches: any[];
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

export function EditFertilizationForm({ initialData, batches, onSubmit, onDelete, onCancel }: EditFertilizationFormProps) {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      applicationDate: new Date().toISOString().split('T')[0],
      batchCode: '',
      fertilizerName: '',
      quantity: '',
      notes: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        applicationDate: initialData.applicationDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        batchCode: initialData.batchCode || '',
        fertilizerName: initialData.fertilizerName || '',
        quantity: initialData.quantity || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data: FormValues) => {
    onSubmit({
      ...(initialData?.id && { id: initialData.id }),
      ...data
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Fertilization Details</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Application Date *</Label>
            <Controller
              name="applicationDate"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input type="date" {...field} />}
            />
          </div>
          <div className="space-y-2">
            <Label>Batch Code *</Label>
            <Controller
              name="batchCode"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                  <SelectContent>
                    {batches.map((batch: any) => (
                      <SelectItem key={batch.batchCode} value={batch.batchCode}>
                        {batch.batchCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fertilizer Name *</Label>
            <Controller
              name="fertilizerName"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input {...field} placeholder="Enter fertilizer name" />}
            />
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => <Input type="number" {...field} placeholder="Enter quantity" step="0.1" />}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => <Textarea {...field} rows={2} placeholder="Enter any notes" />}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        {initialData && onDelete && (
          <Button type="button" variant="destructive" onClick={() => onDelete(initialData.id)}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        )}
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}