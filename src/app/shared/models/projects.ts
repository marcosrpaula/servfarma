import { ListRequestParams } from './api/base-view.model';
import { LaboratorySimpleViewModel } from './laboratories';

export interface ServiceTypeViewModel {
  id: number;
  name: string;
}

export interface StockConfigurationViewModel {
  mainStock: string;
  kitStock: string;
  sampleStock: string;
  blockedStock: string;
  blockSimilarLot: boolean;
  blockBeforeExpirationInMonths: number;
}

export interface ProjectViewModel {
  id: string;
  name: string;
  laboratory: LaboratorySimpleViewModel;
  observation?: string | null;
  emitReturnInvoice: boolean;
  emitInvoice: boolean;
  isActive: boolean;
  stock?: StockConfigurationViewModel | null;
  allowedServiceTypes: ServiceTypeViewModel[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface ProjectInput {
  name: string;
  laboratoryId: string;
  observation?: string | null;
  emitReturnInvoice: boolean;
  emitInvoice: boolean;
  stock?: StockConfigurationInput | null;
  allowedServiceTypes: number[];
  isActive: boolean;
}

export interface StockConfigurationInput {
  mainStock: string;
  kitStock: string;
  sampleStock: string;
  blockedStock: string;
  blockSimilarLot: boolean;
  blockBeforeExpirationInMonths: number;
}

export type ProjectSortableField = 'createdAt' | 'name' | 'isActive';

export interface ProjectListFilters {
  laboratoryId?: string;
  name?: string;
  isActive?: boolean;
}

export type ListProjectsParams = ListRequestParams<ProjectSortableField> & ProjectListFilters;
