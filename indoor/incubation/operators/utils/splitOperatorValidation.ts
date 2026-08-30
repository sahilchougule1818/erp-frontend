import type { OperatorWorkEntry } from '../../../operators/components/OperatorWorkAssignment';

export function validateSplitOperators(
  entries: OperatorWorkEntry[],
  bottlesIn: number,
  bottlesOut: number
): string | null {
  if (!entries.length) {
    return 'Please assign at least one operator';
  }
  if (entries.some((entry) => !entry.qtyIn || entry.qtyIn <= 0)) {
    return 'Each operator must have a positive input bottle count';
  }
  if (entries.some((entry) => !entry.qtyOut || entry.qtyOut <= 0)) {
    return 'Each operator must have a positive output bottle count';
  }

  const totalIn = entries.reduce((sum, entry) => sum + (entry.qtyIn || 0), 0);
  const totalOut = entries.reduce((sum, entry) => sum + (entry.qtyOut || 0), 0);

  if (totalIn !== bottlesIn) {
    return `Operator input bottles (${totalIn}) must equal ${bottlesIn}`;
  }
  if (totalOut !== bottlesOut) {
    return `Operator output bottles (${totalOut}) must equal ${bottlesOut}`;
  }
  return null;
}

export function validateRootingOperators(
  entries: OperatorWorkEntry[],
  bottleCount: number
): string | null {
  return validateSplitOperators(entries, bottleCount, bottleCount);
}

export function mapSplitOperatorsToPayload(entries: OperatorWorkEntry[]) {
  return entries.map((entry) => ({
    id: entry.id,
    qtyIn: entry.qtyIn,
    qtyOut: entry.qtyOut,
  }));
}

export function buildOperatorEntriesFromSelection(
  operators: any[],
  selectedIds: number[],
  existingEntries: OperatorWorkEntry[]
): OperatorWorkEntry[] {
  return selectedIds.map((id) => {
    const existing = existingEntries.find((entry) => entry.id === id);
    if (existing) return existing;

    const operator = operators.find((op) => op.id === id);
    return {
      id,
      shortName: operator?.shortName,
      firstName: operator?.firstName,
      lastName: operator?.lastName,
      qtyIn: 0,
      qtyOut: 0,
    };
  });
}
