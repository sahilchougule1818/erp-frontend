export interface StagedOperator {
  id: number;
  short_name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  assignmentId?: number;
}

export interface InitialAssignment {
  id: number;
  operator_id?: number;
  operatorId?: number;
}

function initialOperatorId(a: InitialAssignment): number {
  return a.operator_id ?? a.operatorId ?? 0;
}

export async function syncOperatorAssignments(
  initialAssignments: InitialAssignment[],
  stagedOperators: StagedOperator[],
  handlers: {
    add: (operatorId: number) => Promise<unknown>;
    update: (assignmentId: number, operatorId: number) => Promise<unknown>;
    remove: (assignmentId: number) => Promise<unknown>;
  }
): Promise<void> {
  const usedAssignmentIds = new Set<number>();
  const ops: Promise<unknown>[] = [];

  for (const op of stagedOperators) {
    if (op.assignmentId != null) {
      usedAssignmentIds.add(op.assignmentId);
      const initial = initialAssignments.find(a => a.id === op.assignmentId);
      if (initial && initialOperatorId(initial) !== op.id) {
        ops.push(handlers.update(op.assignmentId, op.id));
      }
    } else {
      ops.push(handlers.add(op.id));
    }
  }

  for (const a of initialAssignments) {
    if (!usedAssignmentIds.has(a.id)) {
      ops.push(handlers.remove(a.id));
    }
  }

  await Promise.all(ops);
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
    staged: [...stagedOperators, { ...operator, assignmentId }],
    freed,
  };
}
