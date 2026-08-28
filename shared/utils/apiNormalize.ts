/**
 * Adds snake_case aliases for camelCase API fields so legacy UI code
 * (tables, forms) can keep using snake_case while Spring returns camelCase.
 *
 * Original camelCase keys are preserved.
 */

const FIELD_ALIASES: Record<string, string[]> = {
  is_active: ['active', 'isActive'],
  is_deleted: ['deleted', 'isDeleted'],
  is_sampled: ['sampled', 'isSampled'],
  is_rooted: ['rooted', 'isRooted'],
};

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function applyFieldAliases(record: Record<string, unknown>): void {
  for (const [target, sources] of Object.entries(FIELD_ALIASES)) {
    if (record[target] !== undefined && record[target] !== null) continue;
    for (const source of sources) {
      if (record[source] !== undefined && record[source] !== null) {
        record[target] = record[source];
        break;
      }
    }
  }
}

function normalizeRecord(record: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...record };

  for (const [key, value] of Object.entries(record)) {
    const nextValue = normalizeApiData(value);
    normalized[key] = nextValue;

    const snakeKey = camelToSnake(key);
    if (snakeKey !== key && normalized[snakeKey] === undefined) {
      normalized[snakeKey] = nextValue;
    }
  }

  applyFieldAliases(normalized);
  return normalized;
}

/** Recursively normalize API payloads (objects, arrays, Spring pages). */
export function normalizeApiData<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeApiData(item)) as T;
  }

  if (!isPlainObject(data)) {
    return data;
  }

  const record = normalizeRecord(data);

  // Legacy paginated shape: { data: [...] }
  if (Array.isArray(record.data)) {
    record.data = normalizeApiData(record.data);
  }

  // Spring Page shape: { content: [...] }
  if (Array.isArray(record.content)) {
    record.content = normalizeApiData(record.content);
  }

  return record as T;
}
