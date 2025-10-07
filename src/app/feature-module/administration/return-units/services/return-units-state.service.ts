import { Injectable } from '@angular/core';
import {
  ReturnUnitSortableField,
  ReturnUnitViewModel,
} from '../../../../shared/models/return-units';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type ReturnUnitSortLabel = 'CreatedDate' | 'Name' | 'Status';

export interface ReturnUnitListFiltersState {
  name: string;
  laboratoryId: string;
  isActive: '' | 'true' | 'false';
}

export interface ReturnUnitsListState
  extends EntityListState<
    ReturnUnitViewModel,
    ReturnUnitListFiltersState,
    ReturnUnitSortableField
  > {
  sort: ListSortState<ReturnUnitSortableField> & { label: ReturnUnitSortLabel };
}

@Injectable({ providedIn: 'root' })
export class ReturnUnitsStateService extends EntityListStateService<
  ReturnUnitViewModel,
  ReturnUnitListFiltersState,
  ReturnUnitSortableField
> {
  override setListState(state: ReturnUnitsListState): void {
    super.setListState(state);
  }

  override getListState(): ReturnUnitsListState | null {
    return super.getListState() as ReturnUnitsListState | null;
  }

  override cloneFilters(filters: ReturnUnitListFiltersState): ReturnUnitListFiltersState {
    return { ...filters };
  }
}
