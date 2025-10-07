import { AuditableViewModel, ListRequestParams } from './api/base-view.model';

export interface RoleViewModel {
  id: string;
  name: string;
  description: string;
}

export interface UserViewModel extends AuditableViewModel {
  // opcionalmente presente na listagem
  permissions?: RoleViewModel[];
  name: string;
  email: string;
  isActive: boolean;
  createdBy: string;
}

export interface UserDetailsViewModel extends UserViewModel {
  permissions: RoleViewModel[];
}

export type UserSortableField = 'createdAt' | 'name' | 'email' | 'isActive';

export interface UserListFilters {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export type ListUsersParams = ListRequestParams<UserSortableField> & UserListFilters;
