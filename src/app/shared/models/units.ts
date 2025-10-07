import { ListRequestParams } from './api/base-view.model';

export interface UnitViewModel {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface UnitDetailsViewModel extends UnitViewModel {}

export type UnitSortableField = 'created_at' | 'name' | 'is_active';

export interface UnitListFilters {
  name?: string;
  isActive?: boolean;
}

export type ListUnitsParams = ListRequestParams<UnitSortableField> & UnitListFilters;
