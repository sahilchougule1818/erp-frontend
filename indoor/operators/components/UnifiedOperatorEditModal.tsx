import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { Label } from '../../../shared/ui/label';
import { Separator } from '../../../shared/ui/separator';
import { Badge } from '../../../shared/ui/badge';
import { X, Save, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { indoorApi } from '../../services/indoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';
import { syncOperatorAssignments, toggleStagedOperator, type StagedOperator } from '../utils/syncOperatorAssignments';

interface OperatorEditModalProps {
  recordId?: number;
  eventCode?: string;
  batchCode?: string;
  mediaCode?: string;
  cleaning_record_id?: number;
  cleaning_record_kind?: 'standard' | 'deep';
  targetLabel?: string;
  activityType?: string;
  stage?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UnifiedOperatorEditModal({
  eventCode,
  batchCode,
  mediaCode,
  cleaning_record_id,
  cleaning_record_kind = 'standard',
  targetLabel,
  activityType = 'event',
  stage,
  onClose,
  onSuccess
}: OperatorEditModalProps) {
  const [initialAssignments, setInitialAssignments] = useState<any[]>([]);
  const [stagedOperators, setStagedOperators] = useState<StagedOperator[]>([]);
  const [allOperators, setAllOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const freedAssignmentIds = useRef<number[]>([]);
  const notify = useNotify();

  const getOperatorDisplayName = (op: any) => {
    const full = `${op.first_name || ''} ${op.last_name || ''}`.trim();
    return full || op.short_name;
  };

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        if (!eventCode && !mediaCode && cleaning_record_id == null) {
          setLoading(false);
          return;
        }

        const [assignmentsRes, operatorsRes] = await Promise.all([
          indoorApi.operators.getAssignments({
            event_code: eventCode,
            media_code: mediaCode,
            cleaning_record_id,
            cleaning_record_kind,
            activity_type: cleaning_record_id != null ? 'cleaning' : activityType
          }),
          indoorApi.operators.getActive()
        ]);
        if (!active) return;

        const assignments = Array.isArray(assignmentsRes) ? assignmentsRes : [];
        const operators = Array.isArray(operatorsRes) ? operatorsRes : [];

        setAllOperators(operators);
        setInitialAssignments(assignments);
        freedAssignmentIds.current = [];

        setStagedOperators(assignments.map((a: any) => ({
          id: a.operator_id ?? a.operatorId,
          short_name: a.short_name ?? a.shortName,
          first_name: a.first_name ?? a.firstName,
          last_name: a.last_name ?? a.lastName,
          assignmentId: a.id
        })));
      } catch (error: any) {
        if (!active) return;
        notify.error('Failed to load operator data: ' + (error.response?.data?.message || error.message));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [eventCode, mediaCode, cleaning_record_id, cleaning_record_kind, activityType, notify]);

  const toggleOperator = (operatorId: number) => {
    const operator = allOperators.find(op => op.id === operatorId);
    if (!operator && !stagedOperators.some(op => op.id === operatorId)) return;

    const { staged, freed } = toggleStagedOperator(
      stagedOperators,
      operatorId,
      operator ? {
        id: operator.id,
        short_name: operator.short_name,
        first_name: operator.first_name,
        last_name: operator.last_name,
        role: '',
      } : { id: operatorId },
      freedAssignmentIds.current
    );
    freedAssignmentIds.current = freed;
    setStagedOperators(staged);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (stagedOperators.length === 0) {
        throw new Error('At least one operator must remain assigned');
      }

      await syncOperatorAssignments(initialAssignments, stagedOperators, {
        add: (operatorId) => indoorApi.operators.addAssignment({
          event_code: eventCode,
          media_code: mediaCode,
          cleaning_record_id,
          cleaning_record_kind,
          operator_id: operatorId,
          activity_type: cleaning_record_id != null ? 'cleaning' : activityType,
          batch_code: batchCode,
          stage: stage,
        }),
        update: (assignmentId, operatorId) => indoorApi.operators.updateAssignment(assignmentId, { operator_id: operatorId }),
        remove: (assignmentId) => indoorApi.operators.removeAssignment(assignmentId),
      });

      notify.success('Operators updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      notify.error('Failed to save changes: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const subtitle = batchCode
    ? `Batch: ${batchCode}`
    : mediaCode
      ? `Media: ${mediaCode}`
      : targetLabel
        ? `Target: ${targetLabel}`
        : 'Record Details';

  return (
    <Dialog open={true} onOpenChange={(open: boolean) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Manage Operators
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-1 text-left">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading operators...</p>
        ) : (
          <>
            <div className="space-y-3">
              <Label>Assigned Operators</Label>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {stagedOperators.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No operators assigned</span>
                ) : (
                  stagedOperators.map(op => (
                    <Badge key={op.id} variant="secondary" className="flex items-center gap-1 pr-1">
                      {getOperatorDisplayName(op)}
                      <button type="button" onClick={() => toggleOperator(op.id)} className="ml-1 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <Separator />

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Add / Remove Operators</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isExpanded && (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {allOperators.map(op => {
                  const isSelected = stagedOperators.some(s => s.id === op.id);
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => toggleOperator(op.id)}
                      className={`text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                        isSelected ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      {getOperatorDisplayName(op)}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
