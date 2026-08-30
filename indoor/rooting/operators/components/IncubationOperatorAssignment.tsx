import { OperatorSelector } from '../../../operators/components/OperatorSelector';

interface IncubationOperatorAssignmentProps {
  operators: any[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

/** Simple operator pick when moving a rooted batch into terminal incubation. */
export function IncubationOperatorAssignment({
  operators,
  selectedIds,
  onChange,
}: IncubationOperatorAssignmentProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Operator Assignment</p>
      <OperatorSelector operators={operators} selectedIds={selectedIds} onChange={onChange} />
    </div>
  );
}

export function mapIncubationOperatorIdsToPayload(operatorIds: number[]) {
  return operatorIds.map((id) => ({ id }));
}

export function validateIncubationOperatorAssignment(operatorIds: number[]): string | null {
  if (!operatorIds.length) {
    return 'Please assign at least one operator';
  }
  return null;
}
