import { AuditableViewModel, ListRequestParams } from './api/base-view.model';

export interface BankViewModel extends AuditableViewModel {
  name: string;
  bankCode: string;
  isActive: boolean;
}

export interface BankDetailsViewModel extends BankViewModel {}

export type BankSortableField = 'created_at' | 'name' | 'bank_code' | 'is_active';

export interface BankListFilters {
  name?: string;
  bankCode?: string;
  isActive?: boolean;
}

export type ListBanksParams = ListRequestParams<BankSortableField> & BankListFilters;

export interface BankListFilterState extends Record<string, unknown> {
  name: string;
  bankCode: string;
  isActive: '' | 'true' | 'false';
}

export const defaultBankListFilterState: BankListFilterState = {
  name: '',
  bankCode: '',
  isActive: '',
};

export function normalizeBankListFilters(filters: BankListFilterState): BankListFilters {
  const normalized: BankListFilters = {};

  const trimmedName = filters.name?.trim();
  if (trimmedName) {
    normalized.name = trimmedName;
  }

  const trimmedBankCode = filters.bankCode?.trim();
  if (trimmedBankCode) {
    normalized.bankCode = trimmedBankCode;
  }

  if (filters.isActive !== '') {
    normalized.isActive = filters.isActive === 'true';
  }

  return normalized;
}

export interface SaveBankPayload {
  name: string;
  bankCode: string;
  isActive: boolean;
}

export type CreateBankPayload = SaveBankPayload;
export type UpdateBankPayload = SaveBankPayload;
