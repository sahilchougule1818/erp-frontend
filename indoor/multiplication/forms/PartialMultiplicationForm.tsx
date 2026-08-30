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
  const [bottlesInherited, setBottlesInherited] = useState('');
  const [newBottlesCount, setNewBottlesCount] = useState('');
  const [mediaCode, setMediaCode] = useState('');
  const [notes, setNotes] = useState('');
  const [operatorEntries, setOperatorEntries] = useState<OperatorWorkEntry[]>([]);

  const availableBottles = record.qtyAvailable ?? record.qtyIn ?? 0;
  const targetStage = nextStageLabel(record.stage);
  const inherited = parseInt(bottlesInherited, 10) || 0;
  const output = parseInt(newBottlesCount, 10) || 0;

  const handleSubmit = () => {
    if (!inherited || inherited <= 0) {
      alert('Please enter a valid inherited bottle count');
      return;
    }
    if (inherited > availableBottles) {
      alert(`Cannot take more than ${availableBottles} bottles`);
      return;
    }
    if (!output || output <= 0) {
      alert('Please enter a valid output bottle count');
      return;
    }
    if (!mediaCode) {
      alert('Please select a media code');
      return;
    }

    const operatorError = validateSplitOperators(operatorEntries, inherited, output);
    if (operatorError) {
      alert(operatorError);
      return;
    }

    onSubmit({
      batchCode: record.batchCode,
      sourceRecordId: record.id,
      bottlesInherited: inherited,
      newBottlesCount: output,
      mediaCode,
      notes,
      operators: mapSplitOperatorsToPayload(operatorEntries),
    });
  };

  return (
    <ModalLayout title="Make Partial Multiplication">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            A new batch will be created with code: <strong>{record.batchCode}-M(n)</strong>
            <br />
            The child batch moves to <strong>{targetStage}</strong> (same stage as a full multiplication from {record.stage}).
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Parent Batch</div>
              <div className="font-semibold text-lg">{record.batchCode}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Incubation Stage</div>
              <div className="font-semibold text-lg">{record.stage}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Target Stage</div>
              <div className="font-semibold text-green-700">{targetStage}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Available Bottles</div>
              <div className="font-semibold text-green-600">{availableBottles}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Bottles Taken From Parent (Input) *</Label>
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
            <Label>Output Bottles After Multiplication *</Label>
            <Input
              type="number"
              min="1"
              value={newBottlesCount}
              onChange={(e) => setNewBottlesCount(e.target.value)}
              placeholder="Bottles produced"
            />
          </div>
          <div className="space-y-2">
            <Label>Media Code *</Label>
            <Select value={mediaCode} onValueChange={setMediaCode}>
              <SelectTrigger><SelectValue placeholder="Select media code" /></SelectTrigger>
              <SelectContent>
                {mediaCodes.map((code) => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." rows={3} />
          </div>
        </div>

        {inherited > 0 && output > 0 && (
          <SplitOperatorAssignment
            operators={operators}
            entries={operatorEntries}
            onChange={setOperatorEntries}
            bottlesIn={inherited}
            bottlesOut={output}
          />
        )}
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>Create Partial Multiplication</Button>
      </div>
    </ModalLayout>
  );
}
