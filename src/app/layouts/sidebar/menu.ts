import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'Navegação',
    isTitle: true,
  },
  {
    id: 2,
    label: 'Dashboard',
    icon: 'ri-dashboard-2-line',
    link: '/',
  },
  {
    id: 3,
    label: 'Administração',
    icon: 'ri-settings-3-line',
    isCollapsed: true,
    subItems: [
      { id: 301, label: 'Bancos', link: '/banks', parentId: 3 },
      { id: 302, label: 'Laboratórios', link: '/laboratories', parentId: 3 },
      { id: 303, label: 'Transportadoras', link: '/courier-companies', parentId: 3 },
      { id: 304, label: 'Entregadores', link: '/couriers', parentId: 3 },
      { id: 305, label: 'Unidades de Devolução', link: '/return-units', parentId: 3 },
      { id: 306, label: 'Projetos', link: '/projects', parentId: 3 },
      { id: 307, label: 'Insumos', link: '/supplies', parentId: 3 },
      { id: 308, label: 'Formas Farmacêuticas', link: '/pharmaceutical-forms', parentId: 3 },
      { id: 309, label: 'Unidades de Medida', link: '/units', parentId: 3 },
    ],
  },
  {
    id: 4,
    label: 'Usuários',
    icon: 'ri-user-settings-line',
    isCollapsed: true,
    subItems: [
      { id: 401, label: 'Usuários', link: '/user-management/users', parentId: 4 },
      { id: 402, label: 'Perfis & Permissões', link: '/user-management/roles-permissions', parentId: 4 },
    ],
  },
];
