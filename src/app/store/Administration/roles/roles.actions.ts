import { createAction, props } from '@ngrx/store';
import { Role } from 'src/app/core/models/role.model';

export const loadRoles = createAction('[Roles] Load Roles');
export const loadRolesSuccess = createAction('[Roles] Load Roles Success', props<{ roles: Role[] }>());
export const loadRolesFailure = createAction('[Roles] Load Roles Failure', props<{ error: string }>());
