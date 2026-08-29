import { useState, useEffect } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Button } from '../../../shared/ui/button';
import { Trash2, Info } from 'lucide-react';
import { OperatorSelector } from '../../operators/components/OperatorSelector';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { indoorApi } from '../../services/indoorApi';

interface IncubationFormProps {
  initialData: any;
  selectedBatch: any;
  operators: any[];
  isTerminalIncubation?: boolean;
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onCancel: () => void;
}

const emptyForm = {
  batchCode: '',
  plantName: '',
  noOfBottles: '',
  mediaCode: '',
  contamination: '0',
  remainingBottles: '',
  incubationPeriod: '',
  temperature: '',
  humidity: '',
  lightIntensity: '',
  operatorIds: []
};

export function IncubationForm({ initialData, selectedBatch, operators, isTerminalIncubation = false, onSubmit, onDelete, onCancel }: IncubationFormProps) {
  const [form, setForm] = useState<any>(emptyForm);
  const [mediaCodes, setMediaCodes] = useState<string[]>([]);

  const updateForm = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  useEffect(() => {
    setForm({
      ...emptyForm,
      batchCode: selectedBatch?.batchCode || '',
      plantName: selectedBatch?.plantName || '',
      noOfBottles: selectedBatch?.qtyAvailable || selectedBatch?.qtyIn || '',
      mediaCode: selectedBatch?.latestMediaCode || selectedBatch?.mediaCode || '',
      ...initialData
    });
    if (initialData?.operators) {
      const operatorIds = initialData.operators.map((op: any) => parseInt(op.operatorId ?? op.operator_id));
      setForm((prev: any) => ({ ...prev, operatorIds }));
    }
    if (isTerminalIncubation) {
      indoorApi.autoclave.getMediaCodes().then((codes: any) => {
        setMediaCodes(Array.isArray(codes) ? codes : []);
      }).catch(() => {});
    }
  }, [initialData, selectedBatch, isTerminalIncubation]);

  const handleContaminationChange = (value: string) => {
    const contamination = parseInt(value) || 0;
    setForm({ ...form, contamination: value, remainingBottles: (parseInt(form.noOfBottles) || 0) - contamination });
  };

  const handleSubmit = () => onSubmit({
    id: form.id,
    batchName: selectedBatch?.batchCode,
    plantName: selectedBatch?.plantName,
    noOfBottles: selectedBatch?.qty_available || selectedBatch?.current_qty_in || form.noOfBottles,
    mediaCode: form.mediaCode,
    contaminationCount: form.contamination,
    incubationPeriod: form.incubationPeriod,
    temperature: form.temperature,
    humidity: form.humidity,
    lightIntensity: form.lightIntensity,
    operatorIds: form.operatorIds
  });

  const terminalBanner = isTerminalIncubation && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="text-center mb-3">
        <div className="text-base text-gray-600">Moving to Terminal Incubation</div>
        <div className="font-semibold text-blue-800 text-xl">{selectedBatch?.batchCode}</div>
        <div className="text-base text-gray-600 mt-1">{selectedBatch?.plantName}</div>
      </div>
    </div>
  );

  return (
    <ModalLayout title={initialData ? 'Edit Incubation Record' : isTerminalIncubation ? 'Terminal Incubation' : 'Record Incubation'}>
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        {isTerminalIncubation ? terminalBanner : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-center mb-3">
              <div className="text-base text-gray-600">Incubating Batch</div>
              <div className="font-semibold text-amber-800 text-xl">{selectedBatch?.batchCode}</div>
              <div className="text-base text-gray-600 mt-1">{selectedBatch?.plantName}</div>
            </div>
            {selectedBatch && (
              <div className="flex items-center space-x-2 justify-center">
                <Info className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="font-semibold text-amber-800">
                    Incubating at {selectedBatch.stage}
                  </div>
                  <div className="text-base text-amber-700">
                    Incubation keeps the batch in the same stage but changes phase to 'incubation'
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Batch Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plant Name</Label>
              <Input value={selectedBatch?.plantName || ''} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Current Bottles</Label>
              <Input type="number" value={selectedBatch?.qty_available || selectedBatch?.current_qty_in || ''} readOnly className="bg-gray-100" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Media Code</Label>
              {isTerminalIncubation ? (
                <Select value={form.mediaCode} onValueChange={(v) => updateForm('mediaCode', v)}>
                  <SelectTrigger><SelectValue placeholder="Select media code" /></SelectTrigger>
                  <SelectContent>
                    {mediaCodes.map(code => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={form.mediaCode || 'N/A'} readOnly className="bg-gray-100" />
              )}
            </div>
            {initialData && (
              <>
                <div className="space-y-2">
                  <Label>Contamination Count</Label>
                  <Input type="number" value={form.contamination} onChange={(e) => handleContaminationChange(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Remaining Bottles</Label>
                  <Input type="number" value={form.remainingBottles} readOnly className="bg-gray-100" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Incubation Conditions</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Incubation Period (days)</Label>
              <Input type="number" value={form.incubationPeriod} onChange={(e) => updateForm('incubationPeriod', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Temperature</Label>
              <Input value={form.temperature} onChange={(e) => updateForm('temperature', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Humidity</Label>
              <Input value={form.humidity} onChange={(e) => updateForm('humidity', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Light Intensity</Label>
              <Input value={form.lightIntensity} onChange={(e) => updateForm('lightIntensity', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Operator Assignment</p>
          <OperatorSelector operators={operators} selectedIds={form.operatorIds} onChange={(ids) => updateForm('operatorIds', ids)} />
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
