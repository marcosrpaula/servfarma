import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RolesState, selectAllPermissionsFromRoles } from './roles.reducer';

export const rolesFeatureKey = 'roles';

export const selectRolesState = createFeatureSelector<RolesState>(rolesFeatureKey);
export const selectRoles = createSelector(selectRolesState, (state) => state.roles);
export const selectRolesLoading = createSelector(selectRolesState, (state) => state.loading);
export const selectRolesError = createSelector(selectRolesState, (state) => state.error);
export const selectPermissionsCatalog = createSelector(selectRoles, (roles) => selectAllPermissionsFromRoles(roles));
