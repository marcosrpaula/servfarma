import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { KeycloakAuthService } from './keycloak.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: KeycloakAuthService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    if (this.auth.isLoggedIn()) return true;
    // Trigger login redirect
    this.auth.login(window.location.href);
    return false;
  }
}
