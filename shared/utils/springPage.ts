export interface UiPagination {
  currentPage: number;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ParsedSpringPage<T> {
  data: T[];
  pagination: UiPagination;
}

export interface TablePagination {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

/** Convert 1-based UI page to Spring's 0-based page index. */
export function toSpringPageParams(uiPage = 1, size = 10) {
  return {
    page: Math.max(uiPage - 1, 0),
    size,
  };
}

/** UI lab selector uses 0 for "All Labs". Omit from API params when consolidating. */
export function resolveLabNumber(labNumber?: number) {
  return labNumber && labNumber > 0 ? labNumber : undefined;
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Read a field from API rows that may use camelCase or snake_case keys. */
export function getRecordField(record: Record<string, unknown> | null | undefined, key: string): unknown {
  if (!record || !key) return undefined;
  if (record[key] !== undefined && record[key] !== null) return record[key];

  const camel = snakeToCamel(key);
  if (camel !== key && record[camel] !== undefined && record[camel] !== null) return record[camel];

  const snake = camelToSnake(key);
  if (snake !== key && record[snake] !== undefined && record[snake] !== null) return record[snake];

  // Common Spring boolean aliases (active vs is_active)
  if (key === 'is_active') {
    if (record.active !== undefined && record.active !== null) return record.active;
    if (record.isActive !== undefined && record.isActive !== null) return record.isActive;
  }

  return record[key];
}

/** Normalize Spring Page<T> (or legacy { data, pagination }) for UI hooks. */
export function parseSpringPage<T>(response: unknown): ParsedSpringPage<T> {
  const res = response as Record<string, unknown> | T[] | null | undefined;

  if (res && !Array.isArray(res) && Array.isArray(res.content)) {
    const number = (res.number as number) ?? 0;
    const currentPage = number + 1;
    const totalPages = (res.totalPages as number) ?? 1;
    return {
      data: res.content as T[],
      pagination: {
        currentPage,
        page: currentPage,
        limit: (res.size as number) ?? 10,
        total: (res.totalElements as number) ?? (res.content as T[]).length,
        totalPages,
        hasNext: res.last === false,
        hasPrev: res.first === false,
      },
    };
  }

  if (res && !Array.isArray(res) && Array.isArray(res.data)) {
    const pagination = (res.pagination as Record<string, unknown>) ?? {};
    const currentPage = (pagination.currentPage as number) ?? (pagination.page as number) ?? 1;
    const totalPages = (pagination.totalPages as number) ?? 1;
    return {
      data: res.data as T[],
      pagination: {
        currentPage,
        page: currentPage,
        limit: (pagination.limit as number) ?? 10,
        total: (pagination.total as number) ?? (res.data as T[]).length,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    };
  }

  if (Array.isArray(res)) {
    return {
      data: res,
      pagination: {
        currentPage: 1,
        page: 1,
        limit: res.length || 10,
        total: res.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  return {
    data: [],
    pagination: {
      currentPage: 1,
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  };
}

/** Apply parsed page data to hook state setters. */
export function applySpringPage<T>(
  response: unknown,
  setData: (data: T[]) => void,
  setPagination?: (pagination: TablePagination) => void
): ParsedSpringPage<T> {
  const parsed = parseSpringPage<T>(response);
  setData(parsed.data);
  setPagination?.({
    currentPage: parsed.pagination.page,
    totalPages: parsed.pagination.totalPages,
    total: parsed.pagination.total,
    limit: parsed.pagination.limit,
  });
  return parsed;
}
