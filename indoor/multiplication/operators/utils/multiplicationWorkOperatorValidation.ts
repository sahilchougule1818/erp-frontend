import type { OperatorWorkEntry } from '../../../operators/components/OperatorWorkAssignment';

export function validateFirstMultiplicationOperators(
  entries: OperatorWorkEntry[],
  requiredOutput: number
): string | null {
  if (!entries.length) {
    return 'Please assign at least one operator';
  }
  if (entries.some((entry) => !entry.qtyOut || entry.qtyOut <= 0)) {
    return 'Each operator must have a positive output bottle count';
  }
  const totalOut = entries.reduce((sum, entry) => sum + (entry.qtyOut || 0), 0);
  if (totalOut !== requiredOutput) {
    return `Operator output bottles (${totalOut}) must equal ${requiredOutput}`;
  }
  return null;
}

export function validateFullMultiplicationOperators(
  entries: OperatorWorkEntry[],
  availableBottles: number,
  requiredOutput: number
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

  if (totalIn !== availableBottles) {
    return `Operator input bottles (${totalIn}) must equal available bottles (${availableBottles})`;
  }
  if (totalOut !== requiredOutput) {
    return `Operator output bottles (${totalOut}) must equal ${requiredOutput}`;
  }
  return null;
}

export function mapMultiplicationOperatorsToPayload(
  entries: OperatorWorkEntry[],
  isFirstMultiplication: boolean
) {
  return entries.map((entry) => ({
    id: entry.id,
    qtyIn: isFirstMultiplication ? 0 : entry.qtyIn,
    qtyOut: entry.qtyOut,
  }));
}

export function buildMultiplicationOperatorEntries(
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
