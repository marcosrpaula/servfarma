import { Injectable } from '@angular/core';
import {
  CourierCompanyListFilterState,
  CourierCompanySortableField,
  CourierCompanyViewModel,
} from '../../../../shared/models/courier-companies';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type CourierCompanySortLabel = 'CreatedDate' | 'Name' | 'Status';

export interface CourierCompaniesListState
  extends EntityListState<
    CourierCompanyViewModel,
    CourierCompanyListFilterState,
    CourierCompanySortableField
  > {
  sort: ListSortState<CourierCompanySortableField> & { label: CourierCompanySortLabel };
}

@Injectable({ providedIn: 'root' })
export class CourierCompaniesStateService extends EntityListStateService<
  CourierCompanyViewModel,
  CourierCompanyListFilterState,
  CourierCompanySortableField
> {
  override setListState(state: CourierCompaniesListState): void {
    super.setListState(state);
  }

  override getListState(): CourierCompaniesListState | null {
    return super.getListState() as CourierCompaniesListState | null;
  }

  override cloneFilters(filters: CourierCompanyListFilterState): CourierCompanyListFilterState {
    return { ...filters };
  }
}
