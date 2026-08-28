import React, { useState } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { ModalLayout } from '../../../shared/components/ModalLayout';

interface SampleFormProps {
  batch: { batch_code: string; current_phase: string; current_tunnel: string };
  onClose: () => void;
  onSubmit: (data: { sampleDate: string; sampleNotes: string }) => void;
}

export const SampleForm: React.FC<SampleFormProps> = ({ batch, onClose, onSubmit }) => {
  const [sampleDate, setSampleDate] = useState(new Date().toISOString().split('T')[0]);
  const [sampleNotes, setSampleNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({ sampleDate, sampleNotes });
  };

  return (
    <ModalLayout title="Submit Sample">
      <div className="px-6 py-4 max-w-lg mx-auto">
        <div className="space-y-4">
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
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Sample Details</p>
            <div className="space-y-2">
              <div className="space-y-2">
                <Label className="text-base">Sample Date *</Label>
                <Input 
                  type="date" 
                  value={sampleDate} 
                  onChange={(e) => setSampleDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Notes</Label>
                <Textarea 
                  value={sampleNotes} 
                  onChange={(e) => setSampleNotes(e.target.value)}
                  rows={3}
                  placeholder="Enter any notes"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Submit Sample
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
};
