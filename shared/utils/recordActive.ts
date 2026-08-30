/** Backend uses `active`; some legacy UI code still checks `isActive`. */
export function isRecordActive(record: { active?: boolean; isActive?: boolean } | null | undefined): boolean {
  if (!record) return false;
  return record.active ?? record.isActive ?? false;
}
