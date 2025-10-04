export interface StateSimpleViewModel {
  id: string;
  abbreviation: string;
  name: string;
}

export interface CitySimpleViewModel {
  id: string;
  name: string;
}

export interface StateViewModel extends StateSimpleViewModel {}

export interface CityViewModel extends CitySimpleViewModel {
  state: StateViewModel;
}

export interface AddressViewModel {
  zipCode: string;
  street: string;
  number: string;
  additionalDetails?: string | null;
  referencePoint?: string | null;
  neighborhood: string;
  city: CityViewModel;
}

export interface PostalAddressViewModel {
  zipCode: string;
  street: string;
  additionalDetails?: string | null;
  neighborhood: string;
  cityId: string;
  stateId: string;
}
