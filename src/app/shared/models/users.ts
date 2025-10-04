export interface RoleViewModel {
  id: string;
  name: string;
  description: string;
}

export interface UserViewModel {
  // opcionalmente presente na listagem
  permissions?: RoleViewModel[];
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface UserDetailsViewModel extends UserViewModel {
  permissions: RoleViewModel[];
}