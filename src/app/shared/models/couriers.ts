import { AuditableViewModel, ListRequestParams } from './api/base-view.model';
import { AddressViewModel, CityViewModel } from './addresses';
import { CourierCompanySimpleViewModel } from './courier-companies';

export interface AdValoremRuleViewModel {
  rate: number;
  minGoodsValue: number;
}

export interface CourierViewModel extends AuditableViewModel {
  name: string;
  legalName: string;
  tradeName: string;
  document: string;
  stateRegistration?: string | null;
  address: AddressViewModel;
  email?: string | null;
  phone?: string | null;
  code?: string | null;
  observation?: string | null;
  adValoremRule?: AdValoremRuleViewModel | null;
  courierCompanies: CourierCompanySimpleViewModel[];
  isActive: boolean;
}

export interface CourierWithCitiesViewModel extends CourierViewModel {
  servedCities: CityViewModel[];
}

export interface AdValoremRuleInput {
  rate: number;
  minGoodsValue: number;
}

export interface CourierInput {
  name: string;
  legalName: string;
  tradeName: string;
  document: string;
  stateRegistration?: string | null;
  address: {
    zipCode: string;
    street: string;
    number: string;
    additionalDetails?: string | null;
    referencePoint?: string | null;
    neighborhood: string;
    cityId: string;
  };
  email?: string | null;
  phone?: string | null;
  code?: string | null;
  observation?: string | null;
  adValoremRule?: AdValoremRuleInput | null;
  courierCompanyIds: string[];
  isActive: boolean;
}

export interface ServedCityInput {
  cityIds: string[];
}

export type { CourierCompanySimpleViewModel } from './courier-companies';

export type CourierSortableField = 'createdAt' | 'name' | 'isActive';

export interface CourierListFilters {
  name?: string;
  courierCompanyId?: string;
  servedCityId?: string;
  isActive?: boolean;
}

export type ListCouriersParams = ListRequestParams<CourierSortableField> & CourierListFilters;

export interface CourierListFilterState {
  name: string;
  courierCompanyId: string;
  servedCityId: string;
  isActive: '' | 'true' | 'false';
}

export const defaultCourierListFilterState: CourierListFilterState = {
  name: '',
  courierCompanyId: '',
  servedCityId: '',
  isActive: '',
};

export function normalizeCourierListFilters(filters: CourierListFilterState): CourierListFilters {
  const normalized: CourierListFilters = {};

  const trimmedName = filters.name.trim();
  if (trimmedName) {
    normalized.name = trimmedName;
  }

  const trimmedCompany = filters.courierCompanyId.trim();
  if (trimmedCompany) {
    normalized.courierCompanyId = trimmedCompany;
  }

  const trimmedServedCity = filters.servedCityId.trim();
  if (trimmedServedCity) {
    normalized.servedCityId = trimmedServedCity;
  }

  if (filters.isActive !== '') {
    normalized.isActive = filters.isActive === 'true';
  }

  return normalized;
}

