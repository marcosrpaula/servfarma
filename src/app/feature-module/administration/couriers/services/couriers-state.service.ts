import { Injectable } from '@angular/core';
import {
  CourierListFilterState,
  CourierSortableField,
  CourierViewModel,
} from '../../../../shared/models/couriers';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type CourierSortLabel = 'CreatedDate' | 'Name' | 'Status';

export interface CouriersListState
  extends EntityListState<CourierViewModel, CourierListFilterState, CourierSortableField> {
  sort: ListSortState<CourierSortableField> & { label: CourierSortLabel };
}

@Injectable({ providedIn: 'root' })
export class CouriersStateService extends EntityListStateService<
  CourierViewModel,
  CourierListFilterState,
  CourierSortableField
> {
  override setListState(state: CouriersListState): void {
    super.setListState(state);
  }

  override getListState(): CouriersListState | null {
    return super.getListState() as CouriersListState | null;
  }

  override cloneFilters(filters: CourierListFilterState): CourierListFilterState {
    return { ...filters };
  }
}
