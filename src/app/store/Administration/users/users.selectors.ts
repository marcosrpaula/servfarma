import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RootReducerState } from '../../index';
import { UsersState } from './users.reducer';
import { UserAccount } from 'src/app/core/models/user.model';

export const usersFeatureKey = 'userManagement';

export const selectUsersState = createFeatureSelector<RootReducerState, UsersState>(usersFeatureKey);

export const selectUsers = createSelector(selectUsersState, (state) => state.users);
export const selectUsersLoading = createSelector(selectUsersState, (state) => state.loading);
export const selectUsersMutationLoading = createSelector(selectUsersState, (state) => state.mutationLoading);
export const selectUsersError = createSelector(selectUsersState, (state) => state.error);
export const selectUsersMutationError = createSelector(selectUsersState, (state) => state.mutationError);
export const selectUsersFilters = createSelector(selectUsersState, (state) => state.filters);
export const selectUsersPagination = createSelector(selectUsersState, (state) => state.pagination);
export const selectUsersSort = createSelector(selectUsersState, (state) => state.sort);
export const selectSelectedUserId = createSelector(selectUsersState, (state) => state.selectedUserId);
export const selectSelectedUser = createSelector(
  selectUsersState,
  (state): UserAccount | null => state.users.find((user) => user.id === state.selectedUserId) ?? null
);
