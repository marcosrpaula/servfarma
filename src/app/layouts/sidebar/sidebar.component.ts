import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { environment } from 'src/environments/environment';
import { AccessControlService } from '../../core/access-control/access-control.service';
import { MENU } from './menu';
import { MenuItem } from './menu.model';

interface MenuNode extends Omit<MenuItem, 'subItems' | 'childItem' | 'isCollapsed'> {
  isCollapsed: boolean;
  subItems?: MenuNode[];
  childItem?: MenuNode[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
})
export class SidebarComponent implements OnInit {
  menu: any;
  toggle: any = true;
  menuItems: MenuNode[] = [];
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  constructor(
    private router: Router,
    public translate: TranslateService,
    private readonly access: AccessControlService,
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.rebuildMenu();
    this.access.ready$.subscribe((ready) => {
      if (ready) {
        this.rebuildMenu();
      }
    });
    this.access.permissions$.subscribe(() => {
      if (this.access.isReady()) {
        this.rebuildMenu();
      }
    });
    this.router.events.subscribe((event) => {
      if (document.documentElement.getAttribute('data-layout') != 'twocolumn') {
        if (event instanceof NavigationEnd) {
          this.initActiveMenu();
        }
      }
    });
  }

  /***
   * Activate droup down set
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.initActiveMenu();
    }, 0);
  }

  removeActivation(items: any) {
    items.forEach((item: any) => {
      item.classList.remove('active');
    });
  }

  toggleItem(item: any) {
    this.menuItems.forEach((menuItem: any) => {
      if (menuItem == item) {
        menuItem.isCollapsed = !menuItem.isCollapsed;
      } else {
        menuItem.isCollapsed = true;
      }
      if (menuItem.subItems) {
        menuItem.subItems.forEach((subItem: any) => {
          if (subItem == item) {
            menuItem.isCollapsed = !menuItem.isCollapsed;
            subItem.isCollapsed = !subItem.isCollapsed;
          } else {
            subItem.isCollapsed = true;
          }
          if (subItem.subItems) {
            subItem.subItems.forEach((childitem: any) => {
              if (childitem == item) {
                childitem.isCollapsed = !childitem.isCollapsed;
                subItem.isCollapsed = !subItem.isCollapsed;
                menuItem.isCollapsed = !menuItem.isCollapsed;
              } else {
                childitem.isCollapsed = true;
              }
              if (childitem.subItems) {
                childitem.subItems.forEach((childrenitem: any) => {
                  if (childrenitem == item) {
                    childrenitem.isCollapsed = false;
                    childitem.isCollapsed = false;
                    subItem.isCollapsed = false;
                    menuItem.isCollapsed = false;
                  } else {
                    childrenitem.isCollapsed = true;
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  activateParentDropdown(item: any) {
    item.classList.add('active');
    let parentCollapseDiv = item.closest('.collapse.menu-dropdown');

    if (parentCollapseDiv) {
      parentCollapseDiv.parentElement.children[0].classList.add('active');
      if (parentCollapseDiv.parentElement.closest('.collapse.menu-dropdown')) {
        if (parentCollapseDiv.parentElement.closest('.collapse').previousElementSibling)
          parentCollapseDiv.parentElement
            .closest('.collapse')
            .previousElementSibling.classList.add('active');
        if (
          parentCollapseDiv.parentElement
            .closest('.collapse')
            .previousElementSibling.closest('.collapse')
        ) {
          parentCollapseDiv.parentElement
            .closest('.collapse')
            .previousElementSibling.closest('.collapse')
            .previousElementSibling.classList.add('active');
        }
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = document.getElementById('navbar-nav');
    if (ul) {
      const items = Array.from(ul.querySelectorAll('a.nav-link'));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  initActiveMenu() {
    let pathName = window.location.pathname;
    // Check if the application is running in production
    if (environment.production) {
      // Modify pathName for production build
      pathName = pathName.replace('/velzon/angular/default', '');
    }

    const active = this.findMenuItem(pathName, this.menuItems);
    if (active) {
      this.toggleItem(active);
    }
    const ul = document.getElementById('navbar-nav');
    if (ul) {
      const items = Array.from(ul.querySelectorAll('a.nav-link'));
      let activeItems = items.filter((x: any) => x.classList.contains('active'));
      this.removeActivation(activeItems);

      const matchingMenuItem = items.find((x: any) => {
        const itemPath = environment.production
          ? x.pathname.replace('/velzon/angular/default', '')
          : x.pathname;
        return this.pathsMatch(itemPath, pathName);
      });
      if (matchingMenuItem) {
        this.activateParentDropdown(matchingMenuItem);
      }
    }
  }

  private findMenuItem(pathname: string, menuItems: any[]): any {
    for (const menuItem of menuItems) {
      if (menuItem.link && this.pathsMatch(menuItem.link, pathname)) {
        return menuItem;
      }

      if (menuItem.subItems) {
        const foundItem = this.findMenuItem(pathname, menuItem.subItems);
        if (foundItem) {
          return foundItem;
        }
      }
    }

    return null;
  }
  private pathsMatch(linkPath: string | undefined, currentPath: string): boolean {
    if (!linkPath) {
      return false;
    }

    const normalize = (path: string) => {
      if (!path) {
        return '/';
      }
      const trimmed = path.replace(/\/+$/, '');
      return trimmed === '' ? '/' : trimmed;
    };

    const normalizedLink = normalize(linkPath);
    const normalizedCurrent = normalize(currentPath);

    if (normalizedLink === '/') {
      return normalizedCurrent === '/';
    }

    return (
      normalizedCurrent === normalizedLink || normalizedCurrent.startsWith(normalizedLink + '/')
    );
  }

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    var sidebarsize = document.documentElement.getAttribute('data-sidebar-size');
    if (sidebarsize == 'sm-hover-active') {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    } else {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover-active');
    }
  }

  /**
   * SidebarHide modal
   * @param content modal content
   */
  SidebarHide() {
    document.body.classList.remove('vertical-sidebar-enable');
  }

  private rebuildMenu(): void {
    this.menuItems = this.filterMenuItems(MENU);
    if (document.documentElement.getAttribute('data-layout') !== 'twocolumn') {
      setTimeout(() => this.initActiveMenu(), 0);
    }
  }

  private filterMenuItems(items: MenuItem[] | undefined): MenuNode[] {
    if (!items?.length) {
      return [];
    }
    return items
      .map((item) => this.filterMenuItem(item))
      .filter((item): item is MenuNode => !!item);
  }

  private filterMenuItem(item: MenuItem): MenuNode | null {
    const visibleChildren = this.filterMenuItems(item.subItems);
    const hasVisibleChildren = visibleChildren.length > 0;
    const visibleChildItems = this.filterMenuItems(item.childItem);
    const hasVisibleChildItems = visibleChildItems.length > 0;
    const requirement = item.requiredPermission;
    const isAllowed = !requirement || (this.access.isReady() && this.access.canAny(requirement));

    if (!isAllowed && !hasVisibleChildren && !hasVisibleChildItems) {
      return null;
    }

    const { subItems, childItem, isCollapsed, ...rest } = item;
    const cloned: MenuNode = {
      ...rest,
      isCollapsed: typeof isCollapsed === 'boolean' ? isCollapsed : true,
    };

    if (hasVisibleChildren) {
      cloned.subItems = visibleChildren;
    }

    if (hasVisibleChildItems) {
      cloned.childItem = visibleChildItems;
    }

    return cloned;
  }
}
