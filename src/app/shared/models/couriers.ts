import { AddressViewModel, CityViewModel } from "./addresses";
import { CourierCompanySimpleViewModel } from "./courier-companies";

export interface AdValoremRuleViewModel {
  rate: number;
  minGoodsValue: number;
}

export interface CourierViewModel {
  id: string;
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
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
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

