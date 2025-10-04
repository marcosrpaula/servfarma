export interface BankViewModel {
  id: string;
  name: string;
  bankCode: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface BankDetailsViewModel extends BankViewModel {}

