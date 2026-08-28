import { useState } from 'react';
import { useNotify } from '../../../shared/hooks/useNotify';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Button } from '../../../shared/ui/button';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { WorkerSelector } from '../../workers/components/WorkerSelector';
import { TrayInput } from '../../components/TrayInput';

interface Batch {
  batch_code: string;
  available_plants: number;
  total_plants: number;
  current_tunnel?: string;
  current_phase?: string;
}

interface Tunnel {
  tunnel_name?: string;
  name?: string;
  tunnel?: string;
}

interface ShiftFormProps {
  batch: Batch;
  tunnels: Tunnel[];
  shUnits: any[];
  workers: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export function ShiftForm({ batch, tunnels, shUnits, workers, onSubmit, onClose }: ShiftFormProps) {
  const notify = useNotify();
  const [newTunnel, setNewTunnel] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [plants, setPlants] = useState(batch.available_plants ?? batch.total_plants);
  const [mortalityCount, setMortalityCount] = useState(0);
  const [reason, setReason] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [trays, setTrays] = useState<{ cavityCount: number; count: number }[]>([]);

  const isSecondaryHardening = batch.current_phase === 'secondary_hardening';

  const handleSubmit = () => {
    if (isSecondaryHardening && !newUnit) {
      notify.error('Please select a unit');
      return;
    }
    if (!isSecondaryHardening && !newTunnel) {
      notify.error('Please select a tunnel');
      return;
    }
    if (selectedWorkers.length === 0) {
      notify.error('Please select at least one worker');
      return;
    }
    onSubmit({ newTunnel, newUnit, plants, mortalityCount, reason, selectedWorkers, trays });
  };

  return (
    <ModalLayout title={isSecondaryHardening ? "Make Shift (Unit Move)" : "Make Shift (Tunnel Move)"}>
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="text-base text-gray-600">
            Batch Code: <span className="font-semibold text-gray-900">{batch.batch_code}</span>
          </p>
          <p className="text-base text-gray-600">
            Current {isSecondaryHardening ? 'Unit' : 'Tunnel'}: <span className="font-semibold text-gray-900">{batch.current_tunnel || '—'}</span>
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Shift Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isSecondaryHardening ? 'New Unit *' : 'New Tunnel *'}</Label>
              {isSecondaryHardening ? (
                <Select value={newUnit} onValueChange={setNewUnit}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {shUnits.map(u => (
                      <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={newTunnel} onValueChange={setNewTunnel}>
                  <SelectTrigger><SelectValue placeholder="Select tunnel" /></SelectTrigger>
                  <SelectContent>
                    {tunnels.map(t => {
                      const safeName = t.name || t.tunnel || t.tunnel_name;
                      const displayName = (t as any).display_name || safeName;
                      return (
                      <SelectItem key={safeName} value={safeName as string}>
                        {displayName}
                      </SelectItem>
                    )})}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Plants *</Label>
              <Input 
                type="number" 
                value={plants} 
                onChange={(e) => setPlants(Number(e.target.value))} 
                min="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="Enter reason for shift"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Worker Assignment</p>
          <WorkerSelector workers={workers} selectedIds={selectedWorkers} onChange={setSelectedWorkers} />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Tray Configuration</p>
          <TrayInput trays={trays} onChange={setTrays} />
        </div>
      </div>
      
      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">Shift</Button>
        </div>
      </div>
    </ModalLayout>
  );
}
