import { useState } from 'react';
import { Label } from '../../../shared/ui/label';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { ChevronDown, ChevronUp, Users, X } from 'lucide-react';

interface OperatorSelectorProps {
  operators: any[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function OperatorSelector({ operators, selectedIds, onChange }: OperatorSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleOperator = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeOperator = (id: number) => {
    onChange(selectedIds.filter(i => i !== id));
  };

  const selectedOperators = operators.filter(o => selectedIds.includes(o.id));

  return (
    <div className="space-y-2">
      <Label>Operators *</Label>
      
      {/* Compact display with selected operators */}
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
                ? 'Select Operators' 
                : `${selectedIds.length} operator${selectedIds.length > 1 ? 's' : ''} selected`
              }
            </span>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {/* Selected operators display */}
        {selectedOperators.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedOperators.map(operator => (
              <Badge 
                key={operator.id} 
                variant="secondary" 
                className="text-base px-2 py-1 flex items-center gap-1"
              >
                {operator.short_name}
                <button
                  type="button"
                  onClick={() => removeOperator(operator.id)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="w-2 h-2" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Expandable operator selection */}
        {isExpanded && (
          <div className="border-t pt-2 space-y-1">
            <button
              type="button"
              onClick={() => onChange(selectedIds.length === operators.length ? [] : operators.map(o => o.id))}
              className="text-xs text-green-700 font-medium hover:underline px-1"
            >
              {selectedIds.length === operators.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {operators.map(operator => (
                <label key={operator.id} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(operator.id)}
                    onChange={() => toggleOperator(operator.id)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-base flex-1">
                    {operator.short_name} ({operator.first_name} {operator.last_name})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}