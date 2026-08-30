export interface StagedOperator {
  id: number;
  shortName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  assignmentId?: number;
  qtyIn?: number;
  qtyOut?: number;
}

export function toggleStagedOperator(
  stagedOperators: StagedOperator[],
  operatorId: number,
  operator: StagedOperator,
  freedAssignmentIds: number[]
): { staged: StagedOperator[]; freed: number[] } {
  if (stagedOperators.some(op => op.id === operatorId)) {
    const removed = stagedOperators.find(op => op.id === operatorId);
    const freed = removed?.assignmentId != null
      ? [...freedAssignmentIds, removed.assignmentId]
      : freedAssignmentIds;
    return {
      staged: stagedOperators.filter(op => op.id !== operatorId),
      freed,
    };
  }

  const assignmentId = freedAssignmentIds.length > 0
    ? freedAssignmentIds[freedAssignmentIds.length - 1]
    : undefined;
  const freed = assignmentId != null ? freedAssignmentIds.slice(0, -1) : freedAssignmentIds;

  return {
    staged: [...stagedOperators, { ...operator, assignmentId, qtyIn: 0, qtyOut: 0 }],
    freed,
  };
}
