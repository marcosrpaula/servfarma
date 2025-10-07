import { Injectable } from '@angular/core';
import { SimpleItemViewModel, SupplySortableField } from '../../../../shared/models/supplies';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type SupplySortLabel = 'CreatedDate' | 'Name' | 'Status';

export interface SupplyListFiltersState {
  name: string;
  isActive: '' | 'true' | 'false';
}

export interface SuppliesListState
  extends EntityListState<SimpleItemViewModel, SupplyListFiltersState, SupplySortableField> {
  sort: ListSortState<SupplySortableField> & { label: SupplySortLabel };
}

@Injectable({ providedIn: 'root' })
export class SuppliesStateService extends EntityListStateService<
  SimpleItemViewModel,
  SupplyListFiltersState,
  SupplySortableField
> {
  override setListState(state: SuppliesListState): void {
    super.setListState(state);
  }

  override getListState(): SuppliesListState | null {
    return super.getListState() as SuppliesListState | null;
  }

  override cloneFilters(filters: SupplyListFiltersState): SupplyListFiltersState {
    return { ...filters };
  }
}
