import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, map, of, tap } from 'rxjs';
import { PermissionService } from '../services/permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate, CanActivateChild {
  constructor(private permissionService: PermissionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.checkPermission(route, state);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.checkPermission(childRoute, state);
  }

  private checkPermission(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const requiredPermissions = route.data?.['permissions'] ?? route.data?.['permission'];
    if (!requiredPermissions) {
      return of(true);
    }

    const fallbackUrl = route.data?.['redirectTo'] ?? ['/'];
    return this.permissionService.hasPermission$(requiredPermissions).pipe(
      map((hasPermission) => {
        if (hasPermission) {
          return true;
        }
        return this.router.createUrlTree(Array.isArray(fallbackUrl) ? fallbackUrl : [fallbackUrl], {
          queryParams: { returnUrl: state.url },
        });
      }),
      tap((result) => {
        if (result !== true) {
          console.warn('PermissionGuard: insufficient permissions', requiredPermissions);
        }
      })
    );
  }
}
