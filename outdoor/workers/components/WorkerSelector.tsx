import { useState } from 'react';
import { Label } from '../../../shared/ui/label';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { ChevronDown, ChevronUp, Users, X } from 'lucide-react';

interface WorkerSelectorProps {
  workers: any[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function WorkerSelector({ workers, selectedIds, onChange }: WorkerSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleWorker = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeWorker = (id: number) => {
    onChange(selectedIds.filter(i => i !== id));
  };

  const selectedWorkers = workers.filter(w => selectedIds.includes(w.id));

  return (
    <div className="space-y-2">
      <Label>Workers *</Label>
      
      {/* Compact display with selected workers */}
      <div className="border rounded-md p-3 space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between h-8 text-base"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {selectedIds.length === 0 
                ? 'Select Workers' 
                : `${selectedIds.length} worker${selectedIds.length > 1 ? 's' : ''} selected`
              }
            </span>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {/* Selected workers display */}
        {selectedWorkers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedWorkers.map(worker => (
              <Badge 
                key={worker.id} 
                variant="secondary" 
                className="text-base px-2 py-1 flex items-center gap-1"
              >
                {worker.name || worker.short_name}
                <button
                  type="button"
                  onClick={() => removeWorker(worker.id)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="w-2 h-2" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Expandable worker selection */}
        {isExpanded && (
          <div className="border-t pt-2 max-h-32 overflow-y-auto space-y-1">
            {workers.map(worker => (
              <label key={worker.id} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(worker.id)}
                  onChange={() => toggleWorker(worker.id)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-base flex-1">
                  {worker.name || worker.short_name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
