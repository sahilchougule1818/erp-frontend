import { useState, useEffect, useRef } from 'react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Save, Users, FlaskConical, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { indoorApi } from '../../api/indoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useAuth } from '../../../auth/AuthContext';
import { toggleStagedOperator } from '../../operators/utils/syncOperatorAssignments';
import { isRecordActive } from '../../../shared/utils/recordActive';

interface MediaBatchFormProps {
  open: boolean;
  initialData?: any;
  operators: any[];
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  'pending':           'bg-yellow-100 text-yellow-800',
  'completed':         'bg-green-100 text-green-800',
  'stock_unavailable': 'bg-red-100 text-red-800',
};

export function MediaBatchForm({ open, initialData, operators, onSubmit, onDelete, onClose }: MediaBatchFormProps) {
  const isEdit = !!initialData;
  const notify = useNotify();
  const { user } = useAuth();
  const isLocked = user?.role === 'IndoorManager';
  const [activeTab, setActiveTab] = useState('details');
  const [saving, setSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [form, setForm] = useState<any>({});
  const [allOperators, setAllOperators] = useState<any[]>([]);
  const [stagedOperators, setStagedOperators] = useState<any[]>([]);
  const [initialAssignments, setInitialAssignments] = useState<any[]>([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [labs, setLabs] = useState<any[]>([]);
  const freedAssignmentIds = useRef<number[]>([]);

  const getDisplayName = (op: any) => `${op.firstName || ''} ${op.lastName || ''}`.trim() || op.shortName;

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setActiveTab('details');
      setForm({
        id: initialData.id,
        mediaCode: initialData.mediaCode || '',
        mediaType: initialData.mediaType || '',
        labNumber: initialData.labNumber?.toString() || '',
        startedAt: initialData.startedAt || '',
        mediaLoadedAt: initialData.mediaLoadedAt || '',
        pressureReachedAt: initialData.pressureReachedAt || '',
        endedAt: initialData.endedAt || '',
        openedAt: initialData.openedAt || '',
        mediaVolume: initialData.mediaVolume || '',
        bottlesCount: initialData.bottlesCount || '',
        temperature: initialData.temperature || '',
        pressure: initialData.pressure || '',
        duration: initialData.duration || '',
        notes: initialData.notes || '',
        status: initialData.status || 'pending',
      });
      loadOperators();
    } else {
      const defaultLab = isLocked && user?.labNumber ? user.labNumber.toString() : '';
      setForm({ mediaCode: '', mediaType: '', labNumber: defaultLab });
      setStagedOperators([]);
      setInitialAssignments([]);
      setAllOperators([]);
      loadAllOperators();
      if (!isLocked) fetchLabs();
    }
  }, [open, initialData, user, isLocked]);

  const loadAllOperators = async () => {
    try {
      const res = await indoorApi.operators.getActive({ designation: 'MEDIA_PREPARATION' });
      setAllOperators(Array.isArray(res) ? res : []);
    } catch { setAllOperators([]); }
  };

  const fetchLabs = async () => {
    try {
      const data = await indoorApi.labs.getLabs();
      const activeLabs = data.filter((lab: any) => isRecordActive(lab));
      setLabs(activeLabs);
      if (activeLabs.length === 1 && !form.labNumber) {
        setForm((prev: any) => ({ ...prev, labNumber: activeLabs[0].labNumber.toString() }));
      }
    } catch (error) {
      console.error('Failed to fetch labs:', error);
    }
  };

  const loadOperators = async () => {
    setLoadingOperators(true);
    try {
      const [assignmentsRes, operatorsRes] = await Promise.all([
        indoorApi.autoclave.getOperators(initialData.id),
        indoorApi.operators.getActive({ designation: 'MEDIA_PREPARATION' })
      ]);
      const assignments = Array.isArray(assignmentsRes) ? assignmentsRes : [];
      const ops = Array.isArray(operatorsRes) ? operatorsRes : [];
      setAllOperators(ops);
      setInitialAssignments(assignments);
      freedAssignmentIds.current = [];
      setStagedOperators(assignments.map((a: any) => ({
        id: parseInt(a.operatorId), shortName: a.shortName,
        firstName: a.firstName, lastName: a.lastName, assignmentId: a.id
      })));
    } catch { notify.error('Failed to load operator data'); }
    finally { setLoadingOperators(false); }
  };

  const toggleOperator = (op: any) => {
    const { staged, freed } = toggleStagedOperator(
      stagedOperators,
      op.id,
      {
        id: op.id,
        shortName: op.shortName,
        firstName: op.firstName,
        lastName: op.lastName,
      },
      freedAssignmentIds.current
    );
    freedAssignmentIds.current = freed;
    setStagedOperators(staged);
  };

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const handleCreate = async () => {
    if (!form.mediaCode?.trim()) { notify.error('Media code is required'); return; }
    if (!form.labNumber) { notify.error('Lab is required'); return; }
    const labNum = parseInt(form.labNumber);
    if (isNaN(labNum)) { notify.error('Invalid lab number'); return; }
    
    const payload = { 
      mediaCode: form.mediaCode.trim(), 
      mediaType: form.mediaType?.trim() || '', 
      labNumber: labNum,
      operatorIds: stagedOperators.map(o => o.id) 
    };
    
    setSaving(true);
    try {
      await onSubmit(payload);
    } finally { setSaving(false); }
  };

  const handleSaveDetails = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      // Convert empty strings to null for time fields
      const timeFields = ['startedAt', 'mediaLoadedAt', 'pressureReachedAt', 'endedAt', 'openedAt'];
      timeFields.forEach(field => {
        if (payload[field] === '') payload[field] = null;
      });
      // Convert empty strings to null for numeric fields
      const numericFields = ['mediaVolume', 'bottlesCount', 'temperature', 'pressure', 'duration'];
      numericFields.forEach(field => {
        if (payload[field] === '') payload[field] = null;
      });
      await onSubmit(payload);
    } finally { setSaving(false); }
  };

  const handleSaveOperators = async () => {
    setSaving(true);
    try {
      await indoorApi.autoclave.replaceOperators(
        initialData.id,
        stagedOperators.map((operator) => operator.id)
      );
      notify.success('Operators updated successfully');
      setInitialAssignments(prev => prev.filter((a: any) =>
        stagedOperators.some(op => op.assignmentId === a.id || op.id === parseInt(a.operatorId))
      ));
    } catch (error: any) {
      notify.error(error.message || 'Failed to save operators');
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <ModalLayout
      isOpen={open}
      onClose={() => !saving && onClose()}
      title={isEdit ? 'Edit Media Batch' : 'Create Media Batch'}
      subtitle={isEdit ? `Media Code: ${initialData.mediaCode}` : undefined}
      maxWidth="650px"
    >
      {isEdit ? (
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />Details
              </TabsTrigger>
              <TabsTrigger value="operators" className="flex items-center gap-2">
                <Users className="w-4 h-4" />Operators
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 py-4 px-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-500 uppercase">Media Batch</p>
                <Badge className={STATUS_COLORS[form.status] || 'bg-gray-100 text-gray-800'}>{form.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Media Code</Label>
                  <Input value={form.mediaCode} disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Media Type</Label>
                  <Input value={form.mediaType} onChange={e => set('mediaType', e.target.value)} placeholder="e.g. MS Medium" disabled={saving} />
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-500 uppercase mt-4">Autoclave Process</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Autoclave ON Time</Label>
                  <Input type="time" value={form.startedAt} onChange={e => set('startedAt', e.target.value)} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Media Loading Time</Label>
                  <Input type="time" value={form.mediaLoadedAt} onChange={e => set('mediaLoadedAt', e.target.value)} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Pressure Time</Label>
                  <Input type="time" value={form.pressureReachedAt} onChange={e => set('pressureReachedAt', e.target.value)} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Off Time</Label>
                  <Input type="time" value={form.endedAt} onChange={e => set('endedAt', e.target.value)} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Open Time</Label>
                  <Input type="time" value={form.openedAt} onChange={e => set('openedAt', e.target.value)} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Media Volume</Label>
                  <Input type="number" value={form.mediaVolume} onChange={e => set('mediaVolume', e.target.value)} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Bottles Count</Label>
                  <Input type="number" value={form.bottlesCount} onChange={e => set('bottlesCount', e.target.value)} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Temperature (°C)</Label>
                  <Input type="number" step="0.1" value={form.temperature} onChange={e => set('temperature', e.target.value)} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Pressure (PSI)</Label>
                  <Input type="number" step="0.1" value={form.pressure} onChange={e => set('pressure', e.target.value)} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" value={form.duration} onChange={e => set('duration', e.target.value)} disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => set('status', v)} disabled={saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="stock_unavailable">Stock Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes..." disabled={saving} />
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t">
                <div>
                  {onDelete && (
                    <Button variant="destructive" onClick={() => onDelete(initialData.id)} disabled={saving}>
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                  <Button onClick={handleSaveDetails} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? <><div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Details</>}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="operators" className="space-y-4 py-4 px-6">
              {loadingOperators ? (
                <div className="py-12 text-center flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  Loading operators...
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Assigned Operators ({stagedOperators.length})</Label>
                    <div className="border rounded-md p-3 min-h-[60px]">
                      {stagedOperators.length === 0
                        ? <span className="text-gray-500 text-base">No operators assigned</span>
                        : <div className="flex flex-wrap gap-2">{stagedOperators.map(op => <Badge key={op.id} variant="secondary">{getDisplayName(op)}</Badge>)}</div>
                      }
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Directory</Label>
                    <div className="border rounded-md overflow-hidden">
                      <button type="button" onClick={() => setIsExpanded(!isExpanded)} disabled={saving}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-base bg-transparent hover:bg-muted/30 transition-colors">
                        <span className="text-muted-foreground">Click to browse operator directory...</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                      </button>
                      {isExpanded && (
                        <div className="border-t max-h-[200px] overflow-y-auto p-3 space-y-2">
                          {allOperators.map(op => (
                            <div key={op.id} className="flex items-center space-x-2">
                              <input type="checkbox" id={`op-${op.id}`} checked={stagedOperators.some(o => o.id === op.id)}
                                onChange={() => toggleOperator(op)} disabled={saving}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                              <Label htmlFor={`op-${op.id}`} className="text-base cursor-pointer">{getDisplayName(op)}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSaveOperators} disabled={saving} className="bg-green-600 hover:bg-green-700">
                      {saving ? <><div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Operators</>}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Media Batch</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Media Code *</Label>
                <Input value={form.mediaCode} onChange={e => set('mediaCode', e.target.value)} placeholder="e.g. MS-001" disabled={saving} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Media Type</Label>
                <Input value={form.mediaType} onChange={e => set('mediaType', e.target.value)} placeholder="e.g. MS Medium" disabled={saving} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Lab *</Label>
                {isLocked ? (
                  <Input value={`Lab ${form.labNumber || ''}`} disabled className="bg-gray-100" />
                ) : (
                  <Select value={form.labNumber || ''} onValueChange={v => set('labNumber', v)} disabled={saving}>
                    <SelectTrigger><SelectValue placeholder="Select lab" /></SelectTrigger>
                    <SelectContent>
                      {labs.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">No labs available</div>
                      ) : (
                        labs.map((lab) => (
                          <SelectItem key={lab.labNumber} value={lab.labNumber.toString()}>
                            Lab {lab.labNumber} - {lab.labName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Operators</p>
            <div className="space-y-2">
              <div className="border rounded-md p-3 min-h-[50px]">
                {stagedOperators.length === 0
                  ? <span className="text-gray-500 text-base">No operators selected</span>
                  : <div className="flex flex-wrap gap-2">{stagedOperators.map(op => <Badge key={op.id} variant="secondary">{getDisplayName(op)}</Badge>)}</div>
                }
              </div>
              <div className="border rounded-md overflow-hidden">
                <button type="button" onClick={() => setIsExpanded(!isExpanded)} disabled={saving}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-base bg-transparent hover:bg-muted/30 transition-colors">
                  <span className="text-muted-foreground">Click to browse operator directory...</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                </button>
                {isExpanded && (
                  <div className="border-t max-h-[200px] overflow-y-auto p-3 space-y-2">
                    {allOperators.map(op => (
                      <div key={op.id} className="flex items-center space-x-2">
                        <input type="checkbox" id={`create-op-${op.id}`} checked={stagedOperators.some(o => o.id === op.id)}
                          onChange={() => toggleOperator(op)} disabled={saving}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <Label htmlFor={`create-op-${op.id}`} className="text-base cursor-pointer">{getDisplayName(op)}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? <><div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</> : <><Save className="w-4 h-4 mr-2" />Create</>}
            </Button>
          </div>
        </div>
      )}
    </ModalLayout>
  );
}
