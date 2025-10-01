import { PermissionDirective } from './permission.model';
import { RoleSummary } from './role.model';

export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  document?: string;
  phone?: string;
  status: UserStatus;
  roles: RoleSummary[];
  directives?: string[];
  permissions?: PermissionDirective[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFilters {
  search?: string;
  status?: UserStatus | 'all';
  roles?: string[];
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  document?: string;
  phone?: string;
  status?: UserStatus;
  roleIds: string[];
  permissionIds?: string[];
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  id: string;
}

export interface UpdateUserStatusPayload {
  id: string;
  status: UserStatus;
}
