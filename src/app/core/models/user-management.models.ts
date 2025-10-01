export type AccessLevel = 'none' | 'read' | 'write' | 'admin';

export interface ModuleDefinition {
  key: string;
  name: string;
  description?: string;
  category?: string;
}

export interface ModulePermissionState {
  module: ModuleDefinition;
  hasAccess: boolean;
  level: AccessLevel;
  canRead: boolean;
  canWrite: boolean;
  isAdmin: boolean;
}

export interface RoleSummary {
  id: string;
  name: string;
  description?: string;
  permissions: ModulePermissionState[];
  isSystem?: boolean;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roles: RoleSummary[];
  permissions: ModulePermissionState[];
}

export interface SavePermissionPayload {
  moduleKey: string;
  accessLevel: AccessLevel;
  hasAccess: boolean;
}

export interface SaveUserPayload {
  id?: string;
  name: string;
  email: string;
  active: boolean;
  roleIds: string[];
  permissions: SavePermissionPayload[];
}

export interface SaveRolePayload {
  id?: string;
  name: string;
  description?: string;
  permissions: SavePermissionPayload[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

export type RawPermission = any;
export type RawUser = any;
export type RawRole = any;
