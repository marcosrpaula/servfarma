import { ListRequestParams } from './api/base-view.model';

export interface PharmaceuticalFormViewModel {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface PharmaceuticalFormDetailsViewModel extends PharmaceuticalFormViewModel {}

export type PharmaceuticalFormSortableField = 'created_at' | 'name' | 'is_active';

export interface PharmaceuticalFormListFilters {
  name?: string;
  isActive?: boolean;
}

export type ListPharmaceuticalFormsParams = ListRequestParams<PharmaceuticalFormSortableField> &
  PharmaceuticalFormListFilters;
