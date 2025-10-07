import { Injectable } from '@angular/core';
import { UnitSortableField, UnitViewModel } from '../../../../shared/models/units';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type UnitSortLabel = 'CreatedDate' | 'Name' | 'Status';

export interface UnitListFiltersState {
  name: string;
  isActive: '' | 'true' | 'false';
}

export interface UnitsListState
  extends EntityListState<UnitViewModel, UnitListFiltersState, UnitSortableField> {
  sort: ListSortState<UnitSortableField> & { label: UnitSortLabel };
}

@Injectable({ providedIn: 'root' })
export class UnitsStateService extends EntityListStateService<
  UnitViewModel,
  UnitListFiltersState,
  UnitSortableField
> {
  override setListState(state: UnitsListState): void {
    super.setListState(state);
  }

  override getListState(): UnitsListState | null {
    return super.getListState() as UnitsListState | null;
  }

  override cloneFilters(filters: UnitListFiltersState): UnitListFiltersState {
    return { ...filters };
  }
}
