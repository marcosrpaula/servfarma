export interface PermissionDirective {
  id: string;
  directive: string;
  label: string;
  description?: string;
  category?: string;
}

export interface PermissionSelection extends PermissionDirective {
  checked: boolean;
}
