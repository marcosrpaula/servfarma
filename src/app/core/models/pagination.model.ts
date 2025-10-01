export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sort?: SortState;
}

export interface SortState {
  active: string;
  direction: 'asc' | 'desc';
}
