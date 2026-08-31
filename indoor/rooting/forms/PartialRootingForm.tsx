import { useState } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { Alert, AlertDescription } from '../../../shared/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Info } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import {
  SplitOperatorAssignment,
  validateSplitOperators,
  validateRootingOperators,
  mapSplitOperatorsToPayload,
} from '../../incubation/operators';
import type { OperatorWorkEntry } from '../../operators/components/OperatorWorkAssignment';

function nextStageLabel(currentStage?: string) {
  const n = parseInt(String(currentStage || '').split('-')[1] || '0', 10);
  return `Stage-${n + 1}`;
}

interface PartialRootingFormProps {
  record: any;
  mediaCodes: string[];
  operators: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PartialRootingForm({
  record,
  mediaCodes,
  operators,
  onSubmit,
  onCancel,
}: PartialRootingFormProps) {
  const [bottlesToRoot, setBottlesToRoot] = useState('');
  const [mediaCode, setMediaCode] = useState('');
  const [notes, setNotes] = useState('');
  const [operatorEntries, setOperatorEntries] = useState<OperatorWorkEntry[]>([]);

  const availableBottles = record.qtyAvailable ?? record.qtyIn ?? record.remainingBottles ?? 0;
  const bottles = parseInt(bottlesToRoot, 10) || 0;

  const handleSubmit = () => {
    if (!bottles || bottles <= 0) {
      alert('Please enter a valid number of bottles');
      return;
    }
    if (bottles > availableBottles) {
      alert(`Cannot root more than ${availableBottles} bottles`);
      return;
    }
    if (!mediaCode) {
      alert('Please select a media code');
      return;
    }

    const operatorError = validateRootingOperators(operatorEntries, bottles);
    if (operatorError) {
      alert(operatorError);
      return;
    }

    onSubmit({
      batchCode: record.batchCode,
      sourceRecordId: record.id,
      bottlesCount: bottles,
      mediaCode,
      notes,
      operators: mapSplitOperatorsToPayload(operatorEntries, bottles),
    });
  };

  return (
    <ModalLayout title="Make Partial Rooting">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            A new batch will be created with code: <strong>{record.batchCode}-R(n)</strong>
            <br />
            The new batch enters <strong>{nextStageLabel(record.stage)}</strong> rooting
            (same numeric stage as multiplication from {record.stage || record.toStage}).
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Original Batch</div>
              <div className="font-semibold text-lg">{record.batchCode}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Plant Name</div>
              <div className="font-semibold text-lg">{record.plantName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Incubation Stage</div>
              <div className="font-semibold">{record.stage || record.toStage}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Rooting Stage</div>
              <div className="font-semibold text-orange-700">{nextStageLabel(record.stage || record.toStage)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Available Bottles</div>
              <div className="font-semibold text-green-600">{availableBottles}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Media Code *</Label>
            <Select value={mediaCode} onValueChange={setMediaCode}>
              <SelectTrigger>
                <SelectValue placeholder="Select media code" />
              </SelectTrigger>
              <SelectContent>
                {mediaCodes.map((code) => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bottles to Root *</Label>
            <Input
              type="number"
              min="1"
              max={availableBottles}
              value={bottlesToRoot}
              onChange={(e) => setBottlesToRoot(e.target.value)}
              placeholder={`Max: ${availableBottles}`}
            />
            <p className="text-xs text-gray-500">
              Remaining in original batch: {availableBottles - bottles}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this rooting operation"
              rows={3}
            />
          </div>
        </div>

        {bottles > 0 && (
          <SplitOperatorAssignment
            operators={operators}
            entries={operatorEntries}
            onChange={setOperatorEntries}
            bottlesIn={bottles}
            bottlesOut={bottles}
          />
        )}
      </div>

      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSubmit}>
            Create Partial Rooting
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
