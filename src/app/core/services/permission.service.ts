import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, from, map, of, tap } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserManagementService } from './user-management.service';
import { KeycloakService } from './keycloak.service';

function decodeToken(token?: string | null): any {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch (error) {
    console.warn('Failed to decode token payload', error);
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private permissionsSubject = new BehaviorSubject<Set<string>>(new Set<string>());
  readonly permissions$ = this.permissionsSubject.asObservable();
  private initialized = false;

  constructor(
    private userManagementService: UserManagementService,
    private keycloakService: KeycloakService
  ) {
    this.bootstrapFromStorage();
  }

  hasPermission(required: string | string[]): boolean {
    const current = this.permissionsSubject.value;
    if (!required) {
      return true;
    }

    const requiredPermissions = Array.isArray(required) ? required : [required];
    return requiredPermissions.every((permission) => current.has(permission));
  }

  hasPermission$(required: string | string[]): Observable<boolean> {
    return this.ensurePermissionsLoaded().pipe(map((permissions) => {
      if (!required) {
        return true;
      }
      const requiredPermissions = Array.isArray(required) ? required : [required];
      return requiredPermissions.every((permission) => permissions.has(permission));
    }));
  }

  setPermissions(permissions: string[]): void {
    const normalized = new Set(permissions);
    this.permissionsSubject.next(normalized);
    sessionStorage.setItem('userPermissions', JSON.stringify(Array.from(normalized)));
  }

  ensurePermissionsLoaded(): Observable<Set<string>> {
    if (this.initialized && this.permissionsSubject.value.size > 0) {
      return of(this.permissionsSubject.value);
    }

    const cached = this.tryExtractFromToken();
    if (cached.length > 0) {
      this.initialized = true;
      this.setPermissions(cached);
      return of(this.permissionsSubject.value);
    }

    this.initialized = true;
    const ensureToken$ = sessionStorage.getItem('token')
      ? of(sessionStorage.getItem('token'))
      : from(this.keycloakService.getToken()).pipe(catchError(() => of(null)));

    return ensureToken$.pipe(
      tap((token) => {
        if (token) {
          const extracted = this.tryExtractFromToken();
          if (extracted.length > 0) {
            this.setPermissions(extracted);
          }
        }
      }),
      switchMap(() =>
        this.userManagementService.getCurrentUserPermissions().pipe(
          tap((permissions) => {
            if (permissions.length > 0) {
              this.setPermissions(permissions);
            }
          }),
          map(() => this.permissionsSubject.value),
          catchError(() => of(this.permissionsSubject.value))
        )
      )
    );
  }

  private bootstrapFromStorage(): void {
    const stored = sessionStorage.getItem('userPermissions');
    if (stored) {
      try {
        const parsed: string[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.permissionsSubject.next(new Set(parsed));
          this.initialized = true;
        }
      } catch (error) {
        sessionStorage.removeItem('userPermissions');
      }
    }
  }

  private tryExtractFromToken(): string[] {
    const token = sessionStorage.getItem('token');
    const payload = decodeToken(token ?? undefined);
    if (!payload) {
      return [];
    }

    const realmRoles: string[] = payload?.realm_access?.roles ?? [];
    const resourceRoles: string[] = Object.values(payload?.resource_access ?? {}).flatMap((resource: any) => resource?.roles ?? []);
    const directPermissions: string[] = payload?.permissions ?? [];
    const authorizationScopes: string[] = (payload?.authorization?.permissions ?? [])
      .flatMap((item: any) => [item?.rsname, ...(item?.scopes ?? [])])
      .filter((scope: any) => typeof scope === 'string');

    const aggregated = new Set<string>([
      ...realmRoles,
      ...resourceRoles,
      ...directPermissions,
      ...authorizationScopes,
    ]);

    return Array.from(aggregated).filter((item) => !!item && typeof item === 'string');
  }
}
