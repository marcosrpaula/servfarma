import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanMatch,
  Data,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccessControlService } from './access-control.service';
import { PermissionInput } from './access-control.types';

@Injectable({ providedIn: 'root' })
export class PermissionGuard
  implements CanActivate, CanActivateChild, CanMatch
{
  constructor(
    private readonly access: AccessControlService,
    private readonly router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.evaluate(route.data, route.data?.['permission']);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.evaluate(childRoute.data, childRoute.data?.['permission']);
  }

  canMatch(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
    return this.evaluate(route.data, route.data?.['permission']);
  }

  private evaluate(
    data: Data | undefined,
    permission: PermissionInput | undefined
  ): Observable<boolean | UrlTree> {
    if (!permission) return of(true);
    const mode = (data?.['permissionMode'] as 'any' | 'all') === 'any' ? 'any' : 'all';
    const resolver = mode === 'any'
      ? this.access.resolveOnce(permission)
      : this.access.resolveAllOnce(permission);
    return resolver.pipe(
      map((allowed) => (allowed ? true : this.router.parseUrl(this.access.getFallbackRoute())))
    );
  }
}
