import { Injectable } from '@angular/core';
import {
  LaboratorySortableField,
  LaboratoryViewModel,
} from '../../../../shared/models/laboratories';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type LaboratorySortLabel = 'CreatedDate' | 'TradeName' | 'LegalName' | 'Document' | 'Status';

export interface LaboratoryListFiltersState {
  tradeName: string;
  legalName: string;
  document: string;
  isActive: '' | 'true' | 'false';
}

export interface LaboratoriesListState
  extends EntityListState<
    LaboratoryViewModel,
    LaboratoryListFiltersState,
    LaboratorySortableField
  > {
  sort: ListSortState<LaboratorySortableField> & { label: LaboratorySortLabel };
}

@Injectable({ providedIn: 'root' })
export class LaboratoriesStateService extends EntityListStateService<
  LaboratoryViewModel,
  LaboratoryListFiltersState,
  LaboratorySortableField
> {
  override setListState(state: LaboratoriesListState): void {
    super.setListState(state);
  }

  override getListState(): LaboratoriesListState | null {
    return super.getListState() as LaboratoriesListState | null;
  }

  override cloneFilters(filters: LaboratoryListFiltersState): LaboratoryListFiltersState {
    return { ...filters };
  }
}
