import { OperatorSelector } from '../../../operators/components/OperatorSelector';
import { OperatorWorkAssignment, type OperatorWorkEntry } from '../../../operators/components/OperatorWorkAssignment';
import { buildMultiplicationOperatorEntries } from '../utils/multiplicationWorkOperatorValidation';

interface MultiplicationWorkOperatorAssignmentProps {
  operators: any[];
  entries: OperatorWorkEntry[];
  onChange: (entries: OperatorWorkEntry[]) => void;
  isFirstMultiplication: boolean;
  availableBottles?: number;
}

/** Bottle in/out for first multiplication (output only) from initialisation. */
export function MultiplicationWorkOperatorAssignment({
  operators,
  entries,
  onChange,
  isFirstMultiplication,
  availableBottles,
}: MultiplicationWorkOperatorAssignmentProps) {
  const selectedIds = entries.map((entry) => entry.id);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Operator Assignment</p>
      <OperatorSelector
        operators={operators}
        selectedIds={selectedIds}
        onChange={(ids) => onChange(buildMultiplicationOperatorEntries(operators, ids, entries))}
      />
      <OperatorWorkAssignment
        hidePicker
        operators={operators}
        entries={entries}
        onChange={onChange}
        showInput={!isFirstMultiplication}
        availableBottles={isFirstMultiplication ? undefined : availableBottles}
      />
    </div>
  );
}
