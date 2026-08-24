export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

function positiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;
}

function nonNegativeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : fallback;
}

export function toPaginatedResult<T>(
  items: T[] | null | undefined,
  pagination: unknown,
  requestedPage: number,
  requestedLimit: number,
): PaginatedResult<T> {
  const normalizedItems = Array.isArray(items) ? items : [];
  const record =
    pagination && typeof pagination === "object" ? (pagination as Record<string, unknown>) : {};
  const page = positiveNumber(record.page, positiveNumber(requestedPage, 1));
  const limit = positiveNumber(record.limit, positiveNumber(requestedLimit, 20));
  const total = nonNegativeNumber(record.total, normalizedItems.length);
  const totalPages = positiveNumber(record.totalPages, Math.max(1, Math.ceil(total / limit)));

  return {
    items: normalizedItems,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: typeof record.hasNextPage === "boolean" ? record.hasNextPage : page < totalPages,
      hasPrevPage: typeof record.hasPrevPage === "boolean" ? record.hasPrevPage : page > 1,
    },
  };
}
