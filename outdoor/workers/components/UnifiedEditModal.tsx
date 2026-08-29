import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { Label } from '../../../shared/ui/label';
import { Separator } from '../../../shared/ui/separator';
import { Badge } from '../../../shared/ui/badge';
import { X, Save, ChevronDown, ChevronUp, FileEdit } from 'lucide-react';
import { outdoorApi } from '../../api/outdoorApi';
import { parseSpringPage } from '../../../shared/utils/springPage';
import { useNotify } from '../../../shared/hooks/useNotify';

interface WorkerEditModalProps {
  eventCode:  string;
  batchCode:  string;
  tunnel?:    string;
  phase:      string;
  activityType?: string;
  fertilizationId?: number;
  onClose:    () => void;
}

interface StagedWorker {
  id: number;
  shortName: string;
  firstName: string;
  lastName: string;
  assignmentId?: number;
}

export function UnifiedEditModal({
  eventCode,
  batchCode,
  tunnel,
  phase,
  activityType = 'event',
  fertilizationId,
  onClose
}: WorkerEditModalProps) {
  const [initialAssignments, setInitialAssignments] = useState<any[]>([]);
  const [stagedWorkers, setStagedWorkers] = useState<StagedWorker[]>([]);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const notify = useNotify();

  const getWorkerDisplayName = (w: any) => {
    const full = `${w.firstName || ''} ${w.lastName || ''}`.trim();
    return full || w.shortName;
  };

  useEffect(() => {
    let active = true;
    async function loadData() {
      if (!eventCode) {
        setLoading(false);
        return;
      }
      try {
        const [assignmentsRes, workersRes] = await Promise.all([
          outdoorApi.workers.getAssignments(eventCode, activityType, fertilizationId),
          outdoorApi.workers.getAll(1, 500)
        ]);
        if (!active) return;
        
        const assignments = Array.isArray(assignmentsRes) ? assignmentsRes : [];
        const workers = parseSpringPage(workersRes).data;
        
        setAllWorkers(workers);
        setInitialAssignments(assignments);
        
        setStagedWorkers(assignments.map(a => ({
          id: a.workerId,
          shortName: a.workerShortname,
          firstName: a.firstName,
          lastName: a.lastName,
          assignmentId: a.id
        })));
      } catch (error: any) {
        if (!active) return;
        console.error('Error loading worker data:', error);
        notify.error('Failed to load worker data: ' + (error.response?.data?.message || error.message));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [eventCode, activityType, fertilizationId, notify]);

  const handleAddWorker = (workerIdStr: string) => {
    const workerId = parseInt(workerIdStr);
    if (stagedWorkers.some(w => w.id === workerId)) return;
    
    const worker = allWorkers.find(w => w.id === workerId);
    if (!worker) return;

    setStagedWorkers(prev => [...prev, {
      id: worker.id,
      shortName: worker.shortName,
      firstName: worker.firstName,
      lastName: worker.lastName
    }]);
  };

  const toggleWorker = (workerId: number) => {
    if (stagedWorkers.some(w => w.id === workerId)) {
      handleRemoveWorker(workerId);
    } else {
      handleAddWorker(workerId.toString());
    }
  };

  const handleRemoveWorker = (workerId: number) => {
    setStagedWorkers(prev => prev.filter(w => w.id !== workerId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const stagedIds = stagedWorkers.map(w => w.id);
      const savedIds = initialAssignments.map((a: any) => a.workerId);
      
      // Calculate diffs
      const removals = initialAssignments.filter((a: any) => !stagedIds.includes(a.workerId));
      const additions = stagedWorkers.filter(w => !savedIds.includes(w.id));

      // Additions first to satisfy backend DB constraint (at least 1 worker must remain)
      if (additions.length > 0) {
        await Promise.all(
          additions.map(w => outdoorApi.workers.addAssignment({
            eventCode: eventCode,
            workerId: w.id,
            tunnel,
            phase,
            activityType: activityType,
            fertilizationId,
          }))
        );
      }

      // Then perform removals securely
      if (removals.length > 0) {
        await Promise.all(
          removals.map((a: any) => outdoorApi.workers.removeAssignment(a.id))
        );
      }

      notify.success('Record updated successfully');
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
            <FileEdit className="w-5 h-5 text-green-600" />
            Manage Record
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-1 text-left">
            Batch: {batchCode} · {activityType === 'fertilization' ? 'Activity: Fertilization' : `Phase: ${phase.replace(/_/g, ' ')}`} {tunnel ? `· Tunnel: ${tunnel}` : ''}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-base text-muted-foreground flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            Loading workers...
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Assigned Workers */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Assigned Workers ({stagedWorkers.length})</Label>
              <div className="border rounded-md p-3 min-h-[60px]">
                {stagedWorkers.length === 0 ? (
                  <span className="text-gray-500 text-base">No workers assigned</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {stagedWorkers.map((worker) => (
                      <Badge key={worker.id} variant="secondary">
                        {getWorkerDisplayName(worker)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Worker Directory */}
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
                    Click to browse worker directory...
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                </button>
                
                {isExpanded && (
                  <div className="border-t max-h-[200px] overflow-y-auto p-3 space-y-2">
                    {allWorkers.map((w) => {
                      const isSelected = stagedWorkers.some(sw => sw.id === w.id);
                      return (
                        <div key={w.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`worker-${w.id}`}
                            checked={isSelected}
                            onChange={() => toggleWorker(w.id)}
                            disabled={saving}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <Label htmlFor={`worker-${w.id}`} className="text-base cursor-pointer">
                            {getWorkerDisplayName(w)}
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
