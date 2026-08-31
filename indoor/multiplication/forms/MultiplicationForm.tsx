import { useState, useEffect } from 'react';
import { useNotify } from '../../../shared/hooks/useNotify';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { Trash2, ArrowRight } from 'lucide-react';
import {
  SplitOperatorAssignment,
  validateSplitOperators,
  mapSplitOperatorsToPayload,
} from '../../incubation/operators';
import type { OperatorWorkEntry } from '../../operators/components/OperatorWorkAssignment';
import { ModalLayout } from '../../../shared/components/ModalLayout';

type MultiplicationFormVariant = 'multiplication' | 'fullRooting';

interface MultiplicationFormProps {
  initialData: any;
  selectedBatch: any;
  operators: any[];
  mediaCodes?: string[];
  variant?: MultiplicationFormVariant;
  sourceRecordId?: number;
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
  operatorEntries: [] as OperatorWorkEntry[],
  notes: ''
};

export function MultiplicationForm({
  initialData,
  selectedBatch,
  operators,
  mediaCodes = [],
  variant = 'multiplication',
  sourceRecordId,
  onSubmit,
  onDelete,
  onCancel,
}: MultiplicationFormProps) {
  const notify = useNotify();
  const isFullRooting = variant === 'fullRooting';
  const allMediaCodes = Array.from(
    new Set([...mediaCodes, initialData?.mediaCode].filter(Boolean))
  );
  const [form, setForm] = useState<any>(emptyForm);
  const isZerothMultiplication = selectedBatch?.phase === 'initialisation';
  const availableBottles = selectedBatch?.qtyAvailable ?? selectedBatch?.qtyIn ?? 0;
  const bottlesIn = isZerothMultiplication ? 0 : availableBottles;

  const getNextStage = (currentStage: string, currentPhase: string) => {
    if (currentPhase === 'initialisation') return 'Stage-0';
    const stageNumber = parseInt(currentStage?.split('-')[1] ?? '0');
    return `Stage-${stageNumber + 1}`;
  };

  const updateForm = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const totalOutput = form.operatorEntries.reduce((sum: number, entry: OperatorWorkEntry) => sum + (entry.qtyOut || 0), 0);

  useEffect(() => {
    setForm({
      ...emptyForm,
      batchCode: selectedBatch?.batchCode || '',
      plantName: selectedBatch?.plantName || '',
      currentQuantity: availableBottles,
      ...initialData
    });
    if (initialData?.operators) {
      const operatorEntries = initialData.operators.map((op: any) => ({
        id: parseInt(op.operatorId ?? op.id),
        shortName: op.shortName,
        firstName: op.firstName,
        lastName: op.lastName,
        qtyIn: op.qtyIn ?? 0,
        qtyOut: op.qtyOut ?? 0,
      }));
      setForm((prev: any) => ({ ...prev, operatorEntries }));
    }
  }, [initialData, selectedBatch, availableBottles]);

  useEffect(() => {
    if (totalOutput > 0) {
      setForm((prev: any) => ({ ...prev, noOfBottles: String(totalOutput) }));
    }
  }, [totalOutput]);

  const handleContaminationChange = (value: string) => {
    const contamination = parseInt(value) || 0;
    setForm({ ...form, contamination: value, remainingBottles: (parseInt(form.noOfBottles) || 0) - contamination });
  };

  const handleSubmit = () => {
    if (!form.mediaCode) {
      notify.error('Please select a media code');
      return;
    }
    const operatorError = validateSplitOperators(
      form.operatorEntries,
      isFullRooting ? availableBottles : bottlesIn,
      totalOutput
    );
    if (operatorError) {
      notify.error(operatorError);
      return;
    }

    if (isFullRooting) {
      onSubmit({
        batchCode: selectedBatch?.batchCode,
        sourceRecordId,
        mediaCode: form.mediaCode,
        newBottlesCount: totalOutput,
        notes: form.notes,
        operators: mapSplitOperatorsToPayload(form.operatorEntries, availableBottles),
      });
      return;
    }

    onSubmit({
      id: form.id,
      batchName: selectedBatch?.batchCode,
      mediaCode: form.mediaCode,
      plantName: selectedBatch?.plantName,
      currentBottles: availableBottles,
      noOfBottles: totalOutput,
      contaminationCount: form.contamination,
      operators: mapSplitOperatorsToPayload(form.operatorEntries, bottlesIn),
      notes: form.notes
    });
  };

  const modalTitle = initialData
    ? 'Edit Multiplication Record'
    : isFullRooting
      ? 'Record Full Rooting'
      : 'Record Multiplication';

  const headerTitle = isFullRooting ? 'Rooting Batch' : 'Multiplication Batch';
  const currentStageLabel = isFullRooting
    ? selectedBatch?.stage
    : selectedBatch?.phase === 'initialisation'
      ? 'Initialisation'
      : selectedBatch?.stage;
  const nextStageLabel = getNextStage(selectedBatch?.stage, selectedBatch?.phase);
  const afterLabel = isFullRooting ? 'After Rooting' : 'After Multiplication';
  const footerNote = isFullRooting
    ? 'Full rooting will move the entire batch to the next stage'
    : 'Multiplication will automatically advance the batch to the next stage';
  const detailsHeading = isFullRooting ? 'Rooting Details' : 'Multiplication Details';
  const submitLabel = isFullRooting ? 'Move to Rooting' : 'Save';

  return (
    <ModalLayout title={modalTitle}>
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center mb-3">
            <div className="text-base text-gray-600">{headerTitle}</div>
            <div className="font-semibold text-blue-800 text-xl">{selectedBatch?.batchCode}</div>
            <div className="text-base text-gray-600 mt-1">{selectedBatch?.plantName}</div>
          </div>
          {selectedBatch && (
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-base text-gray-600">Current Stage</div>
                <div className="font-semibold text-blue-800">{currentStageLabel}</div>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-600" />
              <div className="text-center">
                <div className="text-base text-gray-600">{afterLabel}</div>
                <div className="font-semibold text-green-800">{nextStageLabel}</div>
              </div>
            </div>
          )}
          <div className="text-center mt-2 text-base text-gray-600">
            {footerNote}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">{detailsHeading}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Media Code *</Label>
              <Select
                value={form.mediaCode || undefined}
                onValueChange={(v) => updateForm('mediaCode', v)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      allMediaCodes.length > 0
                        ? 'Select media code'
                        : 'No media codes available'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {allMediaCodes.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isZerothMultiplication && (
              <div className="space-y-2">
                <Label>Current Quantity (Available)</Label>
                <Input type="number" value={availableBottles} readOnly className="bg-gray-100" />
              </div>
            )}
            <div className="space-y-2">
              <Label>New Quantity</Label>
              <Input type="number" value={form.noOfBottles} readOnly className="bg-gray-100" />
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

        <SplitOperatorAssignment
          operators={operators}
          entries={form.operatorEntries}
          onChange={(entries) => updateForm('operatorEntries', entries)}
          bottlesIn={isFullRooting ? availableBottles : bottlesIn}
          bottlesOut={totalOutput}
        />

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
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
