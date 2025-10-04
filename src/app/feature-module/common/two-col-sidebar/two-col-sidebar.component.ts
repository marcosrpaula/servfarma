import { Component, OnDestroy, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { SideBar, SideBarMenu } from '../../../shared/models/models';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from '../../../shared/data/data.service';
import { SideBarService } from '../../../shared/side-bar/side-bar.service';
import { CommonService } from '../../../shared/common/common.service';

@Component({
    selector: 'app-two-col-sidebar',
    templateUrl: './two-col-sidebar.component.html',
    styleUrl: './two-col-sidebar.component.scss',
    standalone: false
})
export class TwoColSidebarComponent implements OnDestroy , OnInit{
  public routes = routes;
  showSubMenusTab = false;
  openMenuItem: any = null;
  activeMenu:any =  'Layouts';
  openSubmenuOneItem: any = null;
  base = 'dashboard';
  page = '';
  last = '';

  side_bar_data: SideBarMenu[] = [];
  constructor(
    public router: Router,
    private data: DataService,
    private sideBar: SideBarService,
    private common: CommonService
  ) {
    this.common.base.subscribe((res: string) => {
      this.base = res;
      if(this.base === 'layout-two-column') this.activeMenu = 'Layouts' ;
      this.side_bar_data.map((mainMenus: SideBarMenu) => {
        if (this.activeMenu === mainMenus.menuValue) {
          mainMenus.showMyTab = true;
        } else {
          mainMenus.showMyTab = false;
        }
      });
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.page.subscribe((res: string) => {
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

    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res === 'true' || res === 'true') this.showSubMenusTab = true;
      else this.showSubMenusTab = false;
    });
  }

  public showTabs(mainTittle: SideBarMenu): void {
    sessionStorage.setItem('menuValue2', mainTittle.menuValue);
    this.side_bar_data.map((mainMenus: SideBarMenu) => {
      if (mainTittle.menuValue === mainMenus.menuValue) {
        mainMenus.showMyTab = true;
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
  ngOnInit(): void {
    this.activeMenu = sessionStorage.getItem('menuValue2')
       this.side_bar_data.map((mainMenus: SideBarMenu) => {
            if (this.activeMenu === mainMenus.menuValue) {
              mainMenus.showMyTab = true;
            } else {
              mainMenus.showMyTab = false;
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
