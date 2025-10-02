import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { KeycloakService } from '../services/keycloak.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
    constructor(
        private router: Router,
        private keycloakService: KeycloakService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.keycloakService.isLoggedIn()) {
            return true;
        }

        this.keycloakService.login({ redirectUri: window.location.origin + state.url }).catch(() => {
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        });
        return false;
    }
}
