export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

export function paginate<T>(items: T[], page: number, limit: number): Page<T> {
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    meta: {
      page,
      limit,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}
