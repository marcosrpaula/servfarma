import { PermissionDirective } from './permission.model';

export interface RoleSummary {
  id: string;
  name: string;
  description?: string;
}

export interface Role extends RoleSummary {
  permissions: PermissionDirective[];
}
