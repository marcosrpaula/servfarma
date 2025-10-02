import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// Menu Pachage
// import MetisMenu from 'metismenujs';

import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { PermissionService } from '../../core/services/permission.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-horizontal-topbar',
    templateUrl: './horizontal-topbar.component.html',
    styleUrls: ['./horizontal-topbar.component.scss'],
    standalone: false
})
export class HorizontalTopbarComponent implements OnInit, OnDestroy {

  menu: any;
  menuItems: MenuItem[] = [];
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();
  private permissionSubscription?: Subscription;

  constructor(private router: Router, public translate: TranslateService, private permissionService: PermissionService) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.permissionService.ensurePermissionsLoaded();
    this.permissionSubscription = this.permissionService.permissions$.subscribe(permissions => {
      this.menuItems = this.filterMenuItems(MENU, permissions);
      setTimeout(() => this.initActiveMenu(), 0);
    });
  }

  /***
   * Activate droup down set
   */
   ngAfterViewInit() {
    this.initActiveMenu();
  }

  ngOnDestroy(): void {
    this.permissionSubscription?.unsubscribe();
  }

  removeActivation(items: any) {   
    items.forEach((item: any) => {
      if (item.classList.contains("menu-link")) {
        if (!item.classList.contains("active")) {
          item.setAttribute("aria-expanded", false);
        }
        (item.nextElementSibling) ? item.nextElementSibling.classList.remove("show") : null;
      }
      if (item.classList.contains("nav-link")) {
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
        item.setAttribute("aria-expanded", false);
      }
      item.classList.remove("active");
    });
  }

  private filterMenuItems(items: MenuItem[], permissions: any): MenuItem[] {
    const filtered: MenuItem[] = [];
    for (const item of items) {
      if (!this.canDisplayMenuItem(item, permissions)) {
        continue;
      }
      const clone: MenuItem = { ...item };
      if (item.subItems) {
        const subItems = this.filterMenuItems(item.subItems, permissions);
        if (subItems.length) {
          clone.subItems = subItems;
        } else {
          delete clone.subItems;
          if (!item.link) {
            continue;
          }
        }
      }
      filtered.push(clone);
    }
    return filtered;
  }

  private canDisplayMenuItem(item: MenuItem, permissions: any): boolean {
    if (!item.permission) {
      return true;
    }
    if (!permissions) {
      return true;
    }
    if (Array.isArray(item.permission)) {
      return item.permission.every(expression => this.permissionService.can(expression));
    }
    return this.permissionService.can(item.permission);
  }

  // remove active items of two-column-menu
  activateParentDropdown(item: any) { // navbar-nav menu add active
    item.classList.add("active");
    let parentCollapseDiv = item.closest(".collapse.menu-dropdown");
    if (parentCollapseDiv) {      
      // to set aria expand true remaining
      parentCollapseDiv.classList.add("show");
      parentCollapseDiv.parentElement.children[0].classList.add("active");
      parentCollapseDiv.parentElement.children[0].setAttribute("aria-expanded", "true");
      if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
        parentCollapseDiv.parentElement.closest(".collapse").classList.add("show");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
        parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
        parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.setAttribute("aria-expanded", "true");
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = document.getElementById("navbar-nav");
    
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  initActiveMenu() {
    const pathName = window.location.pathname;
    const ul = document.getElementById("navbar-nav");
    
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      let activeItems = items.filter((x: any) => x.classList.contains("active")); 
      this.removeActivation(activeItems);
      let matchingMenuItem = items.find((x: any) => {
        return x.pathname === pathName;
      });
      if (matchingMenuItem) {
        this.activateParentDropdown(matchingMenuItem);
      }
    }
  }

  toggleSubItem(event: any) {
    if(event.target && event.target.nextElementSibling)
      event.target.nextElementSibling.classList.toggle("show");
  };

  toggleItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');    
    
    let isMenu = isCurrentMenuId.nextElementSibling as any;
    let dropDowns = Array.from(document.querySelectorAll('#navbar-nav .show'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });

    (isMenu) ? isMenu.classList.add('show') : null;

    const ul = document.getElementById("navbar-nav");
    if(ul){
      const iconItems = Array.from(ul.getElementsByTagName("a"));
      let activeIconItems = iconItems.filter((x: any) => x.classList.contains("active"));
      activeIconItems.forEach((item: any) => {
        item.setAttribute('aria-expanded', "false")
        item.classList.remove("active");
      });
    } 
    if (isCurrentMenuId) {
      this.activateParentDropdown(isCurrentMenuId);
    }
  }


  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className: any) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

}
