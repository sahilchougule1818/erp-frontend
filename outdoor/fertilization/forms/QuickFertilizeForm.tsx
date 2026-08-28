import { useForm, Controller } from 'react-hook-form';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { WorkerSelector } from '../../workers/components/WorkerSelector';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Batch {
  batch_code: string;
  current_phase: string;
  current_tunnel: string;
}

type FormValues = {
  fertilizerName: string;
  quantity: number;
  selectedWorkers: number[];
};

interface QuickFertilizeFormProps {
  open: boolean;
  batch: Batch;
  workers: any[];
  onSubmit: (data: FormValues) => void;
  onClose: () => void;
}

export function QuickFertilizeForm({ open, batch, workers, onSubmit, onClose }: QuickFertilizeFormProps) {
  const notify = useNotify();
  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      fertilizerName: '',
      quantity: 0,
      selectedWorkers: []
    }
  });

  const selectedWorkers = watch('selectedWorkers');

  const onSubmitForm = (data: FormValues) => {
    if (!data.fertilizerName.trim()) {
      notify.error('Please enter fertilizer name');
      return;
    }
    if (data.selectedWorkers.length === 0) {
      notify.error('Please select at least one worker');
      return;
    }
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <DialogHeader className="pb-4 border-b">
            <DialogTitle>Record Fertilization</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Batch Information</p>
              <div className="bg-gray-50 p-3 rounded-md space-y-1">
                <p className="text-base text-gray-600">
                  Batch Code: <span className="font-semibold text-gray-900">{batch.batch_code}</span>
                </p>
                <p className="text-base text-gray-600">
                  Phase: <span className="font-semibold text-gray-900">{batch.current_phase}</span>
                </p>
                <p className="text-base text-gray-600">
                  Tunnel: <span className="font-semibold text-gray-900">{batch.current_tunnel}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Fertilization Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fertilizer Name *</Label>
                  <Controller
                    name="fertilizerName"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input {...field} placeholder="Enter fertilizer name" />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min="0"
                        step="0.1"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Worker Assignment</p>
              <WorkerSelector 
                workers={workers} 
                selectedIds={selectedWorkers} 
                onChange={(ids) => setValue('selectedWorkers', ids)} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">Record</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}