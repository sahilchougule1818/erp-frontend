import { useState } from 'react';
import { Input } from '../../../shared/ui/input';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export interface OperatorWorkEntry {
  id: number;
  shortName?: string;
  firstName?: string;
  lastName?: string;
  qtyIn: number;
  qtyOut: number;
  qtyContaminated?: number;
}

interface OperatorWorkAssignmentProps {
  operators: any[];
  entries: OperatorWorkEntry[];
  onChange: (entries: OperatorWorkEntry[]) => void;
  showInput?: boolean;
  showContamination?: boolean;
  availableBottles?: number;
  /** When true, only render bottle count rows (operator selection handled elsewhere). */
  hidePicker?: boolean;
  /** When true, display assignments without allowing changes. */
  readOnly?: boolean;
}

function displayName(op: any) {
  const full = `${op.firstName || ''} ${op.lastName || ''}`.trim();
  return full || op.shortName || `Operator ${op.id}`;
}

export function OperatorWorkAssignment({
  operators,
  entries,
  onChange,
  showInput = false,
  showContamination = false,
  availableBottles,
  hidePicker = false,
  readOnly = false,
}: OperatorWorkAssignmentProps) {
  const [isExpanded, setIsExpanded] = useState(!hidePicker && entries.length === 0);

  const totalIn = entries.reduce((sum, entry) => sum + (entry.qtyIn || 0), 0);
  const totalOut = entries.reduce((sum, entry) => sum + (entry.qtyOut || 0), 0);
  const totalContaminated = entries.reduce((sum, entry) => sum + (entry.qtyContaminated || 0), 0);

  const gridCols = showContamination
    ? (showInput ? 'grid-cols-[1fr_90px_90px_90px_32px]' : 'grid-cols-[1fr_90px_90px_32px]')
    : (showInput ? 'grid-cols-[1fr_100px_100px_32px]' : 'grid-cols-[1fr_100px_32px]');

  const toggleOperator = (operatorId: number) => {
    if (readOnly) return;
    if (entries.some(entry => entry.id === operatorId)) {
      onChange(entries.filter(entry => entry.id !== operatorId));
      return;
    }

    const operator = operators.find(op => op.id === operatorId);
    if (!operator) return;

    onChange([
      ...entries,
      {
        id: operator.id,
        shortName: operator.shortName,
        firstName: operator.firstName,
        lastName: operator.lastName,
        qtyIn: 0,
        qtyOut: 0,
        qtyContaminated: 0,
      },
    ]);
  };

  const updateEntry = (operatorId: number, field: 'qtyIn' | 'qtyOut' | 'qtyContaminated', value: string) => {
    if (readOnly) return;
    const parsed = parseInt(value, 10);
    onChange(entries.map(entry => (
      entry.id === operatorId
        ? { ...entry, [field]: Number.isNaN(parsed) ? 0 : Math.max(0, parsed) }
        : entry
    )));
  };

  return (
    <div className="space-y-3">
      {!hidePicker && !readOnly && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Assigned Operators *</span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            {isExpanded ? 'Hide list' : 'Add operators'}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">
          {hidePicker ? 'Select operators above, then assign bottle counts.' : 'Select at least one operator and assign bottle counts.'}
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className={`grid ${gridCols} gap-2 items-center border rounded-md p-2`}>
              <div className="text-sm font-medium truncate">{displayName(entry)}</div>
              {showInput ? (
                <Input
                  type="number"
                  min={0}
                  placeholder="In"
                  value={entry.qtyIn || ''}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className={readOnly ? 'bg-gray-100' : undefined}
                  onChange={(e) => updateEntry(entry.id, 'qtyIn', e.target.value)}
                />
              ) : (
                <div />
              )}
              <Input
                type="number"
                min={0}
                placeholder="Out"
                value={entry.qtyOut || ''}
                readOnly={readOnly}
                disabled={readOnly}
                className={readOnly ? 'bg-gray-100' : undefined}
                onChange={(e) => updateEntry(entry.id, 'qtyOut', e.target.value)}
              />
              {showContamination && (
                <Input
                  type="number"
                  min={0}
                  placeholder="Cont."
                  value={entry.qtyContaminated || ''}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className={readOnly ? 'bg-gray-100' : 'text-red-700'}
                  onChange={(e) => updateEntry(entry.id, 'qtyContaminated', e.target.value)}
                />
              )}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => toggleOperator(entry.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {readOnly && <div />}
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-600 space-y-1">
        {showInput && availableBottles != null && (
          <div>Total input: <span className="font-medium">{totalIn}</span> / {availableBottles} available</div>
        )}
        <div>Total output: <span className="font-medium">{totalOut}</span></div>
        {showContamination && (
          <div>Total contaminated: <span className="font-medium text-red-600">{totalContaminated}</span></div>
        )}
      </div>

      {!hidePicker && !readOnly && isExpanded && (
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
          {operators.map(op => {
            const selected = entries.some(entry => entry.id === op.id);
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => toggleOperator(op.id)}
                className={`text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                  selected ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'hover:bg-gray-50'
                }`}
              >
                {displayName(op)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
