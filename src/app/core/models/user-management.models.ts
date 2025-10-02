export interface RoleSummary {
  id: string;
  name: string;
  description?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  active: boolean;
  permissions: RoleSummary[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export interface SaveUserPayload {
  id?: string;
  name: string;
  email: string;
  active: boolean;
  permissionIds: string[];
}

export interface SaveRolePayload {
  id?: string;
  name: string;
  description?: string;
}
