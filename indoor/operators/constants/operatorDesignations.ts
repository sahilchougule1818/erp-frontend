export const OPERATOR_DESIGNATIONS = [
  { value: 'MEDIA_PREPARATION', label: 'Media preparation' },
  { value: 'MULTIPLICATION', label: 'Multiplication' },
  { value: 'INCUBATION', label: 'Incubation' },
] as const;

export type OperatorDesignation = typeof OPERATOR_DESIGNATIONS[number]['value'];

export function formatOperatorDesignation(value: string): string {
  return OPERATOR_DESIGNATIONS.find((item) => item.value === value)?.label ?? value;
}

export function formatOperatorDesignations(values?: string[]): string {
  if (!values?.length) return '—';
  return values.map(formatOperatorDesignation).join(' · ');
}
