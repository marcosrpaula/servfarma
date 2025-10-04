import { AddressViewModel } from "./addresses";

export interface CourierCompanySimpleViewModel {
  id: string;
  name: string;
}

export interface CourierCompanyViewModel extends CourierCompanySimpleViewModel {
  document?: string | null;
  legalName?: string | null;
  stateRegistration?: string | null;
  address?: AddressViewModel | null;
  email?: string | null;
  observation?: string | null;
  printOnInvoice: boolean;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
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
