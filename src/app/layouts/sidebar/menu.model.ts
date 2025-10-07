import { PermissionInput } from '../../core/access-control/access-control.types';

export interface MenuItem {
  id?: number;
  label?: any;
  icon?: string;
  isCollapsed?: boolean;
  link?: string;
  subItems?: MenuItem[];
  isTitle?: boolean;
  badge?: any;
  parentId?: number;
  isLayout?: boolean;
  requiredPermission?: PermissionInput;
  childItem?: MenuItem[];
  collapseid?: string;
}
