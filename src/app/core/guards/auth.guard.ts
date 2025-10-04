import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakAuthService } from '../../auth/keycloak/keycloak.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly keycloak: KeycloakAuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.keycloak.isLoggedIn()) {
      return true;
    }

    const redirectUri = this.buildRedirectUri(state.url);
    this.keycloak.login(redirectUri);
    return false;
  }

  private buildRedirectUri(targetUrl: string): string | undefined {
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
}
