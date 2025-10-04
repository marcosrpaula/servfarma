import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { routes } from '../routes/routes';
import {
  MainMenu,
  Menu,
  SideBar,
  SideBarMenu,
  SubMenu,
  SubMenu2,
  SubMenuTwo,
} from '../models/models';
import { AccessControlService } from '../../core/access-control/access-control.service';
import { PermissionRequirement } from '../../core/access-control/access-control.types';

type Permission = PermissionRequirement | PermissionRequirement[];

interface PermissionAwareSidebarSubMenu extends SubMenu {
  requiredPermission?: Permission;
}

interface PermissionAwareSidebarMenu extends SideBarMenu {
  requiredPermission?: Permission;
  subMenus: PermissionAwareSidebarSubMenu[];
}

interface PermissionAwareSidebarSection extends Omit<SideBar, 'menu'> {
  menu: PermissionAwareSidebarMenu[];
}

interface PermissionAwareHorizontalSubMenu extends SubMenu2 {
  requiredPermission?: Permission;
}

interface PermissionAwareHorizontalSubMenuTwo extends SubMenuTwo {
  requiredPermission?: Permission;
}

interface PermissionAwareHorizontalMenu extends Menu {
  requiredPermission?: Permission;
  subMenus?: PermissionAwareHorizontalSubMenu[];
  subMenusTwo?: PermissionAwareHorizontalSubMenuTwo[];
}

interface PermissionAwareHorizontalSection extends Omit<MainMenu, 'menu'> {
  menu: PermissionAwareHorizontalMenu[];
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private collapseSubject = new BehaviorSubject<boolean>(false);
  collapse$ = this.collapseSubject.asObservable();

  toggleCollapse(): void {
    this.collapseSubject.next(!this.collapseSubject.value);
  }

  constructor(private access: AccessControlService) {
    this.access.ready$.subscribe((ready) => {
      if (ready) {
        this.refreshSidebarData();
      }
    });

    this.access.permissions$.subscribe(() => {
      if (this.access.isReady()) {
        this.refreshSidebarData();
      }
    });
  }

  private readonly adminSidebarTemplate: PermissionAwareSidebarSection[] = [
    {
      tittle: 'Administração',
      icon: 'settings',
      showAsTab: true,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Dashboard',
          route: routes.index,
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'smart-home',
          base: 'dashboard',
          subMenus: [],
          requiredPermission: { module: 'dashboard', level: 'read' },
        },
        {
          menuValue: 'Bancos',
          route: routes.banks,
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'building-bank',
          base: 'banks',
          subMenus: [],
          requiredPermission: { module: 'banks', level: 'read' },
        },
        {
          menuValue: 'Laboratórios',
          route: routes.laboratories,
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'flask',
          base: 'laboratories',
          subMenus: [],
          requiredPermission: { module: 'laboratories', level: 'read' },
        },
        {
          menuValue: 'Transportadoras',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'truck',
          base: 'courier-companies',
          subMenus: [
            {
              menuValue: 'Transportadoras',
              route: routes.courierCompanies,
              base: 'courier-companies',
              requiredPermission: { module: 'couriers', level: 'read' },
            },
          ],
          requiredPermission: { module: 'couriers', level: 'read' },
        },
        {
          menuValue: 'Entregadores',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'user-check',
          base: 'couriers',
          subMenus: [
            {
              menuValue: 'Entregadores',
              route: routes.couriers,
              base: 'couriers',
              requiredPermission: { module: 'couriers', level: 'read' },
            },
          ],
          requiredPermission: { module: 'couriers', level: 'read' },
        },
        {
          menuValue: 'Unidades de Devolução',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'building',
          base: 'return-units',
          subMenus: [
            {
              menuValue: 'Unidades de Devolucao',
              route: routes.returnUnits,
              base: 'return-units',
              requiredPermission: { module: 'return-units', level: 'read' },
            },
          ],
          requiredPermission: { module: 'return-units', level: 'read' },
        },
        {
          menuValue: 'Projetos',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'layers',
          base: 'projects',
          subMenus: [
            {
              menuValue: 'Projetos',
              route: routes.projects,
              base: 'projects',
              requiredPermission: { module: 'projects', level: 'read' },
            },
          ],
          requiredPermission: { module: 'projects', level: 'read' },
        },
        {
          menuValue: 'Gestão de Usuários',
          base: 'user-management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'user-star',
          subMenus: [
            {
              menuValue: 'Usuários',
              route: routes.users,
              base: 'users',
              requiredPermission: { module: 'users', level: 'read' },
            },
            {
              menuValue: 'Permissões',
              route: routes.rolesPermissions,
              base: 'roles-permissions',
              requiredPermission: { module: 'user', level: 'read' },
            },
          ],
        },
      ],
    },
    {
      tittle: 'Catálogos',
      icon: 'books',
      showAsTab: true,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Formas Farmacêuticas',
          route: routes.pharmaceuticalForms,
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'clipboard-list',
          base: 'pharmaceutical-forms',
          subMenus: [],
          requiredPermission: { module: 'pharmaceutical-forms', level: 'read' },
        },
        {
          menuValue: 'Unidades',
          route: routes.unitsCatalog,
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'ruler',
          base: 'units',
          subMenus: [],
          requiredPermission: { module: 'units', level: 'read' },
        },
        {
          menuValue: 'Suprimentos',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'package',
          base: 'supplies',
          subMenus: [
            {
              menuValue: 'Suprimentos',
              route: routes.supplies,
              base: 'supplies',
              requiredPermission: { module: 'supplies', level: 'read' },
            },
          ],
          requiredPermission: { module: 'supplies', level: 'read' },
        },
      ],
    }
  ];

  private readonly adminHorizontalTemplate: PermissionAwareHorizontalSection[] = [
    {
      title: 'Administração',
      showAsTab: false,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Dashboard',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'smart-home',
          base: 'dashboard',
          subMenus: [
            {
              menuValue: 'Admin Dashboard',
              route: routes.index,
              base: 'index',
              requiredPermission: { module: 'dashboard', level: 'read' },
            },
          ],
          requiredPermission: { module: 'dashboard', level: 'read' },
        },
        {
          menuValue: 'Bancos',
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'building-bank',
          base: 'banks',
          subMenus: [],
          requiredPermission: { module: 'banks', level: 'read' },
        },
        {
          menuValue: 'Laboratórios',
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'flask',
          base: 'laboratories',
          subMenus: [],
          requiredPermission: { module: 'laboratories', level: 'read' },
        },
        {
          menuValue: 'Transportadoras',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'truck',
          base: 'courier-companies',
          subMenus: [
            {
              menuValue: 'Transportadoras',
              route: routes.courierCompanies,
              base: 'courier-companies',
              requiredPermission: { module: 'couriers', level: 'read' },
            },
          ],
          requiredPermission: { module: 'couriers', level: 'read' },
        },
        {
          menuValue: 'Entregadores',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'user-check',
          base: 'couriers',
          subMenus: [
            {
              menuValue: 'Entregadores',
              route: routes.couriers,
              base: 'couriers',
              requiredPermission: { module: 'couriers', level: 'read' },
            },
          ],
          requiredPermission: { module: 'couriers', level: 'read' },
        },
        {
          menuValue: 'Unidades de Devolução',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'building',
          base: 'return-units',
          subMenus: [
            {
              menuValue: 'Unidades de Devolução',
              route: routes.returnUnits,
              base: 'return-units',
              requiredPermission: { module: 'return-units', level: 'read' },
            },
          ],
          requiredPermission: { module: 'return-units', level: 'read' },
        },
        {
          menuValue: 'Projetos',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'layers',
          base: 'projects',
          subMenus: [
            {
              menuValue: 'Projetos',
              route: routes.projects,
              base: 'projects',
              requiredPermission: { module: 'projects', level: 'read' },
            },
          ],
          requiredPermission: { module: 'projects', level: 'read' },
        },
        {
          menuValue: 'Gestão de Usuários',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'user-star',
          base: 'user-management',
          subMenus: [
            {
              menuValue: 'Usuários',
              route: routes.users,
              base: 'users',
              requiredPermission: { module: 'users', level: 'read' },
            },
            {
              menuValue: 'Permissões',
              route: routes.rolesPermissions,
              base: 'roles-permissions',
              requiredPermission: { module: 'user', level: 'read' },
            },
          ],
        },
      ],
    },
    {
      title: 'Catálogos',
      showAsTab: false,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Formas Farmacêuticas',
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'clipboard-list',
          base: 'pharmaceutical-forms',
          subMenus: [],
          requiredPermission: { module: 'pharmaceutical-forms', level: 'read' },
        },
        {
          menuValue: 'Suprimentos',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'package',
          base: 'supplies',
          subMenus: [
            {
              menuValue: 'Suprimentos',
              route: routes.supplies,
              base: 'supplies',
              requiredPermission: { module: 'supplies', level: 'read' },
            },
          ],
          requiredPermission: { module: 'supplies', level: 'read' },
        },
        {
          menuValue: 'Unidades',
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'ruler',
          base: 'units',
          subMenus: [],
          requiredPermission: { module: 'units', level: 'read' },
        },
      ],
    }
  ];

  public sideBar: SideBar[] = [];
  public horizontalSidebar: MainMenu[] = [];

  public readonly getSideBarData = new BehaviorSubject<SideBar[]>([]);
  public readonly getSideBarData2 = new BehaviorSubject<SideBar[]>([]);
  public readonly getSideBarData3 = new BehaviorSubject<MainMenu[]>([]);

  public resetData(): void {
    this.refreshSidebarData();
  }

  public resetData2(): void {
    this.refreshSidebarData();
  }

  public resetData3(): void {
    this.refreshSidebarData();
  }

  private refreshSidebarData(): void {
    const sidebar = this.prepareSidebar(this.adminSidebarTemplate);
    const horizontal = this.prepareHorizontal(this.adminHorizontalTemplate);

    this.sideBar = sidebar;
    this.horizontalSidebar = horizontal;

    this.getSideBarData.next(this.cloneSideBar(sidebar));
    this.getSideBarData2.next(this.cloneSideBar(sidebar));
    this.getSideBarData3.next(this.cloneMainMenu(horizontal));
  }

  private prepareSidebar(sections: PermissionAwareSidebarSection[]): SideBar[] {
    return sections
      .map((section) => this.prepareSidebarSection(section))
      .filter((section): section is SideBar => !!section);
  }

  private prepareSidebarSection(section: PermissionAwareSidebarSection): SideBar | null {
    const menus = section.menu
      .map((menu) => this.prepareSidebarMenu(menu))
      .filter((menu): menu is SideBarMenu => !!menu);

    if (!menus.length) {
      return null;
    }

    const { menu: _ignored, ...rest } = section;
    return {
      ...rest,
      menu: menus,
    };
  }

  private prepareSidebarMenu(menu: PermissionAwareSidebarMenu): SideBarMenu | null {
    const subMenus = (menu.subMenus ?? [])
      .map((sub) => this.prepareSidebarSubMenu(sub))
      .filter((sub): sub is SubMenu => !!sub);

    const canSeeMenu = !menu.requiredPermission || this.access.canAny(menu.requiredPermission);
    const hasVisibleChildren = subMenus.length > 0;

    if (!canSeeMenu && !hasVisibleChildren) {
      return null;
    }

    if (menu.hasSubRoute && !hasVisibleChildren) {
      return null;
    }

    const { requiredPermission: _ignored, subMenus: _originalSubs, ...rest } = menu;

    return {
      ...rest,
      hasSubRoute: hasVisibleChildren,
      showSubRoute: hasVisibleChildren ? rest.showSubRoute ?? false : false,
      subMenus,
    };
  }

  private prepareSidebarSubMenu(subMenu: PermissionAwareSidebarSubMenu): SubMenu | null {
    if (subMenu.requiredPermission && !this.access.canAny(subMenu.requiredPermission)) {
      return null;
    }

    const { requiredPermission: _ignored, ...rest } = subMenu;
    return { ...rest };
  }

  private prepareHorizontal(sections: PermissionAwareHorizontalSection[]): MainMenu[] {
    return sections
      .map((section) => this.prepareHorizontalSection(section))
      .filter((section): section is MainMenu => !!section);
  }

  private prepareHorizontalSection(section: PermissionAwareHorizontalSection): MainMenu | null {
    const menus = section.menu
      .map((menu) => this.prepareHorizontalMenu(menu))
      .filter((menu): menu is Menu => !!menu);

    if (!menus.length) {
      return null;
    }

    const { menu: _ignored, ...rest } = section;
    return {
      ...rest,
      menu: menus,
    };
  }

  private prepareHorizontalMenu(menu: PermissionAwareHorizontalMenu): Menu | null {
    const subMenus = (menu.subMenus ?? [])
      .map((sub) => this.prepareHorizontalSubMenu(sub))
      .filter((sub): sub is SubMenu2 => !!sub);

    const subMenusTwo = (menu.subMenusTwo ?? [])
      .map((sub) => this.prepareHorizontalSubMenuTwo(sub))
      .filter((sub): sub is SubMenuTwo => !!sub);

    const canSeeMenu = !menu.requiredPermission || this.access.canAny(menu.requiredPermission);
    const hasVisibleChildren = subMenus.length > 0 || subMenusTwo.length > 0;

    if (!canSeeMenu && !hasVisibleChildren) {
      return null;
    }

    if ((menu.hasSubRoute || menu.hasSubRouteTwo) && !hasVisibleChildren) {
      return null;
    }

    const { requiredPermission: _ignored, subMenus: _unusedSubMenus, subMenusTwo: _unusedSubMenusTwo, ...rest } = menu;

    return {
      ...rest,
      hasSubRoute: menu.hasSubRoute && hasVisibleChildren,
      hasSubRouteTwo: menu.hasSubRouteTwo && subMenusTwo.length > 0,
      showSubRoute: hasVisibleChildren ? rest.showSubRoute ?? false : false,
      subMenus: subMenus.length ? subMenus : undefined,
      subMenusTwo: subMenusTwo.length ? subMenusTwo : undefined,
    };
  }

  private prepareHorizontalSubMenu(subMenu: PermissionAwareHorizontalSubMenu): SubMenu2 | null {
    if (subMenu.requiredPermission && !this.access.canAny(subMenu.requiredPermission)) {
      return null;
    }

    const { requiredPermission: _ignored, ...rest } = subMenu;
    return { ...rest };
  }

  private prepareHorizontalSubMenuTwo(subMenu: PermissionAwareHorizontalSubMenuTwo): SubMenuTwo | null {
    if (subMenu.requiredPermission && !this.access.canAny(subMenu.requiredPermission)) {
      return null;
    }

    const { requiredPermission: _ignored, ...rest } = subMenu;
    return { ...rest };
  }

  private cloneSideBar(data: SideBar[]): SideBar[] {
    return data.map((section) => ({
      ...section,
      menu: section.menu.map((menuItem) => ({
        ...menuItem,
        subMenus: menuItem.subMenus.map((subMenu) => ({ ...subMenu })),
      })),
    }));
  }

  private cloneMainMenu(data: MainMenu[]): MainMenu[] {
    return data.map((section) => ({
      ...section,
      menu: section.menu.map((menuItem) => ({
        ...menuItem,
        subMenus: menuItem.subMenus?.map((subMenu) => ({ ...subMenu })),
        subMenusTwo: menuItem.subMenusTwo?.map((subMenu) => ({ ...subMenu })),
      })),
    }));
  }
}






