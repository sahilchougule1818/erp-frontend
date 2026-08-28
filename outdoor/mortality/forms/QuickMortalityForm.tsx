import React, { useState } from 'react';
import { useNotify } from '../shared/hooks/useNotify';
import { Label } from '../../../shared/ui/label';
import { useNotify } from '../shared/hooks/useNotify';
import { Input } from '../../../shared/ui/input';
import { useNotify } from '../shared/hooks/useNotify';
import { Button } from '../../../shared/ui/button';
import { useNotify } from '../shared/hooks/useNotify';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { useNotify } from '../shared/hooks/useNotify';

interface QuickMortalityFormProps {
  batch: { batch_code: string; total_mortality: number };
  onClose: () => void;
  onSubmit: (count: number) => void;
}

export const QuickMortalityForm: React.FC<QuickMortalityFormProps> = ({ batch, onClose, onSubmit }) => {
  const [count, setCount] = useState(batch.total_mortality || 0);

  const handleSubmit = () => {
    if (count < 0) {
      notify.error('Mortality count cannot be negative');
      return;
    }
    onSubmit(count);
  };

  return (
    <ModalLayout title="Record Mortality">
      <div className="space-y-3 py-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Batch Information</p>
          <div className="bg-gray-50 p-2 rounded-md">
            <p className="text-base text-gray-600">
              Batch Code: <span className="font-semibold text-gray-900">{batch.batch_code}</span>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Mortality Details</p>
          <div className="space-y-1">
            <Label className="text-base">Mortality Count *</Label>
            <Input 
              type="number" 
              autoFocus
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min="0"
              className="h-9 text-base font-medium"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
          Save Changes
        </Button>
      </div>
    </ModalLayout>
  );
};