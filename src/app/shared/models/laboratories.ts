import { ListRequestParams } from "./api/base-view.model";

export interface LaboratorySimpleViewModel {
  id: string;
  legalName: string;
  tradeName: string;
}

export interface LaboratoryViewModel {
  id: string;
  tradeName: string;
  legalName: string;
  document: string;
  observation?: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface LaboratoryDetailsViewModel extends LaboratoryViewModel {}

export type LaboratorySortableField =
  | "createdAt"
  | "tradeName"
  | "legalName"
  | "document"
  | "isActive";

export interface LaboratoryListFilters {
  tradeName?: string;
  legalName?: string;
  document?: string;
  isActive?: boolean;
}

export type ListLaboratoriesParams =
  ListRequestParams<LaboratorySortableField> & LaboratoryListFilters;
