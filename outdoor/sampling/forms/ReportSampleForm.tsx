import React, { useState } from 'react';
import { useNotify } from '../../../shared/hooks/useNotify';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { ModalLayout } from '../../../shared/components/ModalLayout';

interface ReportSampleFormProps {
  batch: { batch_code: string };
  onClose: () => void;
  onSubmit: (data: { resultDate: string; status: string; seedCertificateNumber: string; notes: string }) => void;
}

export const ReportSampleForm: React.FC<ReportSampleFormProps> = ({ batch, onClose, onSubmit }) => {
  const notify = useNotify();
  const [resultDate, setResultDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('');
  const [seedCertificateNumber, setSeedCertificateNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!status) {
      notify.error('Please select a status');
      return;
    }
    if (status === 'Yes' && !seedCertificateNumber) {
      notify.error('Seed Certificate Number is required when status is Yes');
      return;
    }
    onSubmit({ resultDate, status, seedCertificateNumber, notes });
  };

  return (
    <ModalLayout title="Report Sample Result">
      <div className="px-6 py-4 max-w-lg mx-auto">
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Batch Information</p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-base text-gray-600">
                Batch Code: <span className="font-semibold text-gray-900">{batch.batch_code}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Result Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base">Result Date *</Label>
                <Input 
                  type="date" 
                  value={resultDate} 
                  onChange={(e) => setResultDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Certificate Information</p>
            <div className="space-y-2">
              <Label className="text-base">Seed Certificate Number {status === 'Yes' && '*'}</Label>
              <Input 
                value={seedCertificateNumber} 
                onChange={(e) => setSeedCertificateNumber(e.target.value)}
                disabled={status !== 'Yes'}
                placeholder="Enter seed certificate number"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Additional Information</p>
            <div className="space-y-2">
              <Label className="text-base">Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Enter result notes"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Submit Result
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
};
