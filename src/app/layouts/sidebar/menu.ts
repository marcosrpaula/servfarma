import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'Menu',
    isTitle: true
  },
  {
    id: 2,
    label: 'Starter',
    link: '/starter'
  },
  {
    id: 3,
    label: 'Gestão',
    icon: 'ri-settings-4-line',
    isCollapsed: true,
    permission: 'user:read',
    subItems: [
      {
        id: 31,
        label: 'Usuários',
        link: '/gestao/usuarios',
        permission: 'user:read'
      },
      {
        id: 32,
        label: 'Perfis',
        link: '/gestao/roles',
        permission: 'role:read'
      }
    ]
  }
];
