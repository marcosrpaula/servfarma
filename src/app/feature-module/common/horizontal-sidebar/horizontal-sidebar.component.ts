import { Component, OnDestroy } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { MainMenu, Menu } from '../../../shared/models/models';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from '../../../shared/data/data.service';
import { SideBarService } from '../../../shared/side-bar/side-bar.service';
import { CommonService } from '../../../shared/common/common.service';

@Component({
    selector: 'app-horizontal-sidebar',
    templateUrl: './horizontal-sidebar.component.html',
    styleUrl: './horizontal-sidebar.component.scss',
    standalone: false
})
export class HorizontalSidebarComponent implements OnDestroy{
  public routes = routes;
  showSubMenusTab = true;
  openMenuItem: any = null;
  openSubmenuOneItem: any = null;
  base = 'dashboard';
  page = '';
  last = '';

  side_bar_data: MainMenu[] = [];
  constructor(
    public router: Router,
    private data: DataService,
    private sideBar: SideBarService,
    private common: CommonService
  ) {
    this.common.base.subscribe((res: string) => {
      this.base = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.last.subscribe((res: string) => {
      this.last = res;
    });
    router.events.subscribe((event: object) => {
      if (event instanceof NavigationEnd) {
        const splitVal = event.url.split('/');
        this.base = splitVal[1];
        this.page = splitVal[2];
      }
    });
    // get sidebar data as observable because data is controlled for design to expand submenus
    this.data.getSideBarData3.subscribe((res: MainMenu[]) => {
      this.side_bar_data = res;
    });

    // this.sideBar.toggleSideBar.subscribe((res: string) => {
    //   if (res === 'true' || res === 'true') this.showSubMenusTab = true;
    //   else this.showSubMenusTab = false;
    // });
  }
public menuToggle() {
  this.showSubMenusTab = !this.showSubMenusTab;
}
public expandSubMenus(menu: Menu): void {
  sessionStorage.setItem('menuValue', menu.menuValue);
  this.side_bar_data.map((mainMenus: MainMenu) => {
    mainMenus.menu.map((resMenu: Menu) => {
      // collapse other submenus which are open
      if (resMenu.menuValue === menu.menuValue) {
        menu.showSubRoute = !menu.showSubRoute;
        // if (menu.showSubRoute === false) {
        //   sessionStorage.removeItem('menuValue');
        // }
      } else {
        resMenu.showSubRoute = false;
      }
    });
  });
}
  public miniSideBarMouseHover(position: string): void {
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res === 'true' || res === 'true') {
        if (position === 'over') {
          this.sideBar.expandSideBar.next(true);
          this.showSubMenusTab = false;
        } else {
          this.sideBar.expandSideBar.next(false);
          this.showSubMenusTab = true;
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.data.resetData2();
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
  public submenus = false;
  openSubmenus() {
    this.submenus = !this.submenus;
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

