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

export function getRecordField(record: Record<string, unknown> | null | undefined, key: string): unknown {
  if (!record || !key) return undefined;
  return record[key];
}

/** Normalize Spring Page<T> for UI hooks. */
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
