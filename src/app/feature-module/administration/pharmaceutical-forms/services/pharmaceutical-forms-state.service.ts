import { Injectable } from '@angular/core';
import {
  PharmaceuticalFormSortableField,
  PharmaceuticalFormViewModel,
} from '../../../../shared/models/pharmaceutical-forms';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type PharmaceuticalFormSortLabel = 'CreatedDate' | 'Name' | 'Status';

export interface PharmaceuticalFormListFiltersState {
  name: string;
  isActive: '' | 'true' | 'false';
}

export interface PharmaceuticalFormsListState
  extends EntityListState<
    PharmaceuticalFormViewModel,
    PharmaceuticalFormListFiltersState,
    PharmaceuticalFormSortableField
  > {
  sort: ListSortState<PharmaceuticalFormSortableField> & { label: PharmaceuticalFormSortLabel };
}

@Injectable({ providedIn: 'root' })
export class PharmaceuticalFormsStateService extends EntityListStateService<
  PharmaceuticalFormViewModel,
  PharmaceuticalFormListFiltersState,
  PharmaceuticalFormSortableField
> {
  override setListState(state: PharmaceuticalFormsListState): void {
    super.setListState(state);
  }

  override getListState(): PharmaceuticalFormsListState | null {
    return super.getListState() as PharmaceuticalFormsListState | null;
  }

  override cloneFilters(
    filters: PharmaceuticalFormListFiltersState,
  ): PharmaceuticalFormListFiltersState {
    return { ...filters };
  }
}
