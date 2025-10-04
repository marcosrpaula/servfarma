import { AddressViewModel } from "./addresses";
import { LaboratorySimpleViewModel } from "./laboratories";

export interface ReturnUnitViewModel {
  id: string;
  name: string;
  document: string;
  legalName: string;
  tradeName: string;
  stateRegistration?: string | null;
  address: AddressViewModel;
  phone?: string | null;
  email?: string | null;
  laboratory: LaboratorySimpleViewModel;
  observation?: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface ReturnUnitInput {
  laboratoryId: string;
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
  phone?: string | null;
  email?: string | null;
  observation?: string | null;
  isActive: boolean;
}
