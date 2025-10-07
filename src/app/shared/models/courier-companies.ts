import { AddressViewModel } from './addresses';
import { AuditableViewModel, ListRequestParams } from './api/base-view.model';

export interface CourierCompanySimpleViewModel {
  id: string;
  name: string;
}

export interface CourierCompanyViewModel extends CourierCompanySimpleViewModel, AuditableViewModel {
  document?: string | null;
  legalName?: string | null;
  stateRegistration?: string | null;
  address?: AddressViewModel | null;
  email?: string | null;
  observation?: string | null;
  printOnInvoice: boolean;
  isActive: boolean;
}

export interface CourierCompanyInput {
  name: string;
  legalName?: string | null;
  document?: string | null;
  stateRegistration?: string | null;
  address?: {
    zipCode: string;
    street: string;
    number: string;
    additionalDetails?: string | null;
    referencePoint?: string | null;
    neighborhood: string;
    cityId: string;
  } | null;
  email?: string | null;
  observation?: string | null;
  printOnInvoice: boolean;
  isActive: boolean;
}

export type CourierCompanySortableField = 'createdAt' | 'name' | 'isActive';

export interface CourierCompanyListFilters {
  name?: string;
  isActive?: boolean;
}

export type ListCourierCompaniesParams = ListRequestParams<CourierCompanySortableField> &
  CourierCompanyListFilters;

export interface CourierCompanyListFilterState extends Record<string, unknown> {
  name: string;
  isActive: '' | 'true' | 'false';
}

export const defaultCourierCompanyListFilterState: CourierCompanyListFilterState = {
  name: '',
  isActive: '',
};

export function normalizeCourierCompanyFilters(
  filters: CourierCompanyListFilterState,
): CourierCompanyListFilters {
  const normalized: CourierCompanyListFilters = {};

  const trimmedName = filters.name.trim();
  if (trimmedName) {
    normalized.name = trimmedName;
  }

  if (filters.isActive !== '') {
    normalized.isActive = filters.isActive === 'true';
  }

  return normalized;
}
