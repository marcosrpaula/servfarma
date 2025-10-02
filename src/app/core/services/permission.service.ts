import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type PermissionExpression = string | { moduleKey: string; level?: string };

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly emptyPermissions$ = of<null>(null);

  get permissions$(): Observable<null> {
    return this.emptyPermissions$;
  }

  ensurePermissionsLoaded(): void {
    // Current API does not expose detailed permission data. Keep interface for future enhancements.
  }

  refresh(): void {
    // Placeholder for future permission refresh logic.
  }

  hasAccess(_: string, __: string = 'read'): boolean {
    return true;
  }

  can(_: PermissionExpression | PermissionExpression[]): boolean {
    return true;
  }

  observeAccess(_: PermissionExpression | PermissionExpression[]): Observable<boolean> {
    return of(true);
  }
}
