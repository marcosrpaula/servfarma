import { createReducer, on } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { PaginationMeta, SortState } from 'src/app/core/models/pagination.model';
import { UserAccount, UserFilters } from 'src/app/core/models/user.model';
import * as UsersActions from './users.actions';

export interface UsersState {
  users: UserAccount[];
  loading: boolean;
  mutationLoading: boolean;
  error: string | null;
  mutationError: string | null;
  filters: UserFilters;
  pagination: PaginationMeta;
  sort: SortState;
  selectedUserId: string | null;
}

const defaultFilters: UserFilters = {
  search: '',
  status: 'all',
  roles: [],
};

const initialState: UsersState = {
  users: [],
  loading: false,
  mutationLoading: false,
  error: null,
  mutationError: null,
  filters: { ...defaultFilters },
  pagination: {
    page: 1,
    pageSize: environment.api.defaultPageSize,
    totalItems: 0,
    totalPages: 0,
  },
  sort: {
    active: 'createdAt',
    direction: 'desc',
  },
  selectedUserId: null,
};

function mergeFilters(stateFilters: UserFilters, newFilters: Partial<UserFilters>): UserFilters {
  return {
    ...stateFilters,
    ...newFilters,
    roles: newFilters.roles !== undefined ? [...newFilters.roles] : stateFilters.roles,
  };
}

function upsertUser(users: UserAccount[], user: UserAccount): UserAccount[] {
  const index = users.findIndex((item) => item.id === user.id);
  if (index === -1) {
    return [user, ...users];
  }
  const updated = [...users];
  updated[index] = { ...users[index], ...user };
  return updated;
}

export const usersReducer = createReducer(
  initialState,
  on(UsersActions.initUsersPage, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UsersActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UsersActions.loadUsersSuccess, (state, { users, pagination }) => ({
    ...state,
    users: users ?? [],
    loading: false,
    error: null,
    pagination,
  })),
  on(UsersActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(UsersActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: mergeFilters(state.filters, filters),
    pagination: {
      ...state.pagination,
      page: 1,
    },
  })),
  on(UsersActions.resetFilters, (state) => ({
    ...state,
    filters: { ...defaultFilters },
    pagination: {
      ...state.pagination,
      page: 1,
    },
  })),
  on(UsersActions.setPagination, (state, { page, pageSize }) => ({
    ...state,
    pagination: {
      ...state.pagination,
      page,
      pageSize: pageSize ?? state.pagination.pageSize,
    },
  })),
  on(UsersActions.setSort, (state, { sort }) => ({
    ...state,
    sort: { ...sort },
  })),
  on(UsersActions.createUser, (state) => ({
    ...state,
    mutationLoading: true,
    mutationError: null,
  })),
  on(UsersActions.createUserSuccess, (state, { user }) => ({
    ...state,
    users: upsertUser(state.users, user),
    mutationLoading: false,
    mutationError: null,
  })),
  on(UsersActions.createUserFailure, (state, { error }) => ({
    ...state,
    mutationLoading: false,
    mutationError: error,
  })),
  on(UsersActions.updateUser, (state) => ({
    ...state,
    mutationLoading: true,
    mutationError: null,
  })),
  on(UsersActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    users: upsertUser(state.users, user),
    mutationLoading: false,
    mutationError: null,
  })),
  on(UsersActions.updateUserFailure, (state, { error }) => ({
    ...state,
    mutationLoading: false,
    mutationError: error,
  })),
  on(UsersActions.updateUserStatus, (state) => ({
    ...state,
    mutationLoading: true,
    mutationError: null,
  })),
  on(UsersActions.updateUserStatusSuccess, (state, { user }) => ({
    ...state,
    users: upsertUser(state.users, user),
    mutationLoading: false,
    mutationError: null,
  })),
  on(UsersActions.updateUserStatusFailure, (state, { error }) => ({
    ...state,
    mutationLoading: false,
    mutationError: error,
  })),
  on(UsersActions.selectUser, (state, { userId }) => ({
    ...state,
    selectedUserId: userId,
  }))
);
