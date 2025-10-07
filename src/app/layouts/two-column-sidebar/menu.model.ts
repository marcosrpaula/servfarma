import { PermissionInput } from '../../core/access-control/access-control.types';

export interface MenuItem {
  id?: number;
  label?: any;
  icon?: string;
  link?: string;
  subItems?: MenuItem[];
  isTitle?: boolean;
  badge?: any;
  parentId?: number;
  isLayout?: boolean;
  collapseid?: string;
  requiredPermission?: PermissionInput;
  isCollapsed?: boolean;
  childItem?: MenuItem[];
}
