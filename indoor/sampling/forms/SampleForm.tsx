import React, { useState } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';

interface SampleFormProps {
  batch: { batchCode: string; phase: string; plantName: string };
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Sample</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Batch Information</p>
              <div className="bg-gray-50 p-3 rounded-md space-y-1">
                <p className="text-base text-gray-600">
                  Batch Code: <span className="font-semibold text-gray-900">{batch.batchCode}</span>
                </p>
                <p className="text-base text-gray-600">
                  Plant: <span className="font-semibold text-gray-900">{batch.plantName}</span>
                </p>
                <p className="text-base text-gray-600">
                  Phase: <span className="font-semibold text-gray-900">{batch.phase}</span>
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
      </DialogContent>
    </Dialog>
  );
};
