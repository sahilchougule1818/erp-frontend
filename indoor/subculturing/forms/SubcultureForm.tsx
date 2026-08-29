import { useState, useEffect } from 'react';
import { useNotify } from '../../../shared/hooks/useNotify';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { Trash2, ArrowRight } from 'lucide-react';
import { OperatorSelector } from '../../operators/components/OperatorSelector';
import { ModalLayout } from '../../../shared/components/ModalLayout';

interface SubcultureFormProps {
  initialData: any;
  selectedBatch: any;
  operators: any[];
  records: any[];
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

const emptyForm = {
  batchCode: '',
  mediaCode: '',
  plantName: '',
  currentQuantity: '',
  noOfBottles: '',
  contamination: '0',
  remainingBottles: '',
  operatorIds: [],
  notes: ''
};

export function SubcultureForm({ initialData, selectedBatch, operators, records, onSubmit, onDelete, onCancel }: SubcultureFormProps) {
  const notify = useNotify();
  const allMediaCodes = Array.from(new Set([...records.map((r: any) => r.mediaCode), initialData?.mediaCode].filter(Boolean)));
  const [form, setForm] = useState<any>(emptyForm);
  
  const getNextStage = (currentStage: string, currentPhase: string) => {
    if (currentPhase === 'initialisation') return 'Stage-0';
    const stageNumber = parseInt(currentStage?.split('-')[1] ?? '0');
    return `Stage-${stageNumber + 1}`;
  };
  
  const updateForm = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  useEffect(() => {
    setForm({
      ...emptyForm,
      batchCode: selectedBatch?.batchCode || '',
      plantName: selectedBatch?.plantName || '',
      currentQuantity: selectedBatch?.qtyAvailable ?? selectedBatch?.qtyIn ?? '',
      ...initialData
    });
    const record = initialData?.id
      ? records.find((r: any) => r.id === initialData.id) ?? initialData
      : null;
    if (record?.operators) {
      const operatorIds = record.operators.map((op: any) => parseInt(op.operatorId ?? op.operator_id));
      setForm((prev: any) => ({ ...prev, operatorIds }));
    }
  }, [initialData, selectedBatch, records]);

  const handleContaminationChange = (value: string) => {
    const contamination = parseInt(value) || 0;
    setForm({ ...form, contamination: value, remainingBottles: (parseInt(form.noOfBottles) || 0) - contamination });
  };

  const handleSubmit = () => {
    if (!form.mediaCode) {
      notify.error('Please select a media code');
      return;
    }
    if (!form.noOfBottles || parseInt(form.noOfBottles) <= 0) {
      notify.error('Please enter a valid new quantity (must be greater than 0)');
      return;
    }
    if (!form.operatorIds || form.operatorIds.length === 0) {
      notify.error('Please select at least one operator');
      return;
    }
    
    onSubmit({
      id: form.id,
      batchName: selectedBatch?.batchCode,
      mediaCode: form.mediaCode,
      plantName: selectedBatch?.plantName,
      currentBottles: selectedBatch?.qtyAvailable ?? selectedBatch?.qtyIn,
      noOfBottles: form.noOfBottles,
      contaminationCount: form.contamination,
      operatorIds: form.operatorIds,
      notes: form.notes
    });
  };

  return (
    <ModalLayout title={initialData ? 'Edit Subculture Record' : 'Record Subculture'}>
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center mb-3">
            <div className="text-base text-gray-600">Subculturing Batch</div>
            <div className="font-semibold text-blue-800 text-xl">{selectedBatch?.batchCode}</div>
            <div className="text-base text-gray-600 mt-1">{selectedBatch?.plantName}</div>
          </div>
          {selectedBatch && (
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-base text-gray-600">Current Stage</div>
                <div className="font-semibold text-blue-800">
                  {selectedBatch.phase === 'initialisation' ? 'Initialisation' : selectedBatch.stage}
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-600" />
              <div className="text-center">
                <div className="text-base text-gray-600">After Subculture</div>
                <div className="font-semibold text-green-800">{getNextStage(selectedBatch.stage, selectedBatch.phase)}</div>
              </div>
            </div>
          )}
          <div className="text-center mt-2 text-base text-gray-600">
            Subculturing will automatically advance the batch to the next stage
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Subculture Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Media Code *</Label>
              <Select value={form.mediaCode} onValueChange={(v) => updateForm('mediaCode', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allMediaCodes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedBatch?.phase !== 'initialisation' && (
              <div className="space-y-2">
                <Label>Current Quantity (Available)</Label>
                <Input type="number" value={selectedBatch?.qtyAvailable ?? selectedBatch?.qtyIn ?? ''} readOnly className="bg-gray-100" />
              </div>
            )}
            <div className="space-y-2">
              <Label>New Quantity *</Label>
              <Input type="number" value={form.noOfBottles} onChange={(e) => updateForm('noOfBottles', e.target.value)} />
            </div>
            {initialData && (
              <>
                <div className="space-y-2">
                  <Label>Contamination Count</Label>
                  <Input type="number" value={form.contamination} onChange={(e) => handleContaminationChange(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Remaining Bottles (After Contamination)</Label>
                  <Input type="number" value={form.remainingBottles} readOnly className="bg-gray-100" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Operator Assignment</p>
          <OperatorSelector operators={operators} selectedIds={form.operatorIds} onChange={(ids) => updateForm('operatorIds', ids)} />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Additional Information</p>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} />
          </div>
        </div>
      </div>
      
      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
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
    </ModalLayout>
  );
}
