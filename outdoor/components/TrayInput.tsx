import { useState } from 'react';
import { Label } from '../../shared/ui/label';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { Plus, X } from 'lucide-react';

interface Tray {
  cavityCount: number;
  count: number;
}

interface TrayInputProps {
  trays: Tray[];
  onChange: (trays: Tray[]) => void;
}

export function TrayInput({ trays, onChange }: TrayInputProps) {
  const [newTray, setNewTray] = useState({ cavityCount: '', count: '' });

  const addTray = () => {
    if (newTray.cavityCount && newTray.count) {
      onChange([...trays, { cavityCount: Number(newTray.cavityCount), count: Number(newTray.count) }]);
      setNewTray({ cavityCount: '', count: '' });
    }
  };

  const removeTray = (index: number) => {
    onChange(trays.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>Trays</Label>
      <div className="border rounded-md p-3 space-y-3">
        {/* Add new tray */}
        <div className="grid grid-cols-5 gap-2 items-end">
          <div className="col-span-2">
            <Label className="text-base">Cavity Count</Label>
            <Input
              type="number"
              placeholder="Cavity"
              value={newTray.cavityCount}
              onChange={(e) => setNewTray({ ...newTray, cavityCount: e.target.value })}
              className="h-8 text-base"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-base">Count</Label>
            <Input
              type="number"
              placeholder="Count"
              value={newTray.count}
              onChange={(e) => setNewTray({ ...newTray, count: e.target.value })}
              className="h-8 text-base"
            />
          </div>
          <Button 
            onClick={addTray} 
            size="sm" 
            className="h-8 px-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Existing trays */}
        {trays.length > 0 && (
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {trays.map((t, i) => (
              <div key={i} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-base">
                <span className="text-base">
                  Cavity: <span className="font-medium">{t.cavityCount}</span>, 
                  Count: <span className="font-medium">{t.count}</span>
                </span>
                <Button 
                  onClick={() => removeTray(i)} 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {trays.length === 0 && (
          <p className="text-base text-gray-500 text-center py-2">No trays added yet</p>
        )}
      </div>
    </div>
  );
}
