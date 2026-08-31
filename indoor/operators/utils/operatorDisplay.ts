export function getOperatorShortLabel(operator: {
  id?: number;
  shortName?: string;
  firstName?: string;
  lastName?: string;
}): string {
  const short = operator.shortName?.trim();
  if (short) return short;
  const full = `${operator.firstName || ''} ${operator.lastName || ''}`.trim();
  return full || `Operator ${operator.id ?? ''}`;
}

export function getOperatorListLabel(operator: {
  shortName?: string;
  firstName?: string;
  lastName?: string;
}): string {
  const short = operator.shortName?.trim();
  const full = `${operator.firstName || ''} ${operator.lastName || ''}`.trim();
  if (short && full) return `${short} (${full})`;
  return short || full || 'Operator';
}
