import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { Label } from '../../../shared/ui/label';
import { Separator } from '../../../shared/ui/separator';
import { Badge } from '../../../shared/ui/badge';
import { X, Save, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { indoorApi } from '../../services/indoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';

interface OperatorEditModalProps {
  recordId?:   number;        // For future use
  eventCode?:  string;        // For assignment link
  batchCode?:  string;
  mediaCode?:  string;
  cleaning_id?: number;       // For cleaning assignment
  cleaning_type?: string;     // 'standard' or 'deep'
  activityType?: string;
  stage?:      string;
  onClose:    () => void;
  onSuccess?:  () => void;
}

interface StagedOperator {
  id: number;
  short_name: string;
  first_name: string;
  last_name: string;
  role: string;
  assignmentId?: number;
}

export function UnifiedOperatorEditModal({
  recordId,
  eventCode,
  batchCode,
  mediaCode,
  cleaning_id,
  cleaning_type,
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
  const notify = useNotify();

  const getOperatorDisplayName = (op: any) => {
    const full = `${op.first_name || ''} ${op.last_name || ''}`.trim();
    return full || op.short_name;
  };

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        if (!eventCode && !mediaCode && !cleaning_id) {
          setLoading(false);
          return;
        }

        const [assignmentsRes, operatorsRes] = await Promise.all([
          indoorApi.operators.getAssignments({ 
            event_code: eventCode, 
            media_code: mediaCode, 
            cleaning_id, 
            cleaning_type,
            activity_type: activityType 
          }),
          indoorApi.operators.getActive()
        ]);
        if (!active) return;
        
        const assignments = Array.isArray(assignmentsRes) ? assignmentsRes : [];
        const operators = Array.isArray(operatorsRes) ? operatorsRes : [];
        
        setAllOperators(operators);
        setInitialAssignments(assignments);
        
        setStagedOperators(assignments.map((a: any) => ({
          id: a.operator_id,
          short_name: a.short_name,
          first_name: a.first_name,
          last_name: a.last_name,
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
  }, [eventCode, mediaCode, cleaning_id, cleaning_type, activityType, notify]);

  const toggleOperator = (operatorId: number) => {
    if (stagedOperators.some(op => op.id === operatorId)) {
      setStagedOperators(prev => prev.filter(op => op.id !== operatorId));
    } else {
      const operator = allOperators.find(op => op.id === operatorId);
      if (!operator) return;
      setStagedOperators(prev => [...prev, {
        id: operator.id,
        short_name: operator.short_name,
        first_name: operator.first_name,
        last_name: operator.last_name
      }]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Operator Assignments Diff
      const stagedIds = stagedOperators.map(op => op.id);
      const savedIds = initialAssignments.map((a: any) => a.operator_id);
      
      const removals = initialAssignments.filter((a: any) => !stagedIds.includes(a.operator_id));
      const additions = stagedOperators.filter(op => !savedIds.includes(op.id));

      // At least one operator must remain
      if (stagedOperators.length === 0) {
        throw new Error('At least one operator must remain assigned');
      }

      // Handle additions
      if (additions.length > 0) {
        await Promise.all(
          additions.map(op => indoorApi.operators.addAssignment({
            event_code: eventCode,
            media_code: mediaCode,
            cleaning_id,
            cleaning_type,
            operator_id: op.id,
            activity_type: activityType,
            batch_code: batchCode,
            stage: stage
          }))
        );
      }

      // Handle removals
      if (removals.length > 0) {
        await Promise.all(
          removals.map((a: any) => indoorApi.operators.removeAssignment(a.id))
        );
      }

      notify.success('Operators updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      notify.error('Failed to save changes: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open: boolean) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Manage Operators
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-1 text-left">
            {batchCode ? `Batch: ${batchCode}` : mediaCode ? `Media: ${mediaCode}` : cleaning_id ? `${cleaning_type === 'deep' ? 'Deep Cleaning' : 'Standard Cleaning'} Record` : 'Record Details'} 
            {stage ? ` · Stage: ${stage}` : ''}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-base text-muted-foreground flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Loading operators...
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Currently Assigned Operators */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Assigned Operators ({stagedOperators.length})</Label>
              <div className="border rounded-md p-3 min-h-[60px]">
                {stagedOperators.length === 0 ? (
                  <span className="text-gray-500 text-base">No operators assigned</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {stagedOperators.map((op) => (
                      <Badge key={op.id} variant="secondary">
                        {getOperatorDisplayName(op)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Operator Directory */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Directory</Label>
              <div className="border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  disabled={saving}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-base bg-transparent transition-colors hover:bg-muted/30"
                >
                  <span className="text-muted-foreground">
                    Click to browse operator directory...
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                </button>
                
                {isExpanded && (
                  <div className="border-t max-h-[200px] overflow-y-auto p-3 space-y-2">
                    {allOperators.map((op) => {
                      const isSelected = stagedOperators.some(so => so.id === op.id);
                      return (
                        <div key={op.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`operator-${op.id}`}
                            checked={isSelected}
                            onChange={() => toggleOperator(op.id)}
                            disabled={saving}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <Label htmlFor={`operator-${op.id}`} className="text-base cursor-pointer">
                            {getOperatorDisplayName(op)}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
