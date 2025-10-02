import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { User } from 'src/app/store/Authentication/auth.models';
import { KeycloakService } from './keycloak.service';
import { logout } from 'src/app/store/Authentication/authentication.actions';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    private readonly currentUserSubject = new BehaviorSubject<User | null>(this.readStoredUser());
    readonly currentUser$ = this.currentUserSubject.asObservable();

    constructor(private store: Store, private keycloakService: KeycloakService) { }

    get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    register(): never {
        throw new Error('User registration is handled directly in Keycloak.');
    }

    login(): never {
        throw new Error('Authentication is handled directly via Keycloak.');
    }

    public currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    synchronizeSession(): void {
        const storedUser = this.readStoredUser();
        this.currentUserSubject.next(storedUser);
    }

    logout(): void {
        this.store.dispatch(logout());
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('token');
        this.currentUserSubject.next(null);
        this.keycloakService.logout(window.location.origin).catch((error) => {
            console.error('Keycloak logout failed', error);
        });
    }

    private readStoredUser(): User | null {
        const raw = sessionStorage.getItem('currentUser');
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw) as User;
        } catch (error) {
            console.warn('Failed to parse stored user session', error);
            return null;
        }
    }
}

