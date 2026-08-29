import { useState, useEffect, useRef } from 'react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Button } from '../../../shared/ui/button';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { Save, Users, Thermometer, ChevronDown, ChevronUp } from 'lucide-react';
import { indoorApi } from '../../api/indoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';
import { syncOperatorAssignments, toggleStagedOperator, type StagedOperator } from '../../operators/utils/syncOperatorAssignments';

interface IncubationEditModalProps {
  record: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function IncubationEditModal({ record, onClose, onSuccess }: IncubationEditModalProps) {
  const [activeTab, setActiveTab] = useState('operators');
  const [saving, setSaving] = useState(false);
  const notify = useNotify();

  // Operators state
  const [initialAssignments, setInitialAssignments] = useState<any[]>([]);
  const [stagedOperators, setStagedOperators] = useState<StagedOperator[]>([]);
  const [allOperators, setAllOperators] = useState<any[]>([]);
  const [loadingOperators, setLoadingOperators] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const freedAssignmentIds = useRef<number[]>([]);

  // Incubation details state
  const [incubationDetails, setIncubationDetails] = useState({
    incubationPeriod: record?.incubationPeriod || 7,
    temperature: record?.temperature || '',
    humidity: record?.humidity || '',
    lightIntensity: record?.lightIntensity || ''
  });

  const getOperatorDisplayName = (op: any) => {
    return op.shortName;
  };

  useEffect(() => {
    let active = true;
    async function loadOperators() {
      try {
        const [assignmentsRes, operatorsRes] = await Promise.all([
          indoorApi.operators.getAssignments({ 
            eventCode: record.eventCode,
            activityType: 'event'
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
          id: a.operatorId ?? a.operatorId,
          shortName: a.shortName ?? a.shortName,
          firstName: a.firstName ?? a.firstName,
          lastName: a.lastName ?? a.lastName,
          assignmentId: a.id
        })));
      } catch (error: any) {
        if (!active) return;
        notify.error('Failed to load operator data');
      } finally {
        if (active) setLoadingOperators(false);
      }
    }
    loadOperators();
    return () => { active = false; };
  }, [record.eventCode, notify]);

  const toggleOperator = (operatorId: number) => {
    const operator = allOperators.find(op => op.id === operatorId);
    if (!operator && !stagedOperators.some(op => op.id === operatorId)) return;

    const { staged, freed } = toggleStagedOperator(
      stagedOperators,
      operatorId,
      operator ? {
        id: operator.id,
        shortName: operator.shortName,
        firstName: operator.firstName,
        lastName: operator.lastName,
      } : { id: operatorId },
      freedAssignmentIds.current
    );
    freedAssignmentIds.current = freed;
    setStagedOperators(staged);
  };

  const handleSaveOperators = async () => {
    setSaving(true);
    try {
      if (stagedOperators.length === 0) {
        throw new Error('At least one operator must remain assigned');
      }

      await syncOperatorAssignments(initialAssignments, stagedOperators, {
        add: (operatorId) => indoorApi.operators.addAssignment({
          eventCode: record.eventCode,
          operatorId: operatorId,
          activityType: 'event',
          batchCode: record.batchCode,
          stage: record.stage,
        }),
        update: (assignmentId, operatorId) => indoorApi.operators.updateAssignment(assignmentId, {
          operatorId: operatorId,
          stage: record.stage,
        }),
        remove: (assignmentId) => indoorApi.operators.removeAssignment(assignmentId),
      });

      notify.success('Operators updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      notify.error(error.message || 'Failed to save operators');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIncubationDetails = async () => {
    setSaving(true);
    try {
      await indoorApi.phaseViews.updateIncubationDetails(record.eventCode, incubationDetails);
      notify.success('Incubation details updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Failed to update incubation details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalLayout
      isOpen={true}
      onClose={() => !saving && onClose()}
      title="Edit Incubation Record"
      subtitle={`Batch: ${record.batchCode} · Stage: ${record.stage}`}
      maxWidth="650px"
    >
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="operators" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Operators
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Incubation Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operators" className="space-y-4 py-4 px-6">
            {loadingOperators ? (
              <div className="py-12 text-center text-base text-muted-foreground flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                Loading operators...
              </div>
            ) : (
              <>
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

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={onClose} disabled={saving}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveOperators} 
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
                        Save Operators
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
                <Label>Incubation Period (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={incubationDetails.incubationPeriod}
                  onChange={(e) => setIncubationDetails({ ...incubationDetails, incubationPeriod: parseInt(e.target.value) || 0 })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={incubationDetails.temperature}
                  onChange={(e) => setIncubationDetails({ ...incubationDetails, temperature: e.target.value })}
                  placeholder="Optional"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>Humidity (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={incubationDetails.humidity}
                  onChange={(e) => setIncubationDetails({ ...incubationDetails, humidity: e.target.value })}
                  placeholder="Optional"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>Light Intensity</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={incubationDetails.lightIntensity}
                  onChange={(e) => setIncubationDetails({ ...incubationDetails, lightIntensity: e.target.value })}
                  placeholder="Optional"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveIncubationDetails} 
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
