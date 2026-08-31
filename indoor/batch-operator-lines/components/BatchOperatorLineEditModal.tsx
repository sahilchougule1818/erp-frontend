import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Save, Users } from 'lucide-react';
import { indoorApi } from '../../api/indoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';
import { OperatorWorkAssignment, type OperatorWorkEntry } from '../../operators/components/OperatorWorkAssignment';
import type { BatchOperatorLine } from '../../types';

interface BatchOperatorLineEditModalProps {
  lines: BatchOperatorLine[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function BatchOperatorLineEditModal({
  lines,
  onClose,
  onSuccess,
}: BatchOperatorLineEditModalProps) {
  const notify = useNotify();
  const template = lines[0];
  const [operatorEntries, setOperatorEntries] = useState<OperatorWorkEntry[]>([]);
  const [allOperators, setAllOperators] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const readOnly = lines.some(line => line.editable === false);
  const isIncubation = template?.sourceTable === 'incubation_records';
  const isMultiplication = template?.sourceTable === 'multiplication_records';
  const isRooting = template?.sourceTable === 'rooted_batches';
  const showInput = isMultiplication || isRooting;
  const showContamination = isIncubation;

  const operatorDesignation = isIncubation ? 'INCUBATION' : 'MULTIPLICATION';

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!isIncubation) {
          const operatorsRes = await indoorApi.operators.getActive({ designation: operatorDesignation });
          if (!active) return;
          setAllOperators(Array.isArray(operatorsRes) ? operatorsRes : []);
        }
        setOperatorEntries(lines.map(line => ({
          id: line.operatorId,
          shortName: line.operatorShortName,
          firstName: line.operatorFirstName,
          lastName: line.operatorLastName,
          qtyIn: line.qtyIn ?? 0,
          qtyOut: line.qtyOut ?? 0,
          qtyContaminated: line.qtyContaminated ?? 0,
        })));
      } catch (error: any) {
        if (!active) return;
        notify.error('Failed to load operator data: ' + (error.message || 'Unknown error'));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [lines, operatorDesignation, isIncubation, notify]);

  const availableBottles = useMemo(() => {
    if (!isMultiplication) return undefined;
    const totalOut = lines.reduce((sum, line) => sum + (line.qtyOut || 0), 0);
    const totalIn = lines.reduce((sum, line) => sum + (line.qtyIn || 0), 0);
    return totalIn > 0 ? totalIn : totalOut;
  }, [isMultiplication, lines]);

  const lockReason = readOnly
    ? (lines.find(line => line.editLockReason)?.editLockReason
        || 'This batch has progressed — operator work can no longer be edited.')
    : null;

  const handleSave = async () => {
    if (!template?.sourceTable || !template.sourceRecordId || !template.eventCode) return;

    if (!isIncubation) {
      if (operatorEntries.some(entry => !entry.qtyOut || entry.qtyOut <= 0)) {
        notify.error('Each operator must have a positive output bottle count');
        return;
      }
      if (showInput && availableBottles != null) {
        const totalIn = operatorEntries.reduce((sum, entry) => sum + (entry.qtyIn || 0), 0);
        if (totalIn !== availableBottles) {
          notify.error(`Operator input bottles (${totalIn}) must equal available bottles (${availableBottles})`);
          return;
        }
      }
    }

    if (isIncubation) {
      if (operatorEntries.some(entry => (entry.qtyContaminated || 0) > (entry.qtyOut || 0))) {
        notify.error('Contamination cannot exceed output bottles for any operator');
        return;
      }
    }

    setSaving(true);
    try {
      await indoorApi.batchOperatorLines.update({
        sourceTable: template.sourceTable,
        sourceRecordId: template.sourceRecordId,
        eventCode: template.eventCode,
        notes: isIncubation ? notes : undefined,
        operators: operatorEntries.map(entry => ({
          id: entry.id,
          qtyIn: entry.qtyIn,
          qtyOut: entry.qtyOut,
          qtyContaminated: isIncubation ? (entry.qtyContaminated ?? 0) : 0,
        })),
      });
      notify.success(isIncubation ? 'Contamination updated' : 'Operator work updated');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      notify.error('Failed to save: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const subtitle = `${template?.batchCode ?? ''} · ${template?.phase ?? ''} · ${template?.stage ?? ''}`;
  const title = readOnly
    ? (isIncubation ? 'View Incubation Operators' : 'View Operator Work')
    : (isIncubation ? 'Record Contamination' : 'Edit Bottle Counts');

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">{subtitle}</DialogDescription>
        </DialogHeader>

        {lockReason && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            {lockReason}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : (
          <div className="space-y-4">
            <OperatorWorkAssignment
              operators={allOperators}
              entries={operatorEntries}
              onChange={setOperatorEntries}
              showInput={showInput}
              showContamination={showContamination}
              availableBottles={availableBottles}
              hidePicker
              readOnly={readOnly}
              lockBottleCounts={isIncubation}
            />
            {isIncubation && (
              <div className="space-y-2">
                <Label>Contamination Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={2}
                  disabled={readOnly || saving}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button onClick={handleSave} disabled={saving || loading}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
