export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Raw shape from backend (snake_case)
export interface RawPagedResult<T> {
  items: T[];
  total_count: number;
  current_page: number;
  page_size: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

export function mapRawPaged<T>(raw: RawPagedResult<T> | any): PagedResult<T> {
  // Be tolerant: accept either snake_case or camelCase
  const totalCount = raw.totalCount ?? raw.total_count ?? 0;
  const currentPage = raw.currentPage ?? raw.current_page ?? 1;
  const pageSize = raw.pageSize ?? raw.page_size ?? 0;
  const totalPages = raw.totalPages ?? raw.total_pages ?? 0;
  const hasNextPage = raw.hasNextPage ?? raw.has_next_page ?? false;
  const hasPreviousPage = raw.hasPreviousPage ?? raw.has_previous_page ?? false;
  const items = raw.items ?? [];
  return { items, totalCount, currentPage, pageSize, totalPages, hasNextPage, hasPreviousPage };
}
