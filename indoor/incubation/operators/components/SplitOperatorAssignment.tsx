import { OperatorSelector } from '../../../operators/components/OperatorSelector';
import { OperatorWorkAssignment, type OperatorWorkEntry } from '../../../operators/components/OperatorWorkAssignment';
import { buildOperatorEntriesFromSelection } from '../utils/splitOperatorValidation';

interface SplitOperatorAssignmentProps {
  operators: any[];
  entries: OperatorWorkEntry[];
  onChange: (entries: OperatorWorkEntry[]) => void;
  bottlesIn: number;
  bottlesOut: number;
  /** Show In column even when bottlesIn is 0 (partial splits — operators drive counts). */
  alwaysShowInput?: boolean;
  /** When true, operator in/out must match (rooting — no bottle multiplication). */
  equalInOut?: boolean;
}

/** Bottle in/out assignment for incubation-phase split workflows. */
export function SplitOperatorAssignment({
  operators,
  entries,
  onChange,
  bottlesIn,
  bottlesOut,
  alwaysShowInput = false,
  equalInOut = false,
}: SplitOperatorAssignmentProps) {
  const selectedIds = entries.map((entry) => entry.id);
  const showInput = alwaysShowInput || bottlesIn > 0;
  const targetBottles = equalInOut ? bottlesIn : bottlesOut;

  const handleEntriesChange = (updated: OperatorWorkEntry[]) => {
    if (!equalInOut) {
      onChange(updated);
      return;
    }
    onChange(
      updated.map((entry) => ({
        ...entry,
        qtyOut: entry.qtyIn ?? entry.qtyOut ?? 0,
      }))
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Operator Assignment</p>
      <OperatorSelector
        operators={operators}
        selectedIds={selectedIds}
        onChange={(ids) => handleEntriesChange(buildOperatorEntriesFromSelection(operators, ids, entries))}
      />
      <OperatorWorkAssignment
        hidePicker
        operators={operators}
        entries={entries}
        onChange={handleEntriesChange}
        showInput={showInput}
        syncInOut={equalInOut}
        availableBottles={showInput ? (bottlesIn > 0 ? bottlesIn : undefined) : undefined}
      />
      {equalInOut && bottlesIn > 0 && (
        <p className="text-xs text-gray-500">
          For rooting, each operator&apos;s <strong>In</strong> and <strong>Out</strong> must match;
          totals must equal <strong>{bottlesIn}</strong> bottles.
        </p>
      )}
      {!equalInOut && targetBottles > 0 && targetBottles !== bottlesIn && (
        <p className="text-xs text-gray-500">
          Total output bottles must equal <strong>{targetBottles}</strong>.
        </p>
      )}
    </div>
  );
}
