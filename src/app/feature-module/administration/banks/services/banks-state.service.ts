import { Injectable } from '@angular/core';
import {
  BankListFilterState,
  BankSortableField,
  BankViewModel,
} from '../../../../shared/models/banks';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type BankSortLabel = 'CreatedDate' | 'Name' | 'Code' | 'Status';

export interface BanksListState
  extends EntityListState<BankViewModel, BankListFilterState, BankSortableField> {
  sort: ListSortState<BankSortableField> & { label: BankSortLabel };
}

@Injectable({ providedIn: 'root' })
export class BanksStateService extends EntityListStateService<
  BankViewModel,
  BankListFilterState,
  BankSortableField
> {
  override setListState(state: BanksListState): void {
    super.setListState(state);
  }

  override getListState(): BanksListState | null {
    return super.getListState() as BanksListState | null;
  }

  override cloneFilters(filters: BankListFilterState): BankListFilterState {
    return { ...filters };
  }
}
