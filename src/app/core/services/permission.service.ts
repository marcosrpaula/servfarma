import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { ModulePermissionState, AccessLevel } from '../models/user-management.models';
import { UserManagementService } from './user-management.service';

export interface PermissionRequirement {
  moduleKey: string;
  level?: AccessLevel;
}

export type PermissionExpression = string | PermissionRequirement;
export type PermissionDictionary = Record<string, ModulePermissionState>;

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly permissionsSubject = new BehaviorSubject<PermissionDictionary | null>(null);
  private loading = false;

  constructor(private userManagementService: UserManagementService) { }

  get permissions$(): Observable<PermissionDictionary | null> {
    this.ensurePermissionsLoaded();
    return this.permissionsSubject.asObservable();
  }

  ensurePermissionsLoaded(force = false): void {
    if (this.loading) {
      return;
    }
    if (!force && this.permissionsSubject.value !== null) {
      return;
    }
    this.loading = true;
    this.userManagementService.getCurrentUserPermissions().subscribe({
      next: permissions => {
        this.permissionsSubject.next(this.toDictionary(permissions));
        this.loading = false;
      },
      error: () => {
        this.permissionsSubject.next({});
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.permissionsSubject.next(null);
    this.ensurePermissionsLoaded(true);
  }

  hasAccess(moduleKey: string, level: AccessLevel = 'read'): boolean {
    const permissions = this.permissionsSubject.value;
    if (!permissions) {
      // If permissions were not loaded yet we allow access by default to avoid locking the UI.
      return true;
    }
    return this.evaluate(permissions, { moduleKey, level });
  }

  can(requirement: PermissionExpression | PermissionExpression[]): boolean {
    const permissions = this.permissionsSubject.value;
    if (!permissions) {
      return true;
    }
    return this.checkRequirement(permissions, requirement);
  }

  observeAccess(requirement: PermissionExpression | PermissionExpression[]): Observable<boolean> {
    return this.permissions$.pipe(
      map(permissions => {
        if (!permissions) {
          return true;
        }
        return this.checkRequirement(permissions, requirement);
      })
    );
  }

  private evaluate(permissions: PermissionDictionary, requirement: PermissionRequirement): boolean {
    const moduleKey = (requirement.moduleKey || '').toLowerCase();
    if (!moduleKey) {
      return true;
    }
    const state = permissions[moduleKey];
    if (!state) {
      return false;
    }
    if (!state.hasAccess) {
      return false;
    }
    const level = requirement.level ?? 'read';
    switch (level) {
      case 'admin':
        return state.isAdmin || state.level === 'admin';
      case 'write':
        return state.canWrite || state.level === 'write' || state.level === 'admin';
      case 'read':
        return state.canRead || state.level === 'read' || state.level === 'write' || state.level === 'admin';
      case 'none':
      default:
        return state.hasAccess;
    }
  }

  private checkRequirement(permissions: PermissionDictionary, requirement: PermissionExpression | PermissionExpression[]): boolean {
    if (Array.isArray(requirement)) {
      return requirement.every(item => this.checkRequirement(permissions, item));
    }
    const parsed = this.normalizeExpression(requirement);
    return this.evaluate(permissions, parsed);
  }

  private normalizeExpression(expression: PermissionExpression): PermissionRequirement {
    if (typeof expression === 'string') {
      const [moduleKey, level] = expression.split(':');
      return {
        moduleKey: moduleKey.trim(),
        level: (level?.trim().toLowerCase() as AccessLevel) || 'read'
      };
    }
    return {
      moduleKey: expression.moduleKey,
      level: expression.level ?? 'read'
    };
  }

  private toDictionary(permissions: ModulePermissionState[]): PermissionDictionary {
    const dictionary: PermissionDictionary = {};
    for (const permission of permissions || []) {
      if (permission?.module?.key) {
        dictionary[permission.module.key.toLowerCase()] = permission;
      }
    }
    return dictionary;
  }
}
