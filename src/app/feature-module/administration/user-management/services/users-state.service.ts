import { Injectable } from '@angular/core';
import { UserSortableField, UserViewModel } from '../../../../shared/models/users';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type UserSortLabel = 'CreatedDate' | 'Name' | 'Email' | 'Status';

export interface UserListFiltersState {
  name: string;
  email: string;
  isActive: '' | 'true' | 'false';
}

export interface UsersListState
  extends EntityListState<UserViewModel, UserListFiltersState, UserSortableField> {
  sort: ListSortState<UserSortableField> & { label: UserSortLabel };
}

@Injectable({ providedIn: 'root' })
export class UsersStateService extends EntityListStateService<
  UserViewModel,
  UserListFiltersState,
  UserSortableField
> {
  override setListState(state: UsersListState): void {
    super.setListState(state);
  }

  override getListState(): UsersListState | null {
    return super.getListState() as UsersListState | null;
  }

  override cloneFilters(filters: UserListFiltersState): UserListFiltersState {
    return { ...filters };
  }
}
