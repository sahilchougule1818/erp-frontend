import { OperatorSelector } from '../../../operators/components/OperatorSelector';
import { OperatorWorkAssignment, type OperatorWorkEntry } from '../../../operators/components/OperatorWorkAssignment';
import { buildOperatorEntriesFromSelection } from '../utils/splitOperatorValidation';

interface SplitOperatorAssignmentProps {
  operators: any[];
  entries: OperatorWorkEntry[];
  onChange: (entries: OperatorWorkEntry[]) => void;
  bottlesIn: number;
  bottlesOut: number;
}

/** Bottle in/out assignment for incubation-phase split workflows. */
export function SplitOperatorAssignment({
  operators,
  entries,
  onChange,
  bottlesIn,
  bottlesOut,
}: SplitOperatorAssignmentProps) {
  const selectedIds = entries.map((entry) => entry.id);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Operator Assignment</p>
      <OperatorSelector
        operators={operators}
        selectedIds={selectedIds}
        onChange={(ids) => onChange(buildOperatorEntriesFromSelection(operators, ids, entries))}
      />
      <OperatorWorkAssignment
        hidePicker
        operators={operators}
        entries={entries}
        onChange={onChange}
        showInput={bottlesIn > 0}
        availableBottles={bottlesIn > 0 ? bottlesIn : undefined}
      />
      {bottlesOut > 0 && bottlesOut !== bottlesIn && (
        <p className="text-xs text-gray-500">
          Total output bottles must equal <strong>{bottlesOut}</strong>.
        </p>
      )}
    </div>
  );
}
