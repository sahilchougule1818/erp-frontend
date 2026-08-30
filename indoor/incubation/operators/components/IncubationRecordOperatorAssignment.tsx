import { OperatorSelector } from '../../../operators/components/OperatorSelector';

interface IncubationRecordOperatorAssignmentProps {
  operators: any[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

/** Simple operator pick when editing an active incubation record. */
export function IncubationRecordOperatorAssignment({
  operators,
  selectedIds,
  onChange,
}: IncubationRecordOperatorAssignmentProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Operator Assignment</p>
      <OperatorSelector operators={operators} selectedIds={selectedIds} onChange={onChange} />
    </div>
  );
}
