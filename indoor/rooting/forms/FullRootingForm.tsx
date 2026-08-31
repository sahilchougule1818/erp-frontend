import { useState } from 'react';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Button } from '../../../shared/ui/button';
import { Alert, AlertDescription } from '../../../shared/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { AlertTriangle } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import {
  SplitOperatorAssignment,
  validateRootingOperators,
  mapSplitOperatorsToPayload,
} from '../../incubation/operators';
import type { OperatorWorkEntry } from '../../operators/components/OperatorWorkAssignment';

interface FullRootingFormProps {
  record: any;
  mediaCodes: string[];
  operators: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function FullRootingForm({
  record,
  mediaCodes,
  operators,
  onSubmit,
  onCancel,
}: FullRootingFormProps) {
  const [mediaCode, setMediaCode] = useState('');
  const [notes, setNotes] = useState('');
  const [operatorEntries, setOperatorEntries] = useState<OperatorWorkEntry[]>([]);

  const availableBottles = record.qtyAvailable ?? record.qtyIn ?? 0;

  const handleSubmit = () => {
    if (!mediaCode) {
      alert('Please select a media code');
      return;
    }

    const operatorError = validateRootingOperators(operatorEntries, availableBottles);
    if (operatorError) {
      alert(operatorError);
      return;
    }

    onSubmit({
      batchCode: record.batchCode,
      sourceRecordId: record.id,
      mediaCode,
      notes,
      operators: mapSplitOperatorsToPayload(operatorEntries, availableBottles),
    });
  };

  return (
    <ModalLayout title="Move Full Batch to Rooting">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <Alert className="bg-orange-50 border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            The entire batch <strong>{record.batchCode}</strong> will be moved to the <strong>Rooting Stage</strong>.
            <br />
            The batch code will remain the same. This is the final stage before outdoor export.
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Batch Code</div>
              <div className="font-semibold text-lg">{record.batchCode}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Plant Name</div>
              <div className="font-semibold text-lg">{record.plantName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Stage</div>
              <div className="font-semibold">{record.stage}</div>
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
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this rooting operation"
              rows={3}
            />
          </div>
        </div>

        {availableBottles > 0 && (
          <SplitOperatorAssignment
            operators={operators}
            entries={operatorEntries}
            onChange={setOperatorEntries}
            bottlesIn={availableBottles}
            bottlesOut={availableBottles}
          />
        )}
      </div>

      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleSubmit}
            disabled={!mediaCode || availableBottles <= 0}
          >
            Move to Rooting
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
