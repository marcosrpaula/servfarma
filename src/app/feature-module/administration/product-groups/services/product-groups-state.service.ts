import { Injectable } from '@angular/core';
import {
  ProductGroupSortableField,
  ProductGroupViewModel,
} from '../../../../shared/models/product-groups';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type ProductGroupSortLabel = 'CreatedDate' | 'Name' | 'Status';

export interface ProductGroupListFiltersState {
  name: string;
  isActive: '' | 'true' | 'false';
}

export interface ProductGroupsListState
  extends EntityListState<
    ProductGroupViewModel,
    ProductGroupListFiltersState,
    ProductGroupSortableField
  > {
  sort: ListSortState<ProductGroupSortableField> & { label: ProductGroupSortLabel };
}

@Injectable({ providedIn: 'root' })
export class ProductGroupsStateService extends EntityListStateService<
  ProductGroupViewModel,
  ProductGroupListFiltersState,
  ProductGroupSortableField
> {
  override setListState(state: ProductGroupsListState): void {
    super.setListState(state);
  }

  override getListState(): ProductGroupsListState | null {
    return super.getListState() as ProductGroupsListState | null;
  }

  override cloneFilters(filters: ProductGroupListFiltersState): ProductGroupListFiltersState {
    return { ...filters };
  }
}
