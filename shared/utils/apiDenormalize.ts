/**
 * Converts snake_case request payloads to camelCase for Spring Boot APIs.
 * Frontend forms/tables can keep using snake_case while Jackson expects camelCase.
 */

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

/** Recursively convert object keys from snake_case to camelCase for API requests. */
export function toApiPayload<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => toApiPayload(item)) as T;
  }

  if (!isPlainObject(data)) {
    return data;
  }

  const payload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const camelKey = snakeToCamel(key);
    payload[camelKey] = toApiPayload(value);
  }

  return payload as T;
}
