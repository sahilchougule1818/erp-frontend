import { useState } from 'react';
import { useNotify } from '../../../shared/hooks/useNotify';
import { CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { WorkerSelector } from '../../workers/components/WorkerSelector';
import { TrayInput } from '../../components/TrayInput';

interface IndoorBatch {
  id?: number;
  batchCode: string;
  plantName: string;
  sourceType?: string;
}

interface Tunnel {
  tunnelName?: string;
  name?: string;
  tunnel?: string;
  capacity?: number;
  availableSpace?: number;
}

interface ImportFormProps {
  indoorBatch: IndoorBatch;
  tunnels: Tunnel[];
  workers: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export function ImportForm({ indoorBatch, tunnels, workers, onSubmit, onClose }: ImportFormProps) {
  const notify = useNotify();
  const [newTunnel, setNewTunnel] = useState('');
  const [plants, setPlants] = useState(0);
  const [trays, setTrays] = useState<{ cavityCount: number; count: number }[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);

  const handleSubmit = () => {
    if (!newTunnel) {
      notify.error('Please select a tunnel');
      return;
    }
    if (!plants || plants <= 0) {
      notify.error('Please enter valid plants count');
      return;
    }
    if (selectedWorkers.length === 0) {
      notify.error('Please select at least one worker');
      return;
    }
    if (!indoorBatch.id && !indoorBatch.batchCode) {
      notify.error('Batch selection is invalid. Please go back and re-select the batch.');
      return;
    }
    onSubmit({
      newTunnel,
      plants,
      trays,
      selectedWorkers,
      indoorBatchId: indoorBatch.id,
      batchCode: indoorBatch.batchCode,
      sourceType: indoorBatch.sourceType,
    });
  };

  return (
    <ModalLayout title="Import from Indoor">
      <CardContent className="overflow-y-auto">
        <p className="mb-4 text-base text-gray-600">
          Batch: <span className="font-semibold">{indoorBatch.batchCode}</span><br />
          Plant: <span className="font-semibold">{indoorBatch.plantName}</span>
        </p>
        <div className="mb-4">
          <label className="block text-base font-medium mb-2">Tunnel *</label>
          <select value={newTunnel} onChange={(e) => setNewTunnel(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Select tunnel</option>
            {tunnels.map(t => {
              const safeName = t.name || t.tunnel || t.tunnelName || '';
              const space = t.availableSpace ?? t.capacity ?? 0;
              return (
                <option key={safeName} value={safeName}>
                  {safeName} (Capacity: {space})
                </option>
              );
            })}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-base font-medium mb-2">Plants Count *</label>
          <input
            type="number"
            value={plants}
            onChange={(e) => setPlants(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter number of plants"
          />
        </div>
        <div className="mb-4">
          <TrayInput trays={trays} onChange={setTrays} />
        </div>
        <div className="mb-4">
          <WorkerSelector workers={workers} selectedIds={selectedWorkers} onChange={setSelectedWorkers} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">Import</Button>
        </div>
      </CardContent>
    </ModalLayout>
  );
}
