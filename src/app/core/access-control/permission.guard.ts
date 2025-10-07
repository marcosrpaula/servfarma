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
import { KeycloakAuthService } from '../../auth/keycloak/keycloak.service';
import { AccessControlService } from './access-control.service';
import { PermissionInput } from './access-control.types';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate, CanActivateChild, CanMatch {
  constructor(
    private readonly access: AccessControlService,
    private readonly router: Router,
    private readonly keycloak: KeycloakAuthService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return this.evaluate(route.data, route.data?.['permission'], state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return this.evaluate(childRoute.data, childRoute.data?.['permission'], state.url);
  }

  canMatch(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
    const targetUrl = '/' + segments.map((segment) => segment.path).join('/');
    return this.evaluate(route.data, route.data?.['permission'], targetUrl);
  }

  private evaluate(
    data: Data | undefined,
    permission: PermissionInput | undefined,
    targetUrl?: string,
  ): Observable<boolean | UrlTree> {
    if (!permission) {
      this.clearPendingLoginRedirect();
      return of(true);
    }
    const mode = (data?.['permissionMode'] as 'any' | 'all') === 'any' ? 'any' : 'all';
    const resolver =
      mode === 'any' ? this.access.resolveOnce(permission) : this.access.resolveAllOnce(permission);
    return resolver.pipe(
      map((allowed) => {
        if (allowed) {
          this.clearPendingLoginRedirect();
          return true;
        }

        if (!this.hasPendingLoginRedirect()) {
          this.markPendingLoginRedirect();
          const redirectUri = this.buildRedirectUri(targetUrl);
          const options: { redirectUri?: string; prompt?: string } = { prompt: 'login' };
          if (redirectUri) {
            options.redirectUri = redirectUri;
          }
          this.keycloak.login(options);
          return false;
        }

        this.clearPendingLoginRedirect();
        return this.router.parseUrl(this.resolveFallbackRoute());
      }),
    );
  }

  private hasPendingLoginRedirect(): boolean {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(PermissionGuard.LOGIN_REDIRECT_FLAG) === 'true';
  }

  private markPendingLoginRedirect(): void {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(PermissionGuard.LOGIN_REDIRECT_FLAG, 'true');
  }

  private clearPendingLoginRedirect(): void {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(PermissionGuard.LOGIN_REDIRECT_FLAG);
  }

  private buildRedirectUri(targetUrl?: string): string | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const base = window.location.origin;
    if (!targetUrl || targetUrl === '/' || targetUrl === '') {
      return base;
    }
    try {
      return new URL(targetUrl, base).toString();
    } catch {
      return base;
    }
  }

  private static readonly LOGIN_REDIRECT_FLAG = 'permission-guard-login-redirect';

  private resolveFallbackRoute(): string {
    const fallback = this.access.getFallbackRoute();
    return fallback && fallback.trim() ? fallback : '/';
  }
}
