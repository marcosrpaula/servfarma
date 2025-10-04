export interface EntityIdentifier {
  id: string;
}

export interface AuditMetadata {
  createdAt: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface AuditableViewModel extends EntityIdentifier, AuditMetadata {}

export type SortableKeys<T> = Extract<keyof T, string>;

export interface ListRequestParams<TOrderBy extends string = string> {
  page?: number;
  pageSize?: number;
  orderBy?: TOrderBy;
  ascending?: boolean;
}
