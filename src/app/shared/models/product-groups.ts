import { ListRequestParams } from './api/base-view.model';

export interface ProductGroupViewModel {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface ProductGroupDetailsViewModel extends ProductGroupViewModel {}

export type ProductGroupSortableField = 'createdAt' | 'name' | 'isActive';

export interface ProductGroupListFilters {
  name?: string;
  isActive?: boolean;
}

export type ListProductGroupsParams = ListRequestParams<ProductGroupSortableField> &
  ProductGroupListFilters;
