import { useState } from 'react';
import { Input } from '../../../shared/ui/input';
import { getOperatorShortLabel } from '../utils/operatorDisplay';
import { ChevronDown, ChevronUp, FlaskConical, X } from 'lucide-react';

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
  /** When true, bottle in/out fields are read-only (incubation contamination edit). */
  lockBottleCounts?: boolean;
  readOnly?: boolean;
  /** Rooting: keep qtyOut in sync with qtyIn. */
  syncInOut?: boolean;
}

function displayName(op: OperatorWorkEntry | { id?: number; shortName?: string; firstName?: string; lastName?: string }) {
  return getOperatorShortLabel(op);
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
  lockBottleCounts = false,
  syncInOut = false,
}: OperatorWorkAssignmentProps) {
  const [isExpanded, setIsExpanded] = useState(!hidePicker && entries.length === 0);

  const totalIn = entries.reduce((sum, entry) => sum + (entry.qtyIn || 0), 0);
  const totalOut = entries.reduce((sum, entry) => sum + (entry.qtyOut || 0), 0);
  const totalContaminated = entries.reduce((sum, entry) => sum + (entry.qtyContaminated || 0), 0);

  const numberInputClass = 'h-8 w-[88px] px-2 text-sm';

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
    const qty = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    onChange(entries.map(entry => {
      if (entry.id !== operatorId) return entry;
      if (syncInOut && (field === 'qtyIn' || field === 'qtyOut')) {
        return { ...entry, qtyIn: qty, qtyOut: qty };
      }
      return { ...entry, [field]: qty };
    }));
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
            <div
              key={entry.id}
              className="flex items-center gap-2 rounded-md border px-2 py-1.5"
            >
              <FlaskConical className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <div className="min-w-0 flex-1 text-sm font-medium truncate">{displayName(entry)}</div>
              {showInput && (
                <Input
                  type="number"
                  min={0}
                  placeholder="In"
                  value={entry.qtyIn || ''}
                  readOnly={readOnly || lockBottleCounts}
                  disabled={readOnly || lockBottleCounts}
                  className={(readOnly || lockBottleCounts) ? `${numberInputClass} bg-gray-100` : numberInputClass}
                  onChange={(e) => updateEntry(entry.id, 'qtyIn', e.target.value)}
                />
              )}
              <Input
                type="number"
                min={0}
                placeholder="Out"
                value={entry.qtyOut || ''}
                readOnly={readOnly || lockBottleCounts}
                disabled={readOnly || lockBottleCounts}
                className={(readOnly || lockBottleCounts) ? `${numberInputClass} bg-gray-100` : numberInputClass}
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
                  className={readOnly ? `${numberInputClass} bg-gray-100` : `${numberInputClass} text-red-700`}
                  onChange={(e) => updateEntry(entry.id, 'qtyContaminated', e.target.value)}
                />
              )}
              {!readOnly && !lockBottleCounts && (
                <button
                  type="button"
                  onClick={() => toggleOperator(entry.id)}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${displayName(entry)}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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
