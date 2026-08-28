import { useState, useEffect } from 'react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Button } from '../../../shared/ui/button';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { Save, Users, Sprout, ChevronDown, ChevronUp } from 'lucide-react';
import { outdoorApi } from '../../services/outdoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';

interface FertilizationEditModalProps {
  record: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface StagedWorker {
  id: number;
  short_name: string;
  first_name?: string;
  last_name?: string;
  assignmentId?: number;
}

export function FertilizationEditModal({ record, onClose, onSuccess }: FertilizationEditModalProps) {
  const [activeTab, setActiveTab] = useState('workers');
  const [saving, setSaving] = useState(false);
  const notify = useNotify();

  // Workers state
  const [initialAssignments, setInitialAssignments] = useState<any[]>([]);
  const [stagedWorkers, setStagedWorkers] = useState<StagedWorker[]>([]);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fertilization details state
  const [fertilizationDetails, setFertilizationDetails] = useState({
    fertilizerName: record?.fertilizer_name || '',
    quantity: record?.quantity || 0
  });

  const getWorkerDisplayName = (worker: any) => {
    return worker.short_name;
  };

  useEffect(() => {
    let active = true;
    async function loadWorkers() {
      try {
        const workersRes = await outdoorApi.workers.getAll(1, 500);
        const workersData = (workersRes as any)?.data || workersRes;
        const workers = Array.isArray(workersData) ? workersData : [];
        
        if (!active) return;
        setAllWorkers(workers);
        
        // Load assignments
        try {
          const assignmentsRes = await outdoorApi.workers.getAssignments(
            record.event_code,
            'fertilization',
            record.id
          );
          const assignments = (assignmentsRes as any) || [];
          
          if (!active) return;
          setInitialAssignments(assignments);
          
          setStagedWorkers(assignments.map((a: any) => ({
            id: a.worker_id,
            short_name: a.short_name,
            first_name: a.first_name,
            last_name: a.last_name,
            assignmentId: a.id
          })));
        } catch (assignError) {
          // If no assignments found, that's okay
          if (!active) return;
          setInitialAssignments([]);
          setStagedWorkers([]);
        }
      } catch (error: any) {
        if (!active) return;
        notify.error('Failed to load worker data');
      } finally {
        if (active) setLoadingWorkers(false);
      }
    }
    loadWorkers();
    return () => { active = false; };
  }, [record.event_code, record.id, notify]);

  const toggleWorker = (workerId: number) => {
    if (stagedWorkers.some(w => w.id === workerId)) {
      setStagedWorkers(prev => prev.filter(w => w.id !== workerId));
    } else {
      const worker = allWorkers.find(w => w.id === workerId);
      if (!worker) return;
      setStagedWorkers(prev => [...prev, {
        id: worker.id,
        short_name: worker.short_name,
        first_name: worker.first_name,
        last_name: worker.last_name
      }]);
    }
  };

  const handleSaveWorkers = async () => {
    setSaving(true);
    try {
      const stagedIds = stagedWorkers.map(w => w.id);
      const savedIds = initialAssignments.map((a: any) => a.worker_id);
      
      const removals = initialAssignments.filter((a: any) => !stagedIds.includes(a.worker_id));
      const additions = stagedWorkers.filter(w => !savedIds.includes(w.id));

      // If no changes, just close
      if (additions.length === 0 && removals.length === 0) {
        notify.success('No changes to save');
        onClose();
        return;
      }

      if (additions.length > 0) {
        await Promise.all(
          additions.map(w => outdoorApi.workers.addAssignment({
            event_code: record.event_code,
            worker_id: w.id,
            activity_type: 'fertilization',
            fertilization_id: record.id,
            batch_code: record.batch_code,
            phase: record.current_phase,
            tunnel: record.current_tunnel
          }))
        );
      }

      if (removals.length > 0) {
        await Promise.all(
          removals.map((a: any) => outdoorApi.workers.removeAssignment(a.id))
        );
      }

      notify.success('Workers updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      notify.error(error.response?.data?.message || error.message || 'Failed to save workers');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFertilizationDetails = async () => {
    setSaving(true);
    try {
      await outdoorApi.fertilization.update(record.id, {
        fertilizer_name: fertilizationDetails.fertilizerName,
        quantity: fertilizationDetails.quantity
      });
      notify.success('Fertilization details updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to update fertilization details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalLayout
      isOpen={true}
      onClose={() => !saving && onClose()}
      title="Edit Fertilization Record"
      subtitle={`Batch: ${record.batch_code} · Phase: ${record.current_phase}`}
      maxWidth="650px"
    >
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="workers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Workers
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Sprout className="w-4 h-4" />
              Fertilization Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workers" className="space-y-4 py-4 px-6">
            {loadingWorkers ? (
              <div className="py-12 text-center text-base text-muted-foreground flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                Loading workers...
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Assigned Workers ({stagedWorkers.length})</Label>
                  <div className="border rounded-md p-3 min-h-[60px]">
                    {stagedWorkers.length === 0 ? (
                      <span className="text-gray-500 text-base">No workers assigned</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {stagedWorkers.map((w) => (
                          <Badge key={w.id} variant="secondary">
                            {getWorkerDisplayName(w)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

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

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={onClose} disabled={saving}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveWorkers} 
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Workers
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4 py-4 px-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fertilizer Name *</Label>
                <Input
                  value={fertilizationDetails.fertilizerName}
                  onChange={(e) => setFertilizationDetails({ ...fertilizationDetails, fertilizerName: e.target.value })}
                  placeholder="Enter fertilizer name"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fertilizationDetails.quantity}
                  onChange={(e) => setFertilizationDetails({ ...fertilizationDetails, quantity: parseFloat(e.target.value) || 0 })}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveFertilizationDetails} 
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Details
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ModalLayout>
  );
}
