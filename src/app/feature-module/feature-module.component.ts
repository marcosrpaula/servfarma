import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonService } from '../shared/common/common.service';
import { GlobalLoaderService } from '../shared/common/global-loader.service';
import { DataService } from '../shared/data/data.service';
import { SettingService } from '../shared/settings/settings.service';
import { SideBarService } from '../shared/side-bar/side-bar.service';

@Component({
  selector: 'app-feature-module',
  templateUrl: './feature-module.component.html',
  styleUrl: './feature-module.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class FeatureModuleComponent implements OnInit {
  base = '';
  page = '';
  last = '';
  public miniSidebar = false;
  public expandMenu = false;
  public mobileSidebar = false;
  layoutMode = '1';
  layoutWidth = '1';
  sidebarSize = '1';
  topbarColor = 'white';
  primaryColor = '1';
  withoutWrapperPagesArray = [
    'login',
    'login-2',
    'login-3',
    'register',
    'register-2',
    'register-3',
    'forgot-password',
    'forgot-password-2',
    'forgot-password-3',
    'reset-password',
    'reset-password-2',
    'reset-password-3',
    'email-verification',
    'email-verification-2',
    'email-verification-3',
    'two-step-verification',
    'two-step-verification-2',
    'two-step-verification-3',
    'success',
    'success-2',
    'success-3',
    'under-construction',
    'under-maintenance',
    'coming-soon',
    'lock-screen',
    'error-404',
    'error-500',
  ];
  withoutLayoutArray = [
    'layout-horizontal',
    'layout-hovered',
    'layout-detached',
    'layout-horizontal-overlay',
    'layout-horizontal-single',
    'layout-two-column',
    'layout-modern',
    'layout-without-header',
    'layout-vertical-transparent',
    'layout-horizontal-sidemenu',
    'layout-horizontal-box',
    'layout-dark',
    'layout-box',
    'layout-rtl',
  ];
  withoutWrapperPages: boolean | null = false;
  withoutLayouts: boolean | null = false;
  showPreloader = false;
  showPreloaderState = '';
  private manualPreloaderActive = false;
  private routeLoaderTimeout?: ReturnType<typeof setTimeout>;
  selectedColor = '84, 109, 254, 1';
  selectedColor1 = '555, 555, 555, 1';
  horizontalColor = '555, 555, 555, 1';
  dthemeColor = '84, 109, 254, 1';
  constructor(
    private common: CommonService,
    public settings: SettingService,
    private data: DataService,
    private sideBar: SideBarService,
    private globalLoader: GlobalLoaderService,
  ) {
    this.settings.isLoader.subscribe((res: string) => {
      this.showPreloaderState = res;
      if (!this.manualPreloaderActive) {
        this.triggerRoutePreloader();
      }
    });
    this.globalLoader.isVisible$.subscribe((visible: boolean) => {
      this.manualPreloaderActive = visible;
      if (visible) {
        this.clearRoutePreloaderTimeout();
        this.showPreloader = true;
      } else if (this.showPreloaderState === '1') {
        this.triggerRoutePreloader();
      } else {
        this.showPreloader = false;
      }
    });
    this.common.base.subscribe((res: string) => {
      this.base = res;
      this.withoutWrapperPages = this.withoutWrapperPagesArray.includes(this.base);
      this.withoutLayouts = this.withoutLayoutArray.includes(this.base);

      if (!this.manualPreloaderActive) {
        this.triggerRoutePreloader();
      }
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.last.subscribe((res: string) => {
      this.last = res;
    });
    this.settings.layoutMode.subscribe((res: string) => {
      this.layoutMode = res;
    });
    this.settings.layoutWidth.subscribe((res: string) => {
      this.layoutWidth = res;
    });
    this.settings.sidebarSize.subscribe((res: string) => {
      this.sidebarSize = res;
    });
    this.settings.sidebarColor2.subscribe((res: string) => {
      this.selectedColor = res;
    });
    this.settings.topbarColor2.subscribe((res: string) => {
      this.topbarColor = res;
    });
    this.settings.topbarColor3.subscribe((res: string) => {
      this.selectedColor1 = res;
    });
    this.settings.topbarColor4.subscribe((res: string) => {
      this.horizontalColor = res;
    });
    this.settings.primaryColor1.subscribe((res: string) => {
      this.dthemeColor = res;
    });
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res === 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });

    this.sideBar.toggleMobileSideBar.subscribe((res: string) => {
      if (res == 'true' || res == 'true') {
        this.mobileSidebar = true;
      } else {
        this.mobileSidebar = false;
      }
    });
    this.sideBar.expandSideBar.subscribe((res) => {
      this.expandMenu = res;
      if (res == false && this.miniSidebar == true) {
        this.data.sideBar.map((mainMenus) => {
          mainMenus.menu.map((resMenu) => {
            resMenu.showSubRoute = false;
          });
        });
      }
      if (res == true && this.miniSidebar == true) {
        this.data.sideBar.map((mainMenus) => {
          mainMenus.menu.map((resMenu) => {
            const menuValue = sessionStorage.getItem('menuValue');
            if (menuValue && menuValue == resMenu.menuValue) {
              resMenu.showSubRoute = true;
            } else {
              resMenu.showSubRoute = false;
            }
          });
        });
      }
    });
  }
  isCollapsed = false;

  private triggerRoutePreloader(): void {
    this.clearRoutePreloaderTimeout();
    if (this.showPreloaderState === '1') {
      this.showPreloader = true;
      this.routeLoaderTimeout = setTimeout(() => {
        if (!this.manualPreloaderActive) {
          this.showPreloader = false;
        }
      }, 2000);
    } else {
      this.showPreloader = false;
    }
  }

  private clearRoutePreloaderTimeout(): void {
    if (this.routeLoaderTimeout) {
      clearTimeout(this.routeLoaderTimeout);
      this.routeLoaderTimeout = undefined;
    }
  }

  public closeMobileSidebar(): void {
    if (this.mobileSidebar) {
      this.sideBar.closeMobileSideBar();
    }
  }

  ngOnInit() {
    this.data.collapse$.subscribe((collapse: boolean) => {
      this.isCollapsed = collapse;
    });
    // this.showPreloader = true;
    // setTimeout(() => {
    //   this.showPreloader = false;
    // }, 2000);
  }
}
