import { useState } from 'react';
import { useNotify } from '../../../shared/hooks/useNotify';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { Alert, AlertDescription } from '../../../shared/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { ArrowRight, Info } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import {
  SplitOperatorAssignment,
  validateSplitOperators,
  mapSplitOperatorsToPayload,
} from '../../incubation/operators';
import type { OperatorWorkEntry } from '../../operators/components/OperatorWorkAssignment';

interface PartialMultiplicationFormProps {
  record: any;
  mediaCodes: string[];
  operators: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function nextStageLabel(currentStage?: string) {
  const n = parseInt(String(currentStage || '').split('-')[1] || '0', 10);
  return `Stage-${n + 1}`;
}

export function PartialMultiplicationForm({
  record,
  mediaCodes,
  operators,
  onSubmit,
  onCancel,
}: PartialMultiplicationFormProps) {
  const notify = useNotify();
  const [bottlesInherited, setBottlesInherited] = useState('');
  const [mediaCode, setMediaCode] = useState('');
  const [notes, setNotes] = useState('');
  const [operatorEntries, setOperatorEntries] = useState<OperatorWorkEntry[]>([]);

  const availableBottles = record.qtyAvailable ?? record.qtyIn ?? 0;
  const targetStage = nextStageLabel(record.stage);
  const inherited = parseInt(bottlesInherited, 10) || 0;
  const totalInput = operatorEntries.reduce((sum, entry) => sum + (entry.qtyIn || 0), 0);
  const totalOutput = operatorEntries.reduce((sum, entry) => sum + (entry.qtyOut || 0), 0);
  const targetInput = inherited > 0 ? inherited : availableBottles;

  const handleSubmit = () => {
    const bottlesTaken = inherited > 0 ? inherited : totalInput;
    if (!bottlesTaken || bottlesTaken <= 0) {
      notify.error('Enter bottles taken from parent or assign operator input bottles');
      return;
    }
    if (bottlesTaken > availableBottles) {
      notify.error(`Cannot take more than ${availableBottles} bottles`);
      return;
    }
    if (inherited > 0 && totalInput > 0 && inherited !== totalInput) {
      notify.error(`Operator input (${totalInput}) must match bottles taken from parent (${inherited})`);
      return;
    }
    if (!mediaCode) {
      notify.error('Please select a media code');
      return;
    }

    const operatorError = validateSplitOperators(operatorEntries, bottlesTaken, totalOutput);
    if (operatorError) {
      notify.error(operatorError);
      return;
    }

    onSubmit({
      batchCode: record.batchCode,
      sourceRecordId: record.id,
      bottlesInherited: bottlesTaken,
      newBottlesCount: totalOutput,
      mediaCode,
      notes,
      operators: mapSplitOperatorsToPayload(operatorEntries, bottlesTaken),
    });
  };

  return (
    <ModalLayout title="Partial Multiplication">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            A new batch will be created with code: <strong>{record.batchCode}-M(n)</strong>
            — child moves to <strong>{targetStage}</strong> (same as full multiplication from {record.stage}).
          </AlertDescription>
        </Alert>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center mb-3">
            <div className="text-base text-gray-600">Parent Batch</div>
            <div className="font-semibold text-blue-800 text-xl">{record.batchCode}</div>
            <div className="text-base text-gray-600 mt-1">{record.plantName}</div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="text-base text-gray-600">Current Stage</div>
              <div className="font-semibold text-blue-800">{record.stage}</div>
            </div>
            <ArrowRight className="w-6 h-6 text-blue-600" />
            <div className="text-center">
              <div className="text-base text-gray-600">Child After Multiplication</div>
              <div className="font-semibold text-green-800">{targetStage}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">
            Multiplication Details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Media Code *</Label>
              <Select value={mediaCode || undefined} onValueChange={setMediaCode}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      mediaCodes.length > 0 ? 'Select media code' : 'No media codes available'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {mediaCodes.map((code) => (
                    <SelectItem key={code} value={code}>{code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current Quantity (Available)</Label>
              <Input type="number" value={availableBottles} readOnly className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label>Bottles Taken From Parent *</Label>
              <Input
                type="number"
                min="1"
                max={availableBottles}
                value={bottlesInherited}
                onChange={(e) => setBottlesInherited(e.target.value)}
                placeholder={`Max ${availableBottles}`}
              />
            </div>
            <div className="space-y-2">
              <Label>New Quantity</Label>
              <Input
                type="number"
                value={totalOutput > 0 ? totalOutput : ''}
                readOnly
                className="bg-gray-100"
                placeholder="From operator output"
              />
            </div>
          </div>
        </div>

        <SplitOperatorAssignment
          operators={operators}
          entries={operatorEntries}
          onChange={setOperatorEntries}
          alwaysShowInput
          bottlesIn={targetInput}
          bottlesOut={totalOutput}
        />

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">
            Additional Information
          </p>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
      </div>

      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
            Create Partial Multiplication
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
