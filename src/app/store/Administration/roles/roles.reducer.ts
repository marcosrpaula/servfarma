import { createReducer, on } from '@ngrx/store';
import { Role } from 'src/app/core/models/role.model';
import { PermissionDirective } from 'src/app/core/models/permission.model';
import * as RolesActions from './roles.actions';

export interface RolesState {
  roles: Role[];
  loading: boolean;
  error?: string | null;
}

export const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
};

export const rolesReducer = createReducer(
  initialState,
  on(RolesActions.loadRoles, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RolesActions.loadRolesSuccess, (state, { roles }) => ({
    ...state,
    roles,
    loading: false,
  })),
  on(RolesActions.loadRolesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);

export const selectAllPermissionsFromRoles = (roles: Role[]): PermissionDirective[] => {
  const seen = new Map<string, PermissionDirective>();
  roles.forEach((role) => {
    role.permissions?.forEach((permission) => {
      if (!seen.has(permission.id)) {
        seen.set(permission.id, permission);
      }
    });
  });
  return Array.from(seen.values());
};
