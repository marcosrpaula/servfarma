import { Component } from '@angular/core';
import { MainMenu, Menu } from '../../../shared/models/models';
import { DataService } from '../../../shared/data/data.service';
import { CommonService } from '../../../shared/common/common.service';
import { NavigationEnd, Router } from '@angular/router';
import { SideBarService } from '../../../shared/side-bar/side-bar.service';
import { routes } from '../../../shared/routes/routes';
import { KeycloakAuthService } from '../../../auth/keycloak/keycloak.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  styleUrl: './default-header.component.scss',
  standalone: false,
})
export class DefaultHeaderComponent {
  showSubMenusTab = true;
  openMenuItem: any = null;
  openSubmenuOneItem: any = null;
  base = 'dashboard';
  public page = '';
  last = '';
  public routes = routes;
  public miniSidebar = false;
  public baricon = false;
  side_bar_data: MainMenu[] = [];
  userName = '';
  userEmail = '';
  private detachAuthListener?: () => void;
  constructor(
    private data: DataService,
    private sideBar: SideBarService,
    private common: CommonService,
    private router: Router,
    private auth: KeycloakAuthService,
  ) {
    this.common.base.subscribe((res: string) => {
      this.base = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.page.subscribe((res: string) => {
      this.last = res;
    });
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res === 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
    router.events.subscribe((event: object) => {
      if (event instanceof NavigationEnd) {
        const splitVal = event.url.split('/');
        this.base = splitVal[1];
        this.page = splitVal[2];
        if (
          this.base === 'components' ||
          this.page === 'tasks' ||
          this.page === 'email'
        ) {
          this.baricon = false;
          localStorage.setItem('baricon', 'false');
        } else {
          this.baricon = true;
          localStorage.setItem('baricon', 'true');
        }
      }
    });
    if (localStorage.getItem('baricon') == 'true') {
      this.baricon = true;
    } else {
      this.baricon = false;
    }
    // get sidebar data as observable because data is controlled for design to expand submenus
    this.data.getSideBarData3.subscribe((res: MainMenu[]) => {
      this.side_bar_data = res;
    });

    this.detachAuthListener = this.auth.onAuthStateChanged(() =>
      this.updateUserProfile(),
    );
    this.updateUserProfile();
  }

  public toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
  }

  elem = document.documentElement;

  fullscreen(): void {
    if (!document.fullscreenElement) {
      this.elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  public togglesMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
  }

  public menuToggle(): void {
    this.showSubMenusTab = !this.showSubMenusTab;
  }

  public expandSubMenus(menu: Menu): void {
    sessionStorage.setItem('menuValue', menu.menuValue);
    this.side_bar_data.map((mainMenus: MainMenu) => {
      mainMenus.menu.map((resMenu: Menu) => {
        if (resMenu.menuValue === menu.menuValue) {
          menu.showSubRoute = !menu.showSubRoute;
          if (menu.showSubRoute === false) {
            sessionStorage.removeItem('menuValue');
          }
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
    this.detachAuthListener?.();
    this.data.resetData2();
  }

  miniSideBarBlur(position: string): void {
    if (position === 'over') {
      this.sideBar.expandSideBar.next(true);
    } else {
      this.sideBar.expandSideBar.next(false);
    }
  }

  miniSideBarFocus(position: string): void {
    if (position === 'over') {
      this.sideBar.expandSideBar.next(true);
    } else {
      this.sideBar.expandSideBar.next(false);
    }
  }

  public submenus = false;

  openSubmenus(): void {
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

  private updateUserProfile(): void {
    const payload = this.auth.getTokenPayload();
    const rawName = payload
      ? (payload['name'] ?? payload['preferred_username'])
      : undefined;
    const rawEmail = payload ? payload['email'] : undefined;
    this.userName = (rawName ?? '').toString().trim();
    this.userEmail = (rawEmail ?? '').toString().trim();
  }
  logout(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.auth.logout(window.location.origin);
  }
}
