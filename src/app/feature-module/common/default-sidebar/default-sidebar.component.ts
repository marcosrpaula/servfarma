import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { CommonService } from '../../../shared/common/common.service';
import { DataService } from '../../../shared/data/data.service';
import { SideBar, SideBarMenu } from '../../../shared/models/models';
import { routes } from '../../../shared/routes/routes';
import { SideBarService } from '../../../shared/side-bar/side-bar.service';

@Component({
  selector: 'app-default-sidebar',
  templateUrl: './default-sidebar.component.html',
  styleUrl: './default-sidebar.component.scss',
  standalone: false,
})
export class DefaultSidebarComponent implements OnDestroy, OnInit {
  public routes = routes;
  base = 'dashboard';
  page = '';
  last = '';
  page1 = '';
  isOpen = false;
  openMenuItem: any = null;
  openSubmenuOneItem: any = null;
  side_bar_data: SideBar[] = [];
  constructor(
    public router: Router,
    private data: DataService,
    private sideBar: SideBarService,
    private common: CommonService,
  ) {
    // get sidebar data as observable because data is controlled for design to expand submenus
    this.data.getSideBarData.subscribe((res: SideBar[]) => {
      this.side_bar_data = res;
    });
    this.common.base.subscribe((res: string) => {
      this.base = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.last.subscribe((res: string) => {
      this.last = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page1 = res;
    });
  }

  public miniSideBarMouseHover(position: string): void {
    if (position === 'over') {
      this.sideBar.expandSideBar.next(true);
    } else {
      this.sideBar.expandSideBar.next(false);
    }
  }
  public expandSubMenus(menu: SideBarMenu): void {
    this.isOpen = false;
    sessionStorage.setItem('menuValue', menu.menuValue);
    this.side_bar_data.map((mainMenus: SideBar) => {
      mainMenus.menu.map((resMenu: SideBarMenu) => {
        // collapse other submenus which are open
        if (resMenu.menuValue === menu.menuValue) {
          menu.showSubRoute = !menu.showSubRoute;
        } else {
          resMenu.showSubRoute = false;
        }
      });
    });
  }
  public expandSubMenusActive(): void {
    const activeMenu = sessionStorage.getItem('menuValue');
    if (activeMenu === null) {
      this.side_bar_data.map((mainMenus: SideBar) => {
        mainMenus.menu.map((resMenu: SideBarMenu) => {
          // collapse other submenus which are open
          if (resMenu.menuValue === 'Dashboard') {
            resMenu.showSubRoute = true;
          } else {
            resMenu.showSubRoute = false;
          }
        });
      });
      this.isOpen = true;
    } else {
      this.isOpen = false;
    }
    this.side_bar_data.map((mainMenus: SideBar) => {
      mainMenus.menu.map((resMenu: SideBarMenu) => {
        // collapse other submenus which are open
        if (resMenu.menuValue === activeMenu) {
          resMenu.showSubRoute = true;
        } else {
          resMenu.showSubRoute = false;
        }
      });
    });
  }
  ngOnInit(): void {
    this.expandSubMenusActive();
    this.router.events.subscribe((event: object) => {
      if (event instanceof NavigationStart) {
        const splitVal = event.url.split('/');
        this.base = splitVal[1];
        this.page = splitVal[2];
        this.last = splitVal[3];
        this.page1 = splitVal[4];
      }
    });
  }
  ngOnDestroy(): void {
    this.data.resetData();
  }
  miniSideBarBlur(position: string) {
    if (position === 'over') {
      this.sideBar.expandSideBar.next(true);
    } else {
      this.sideBar.expandSideBar.next(false);
    }
  }

  miniSideBarFocus(position: string) {
    if (position === 'over') {
      this.sideBar.expandSideBar.next(true);
    } else {
      this.sideBar.expandSideBar.next(false);
    }
  }
  openMenu(menu: any): void {
    if (this.openMenuItem === menu) {
      this.openMenuItem = null;
    } else {
      this.openMenuItem = menu;
    }
  }
  openSubmenuOne(subMenus: any): void {
    if (this.openSubmenuOneItem === subMenus) {
      this.openSubmenuOneItem = null;
    } else {
      this.openSubmenuOneItem = subMenus;
    }
  }
}
