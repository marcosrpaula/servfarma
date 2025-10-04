export interface PharmaceuticalFormViewModel {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface PharmaceuticalFormDetailsViewModel extends PharmaceuticalFormViewModel {}
