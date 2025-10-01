import { createAction, props } from '@ngrx/store';
import {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UserAccount,
  UserFilters,
} from 'src/app/core/models/user.model';
import { PaginationMeta, SortState } from 'src/app/core/models/pagination.model';

export const initUsersPage = createAction('[Users] Init Page');

export const loadUsers = createAction('[Users] Load Users');
export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ users: UserAccount[]; pagination: PaginationMeta }>()
);
export const loadUsersFailure = createAction('[Users] Load Users Failure', props<{ error: string }>());

export const setFilters = createAction('[Users] Set Filters', props<{ filters: Partial<UserFilters> }>());
export const resetFilters = createAction('[Users] Reset Filters');
export const setPagination = createAction('[Users] Set Pagination', props<{ page: number; pageSize?: number }>());
export const setSort = createAction('[Users] Set Sort', props<{ sort: SortState }>());

export const createUser = createAction('[Users] Create User', props<{ payload: CreateUserPayload }>());
export const createUserSuccess = createAction('[Users] Create User Success', props<{ user: UserAccount }>());
export const createUserFailure = createAction('[Users] Create User Failure', props<{ error: string }>());

export const updateUser = createAction('[Users] Update User', props<{ payload: UpdateUserPayload }>());
export const updateUserSuccess = createAction('[Users] Update User Success', props<{ user: UserAccount }>());
export const updateUserFailure = createAction('[Users] Update User Failure', props<{ error: string }>());

export const updateUserStatus = createAction('[Users] Update User Status', props<{ payload: UpdateUserStatusPayload }>());
export const updateUserStatusSuccess = createAction('[Users] Update User Status Success', props<{ user: UserAccount }>());
export const updateUserStatusFailure = createAction('[Users] Update User Status Failure', props<{ error: string }>());

export const selectUser = createAction('[Users] Select User', props<{ userId: string | null }>());
