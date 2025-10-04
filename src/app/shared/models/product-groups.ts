export interface ProductGroupViewModel {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface ProductGroupDetailsViewModel extends ProductGroupViewModel {}
