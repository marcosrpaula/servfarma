import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonService } from '../../../shared/common/common.service';
import { DataService } from '../../../shared/data/data.service';
import { SideBar, SideBarMenu } from '../../../shared/models/models';
import { routes } from '../../../shared/routes/routes';
import { SideBarService } from '../../../shared/side-bar/side-bar.service';

@Component({
  selector: 'app-stacked-sidebar',
  templateUrl: './stacked-sidebar.component.html',
  styleUrl: './stacked-sidebar.component.scss',
  standalone: false,
})
export class StackedSidebarComponent implements OnDestroy {
  public routes = routes;
  showSubMenusTab = true;
  openMenuItem: any = null;
  openSubmenuOneItem: any = null;
  base = 'dashboard';
  page = '';
  last = '';

  side_bar_data: SideBarMenu[] = [];
  constructor(
    public router: Router,
    private data: DataService,
    private sideBar: SideBarService,
    private common: CommonService,
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
    this.data.getSideBarData2.subscribe((res: SideBar[]) => {
      res.map((data: SideBar) => {
        data.menu.map((menus: SideBarMenu) => {
          this.side_bar_data.push(menus);
          menus.showMyTab = false;
        });
        // this.side_bar_data[0].showMyTab = true;
      });
    });

    // this.sideBar.toggleSideBar.subscribe((res: string) => {
    //   if (res === 'true' || res === 'true') this.showSubMenusTab = true;
    //   else this.showSubMenusTab = false;
    // });
  }
  public menuToggle() {
    this.showSubMenusTab = !this.showSubMenusTab;
  }
  public showTabs(mainTittle: SideBarMenu): void {
    this.side_bar_data.map((mainMenus: SideBarMenu) => {
      if (mainTittle.menuValue === mainMenus.menuValue) {
        mainMenus.showMyTab = true;
        // this.showSubMenusTab = false
      } else {
        mainMenus.showMyTab = false;
      }
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
