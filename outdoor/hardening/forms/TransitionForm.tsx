import { useState } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Button } from '../../../shared/ui/button';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { WorkerSelector } from '../../workers/components/WorkerSelector';
import { TrayInput } from '../../components/TrayInput';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Batch {
  batch_code: string;
  available_plants: number;
  total_plants: number;
  current_phase: string;
  current_tunnel?: string;
}

interface Tunnel {
  tunnel_name?: string;
  name?: string;
  tunnel?: string;
}

interface TransitionFormProps {
  batch: Batch;
  tunnels: Tunnel[];
  shUnits: any[];
  workers: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export function TransitionForm({ batch, tunnels, shUnits, workers, onSubmit, onClose }: TransitionFormProps) {
  const [targetPhase, setTargetPhase] = useState(
    batch.current_phase === 'primary_hardening' ? 'holding_area' : 'secondary_hardening'
  );
  const [newTunnel, setNewTunnel] = useState('');
  const [unit, setUnit] = useState('');
  const [plants, setPlants] = useState(batch.available_plants ?? batch.total_plants);
  const [mortalityCount, setMortalityCount] = useState(0);
  const [reason, setReason] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [trays, setTrays] = useState<{ cavityCount: number; count: number }[]>([]);
  const notify = useNotify();

  const handleSubmit = () => {
    if (targetPhase === 'secondary_hardening' && !unit) {
      notify.error('Please select a unit for secondary hardening');
      return;
    }
    if (!plants) {
      notify.error('Please enter plant count');
      return;
    }
    if (selectedWorkers.length === 0) {
      notify.error('Please select at least one worker');
      return;
    }
    onSubmit({ targetPhase, newTunnel, unit, plants, mortalityCount, reason, selectedWorkers, trays });
  };

  return (
    <ModalLayout title="Phase Transition (Maturity Step-Up)">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Batch Information</p>
          <div className="bg-gray-50 p-3 rounded-md space-y-1">
            <p className="text-base text-gray-600">
              Batch Code: <span className="font-semibold text-gray-900">{batch.batch_code}</span>
            </p>
            <p className="text-base text-gray-600">
              Current Tunnel: <span className="font-semibold text-gray-900">{batch.current_tunnel || '—'}</span>
            </p>
            <p className="text-base text-gray-600">
              Current Phase: <span className="font-semibold text-gray-900">{batch.current_phase?.replace(/_/g, ' ')}</span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Transition Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Phase *</Label>
              <Select value={targetPhase} onValueChange={setTargetPhase}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {batch.current_phase === 'primary_hardening' && (
                    <>
                      <SelectItem value="holding_area">Holding Area</SelectItem>
                      <SelectItem value="secondary_hardening">Secondary Hardening</SelectItem>
                    </>
                  )}
                  {batch.current_phase === 'holding_area' && (
                    <SelectItem value="secondary_hardening">Secondary Hardening</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {targetPhase === 'secondary_hardening' && (
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {shUnits.map(u => (
                      <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Transition
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
