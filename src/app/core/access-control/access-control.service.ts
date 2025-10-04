import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged, filter, take } from 'rxjs/operators';
import { KeycloakAuthService } from '../../auth/keycloak/keycloak.service';
import { environment } from '../../config/environment';
import {
  AccessControlConfig,
  AccessLevel,
  ModulePermission,
  PermissionInput,
  PermissionMap,
  PermissionRequirement,
} from './access-control.types';
import { ACCESS_CONTROL_CONFIG } from './access-control.config';

interface PermissionState {
  ready: boolean;
  map: PermissionMap;
}

const DEFAULT_MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private readonly config: AccessControlConfig = ACCESS_CONTROL_CONFIG;
  private readonly mutationMethods = (this.config.mutationMethods ?? DEFAULT_MUTATION_METHODS).map((m) =>
    (m || '').toUpperCase()
  );
  private readonly moduleMap = this.buildModuleMap(this.config.moduleMap);
  private readonly apiPrefix = this.normalizePrefix(this.config.apiPrefix ?? '/api/v1');
  private readonly state$ = new BehaviorSubject<PermissionState>({
    ready: false,
    map: {},
  });

  readonly permissions$: Observable<PermissionMap> = this.state$.pipe(
    map((state) => state.map),
    distinctUntilChanged()
  );

  readonly ready$: Observable<boolean> = this.state$.pipe(
    map((state) => state.ready),
    distinctUntilChanged()
  );

  constructor(private keycloak: KeycloakAuthService) {
    this.rebuildPermissions();
    this.keycloak.onAuthStateChanged(() => this.rebuildPermissions());
  }

  isReady(): boolean {
    return this.state$.value.ready;
  }

  can(module: string, level: AccessLevel): boolean {
    const normalized = this.normalizeModule(module);
    const entry = this.state$.value.map[normalized];
    if (!entry) return false;
    if (level === 'read') return entry.read || entry.write;
    return entry.write;
  }

  canAll(requirements?: PermissionInput): boolean {
    const list = this.normalizeRequirements(requirements);
    if (!list.length) return true;
    return list.every((req) => this.can(req.module, req.level));
  }

  canAny(requirements?: PermissionInput): boolean {
    const list = this.normalizeRequirements(requirements);
    if (!list.length) return true;
    return list.some((req) => this.can(req.module, req.level));
  }

  watch(requirements: PermissionInput): Observable<boolean> {
    const list = this.normalizeRequirements(requirements);
    return this.state$.pipe(
      map((state) => (state.ready ? (list.length ? this.canAny(list) : true) : false)),
      distinctUntilChanged()
    );
  }

  resolveOnce(requirements?: PermissionInput): Observable<boolean> {
    return this.state$.pipe(
      filter((state) => state.ready),
      take(1),
      map(() => this.canAny(requirements))
    );
  }

  resolveAllOnce(requirements?: PermissionInput): Observable<boolean> {
    return this.state$.pipe(
      filter((state) => state.ready),
      take(1),
      map(() => this.canAll(requirements))
    );
  }

  resolveHttpRequirement(
    method: string,
    url: string
  ): PermissionRequirement | null {
    const normalizedMethod = (method || '').toUpperCase();
    if (!this.mutationMethods.includes(normalizedMethod)) {
      return null;
    }

    const relative = this.toRelativeApiPath(url);
    if (!relative) return null;

    const moduleFromPath = this.extractModuleFromRelativePath(relative);
    if (!moduleFromPath) return null;

    const module = this.normalizeModule(moduleFromPath);
    if (!module) return null;

    return { module, level: 'write' };
  }

  getFallbackRoute(): string {
    return this.config.fallbackRoute ?? '/error-404';
  }

  private rebuildPermissions() {
    const roles = this.keycloak.getRoles();
    const map = this.buildPermissionMap(roles);
    this.state$.next({ ready: true, map });
  }

  private buildPermissionMap(roles: string[]): PermissionMap {
    const map: PermissionMap = {};
    for (const rawRole of roles ?? []) {
      if (!rawRole) continue;
      const [module, action] = rawRole.split(':');
      if (!module || !action) continue;
      const normalizedModule = this.normalizeModule(module);
      const level = this.mapActionToLevel(action);
      if (!level) continue;
      const entry: ModulePermission = map[normalizedModule] ?? {
        read: false,
        write: false,
      };
      if (level === 'read') {
        entry.read = true;
      } else {
        entry.write = true;
        entry.read = true;
      }
      map[normalizedModule] = entry;
    }
    return map;
  }

  private mapActionToLevel(action: string): AccessLevel | null {
    const normalized = (action || '').trim().toLowerCase();
    if (!normalized) return null;
    if (['read', 'view'].includes(normalized)) return 'read';
    if (
      [
        'write',
        'admin',
        'manage',
        'update',
        'create',
        'delete',
        'edit',
      ].includes(normalized)
    ) {
      return 'write';
    }
    return null;
  }

  private normalizeModule(module: string): string {
    const key = (module || '').trim().toLowerCase();
    if (!key) return '';
    return this.moduleMap[key] ?? key;
  }

  private normalizeRequirements(
    requirements?: PermissionInput
  ): PermissionRequirement[] {
    if (!requirements) return [];
    if (Array.isArray(requirements)) {
      if (!requirements.length) return [];
      if (typeof requirements[0] === 'string') {
        return (requirements as string[])
          .map((value) => this.parseRequirementString(value))
          .filter((value): value is PermissionRequirement => !!value);
      }
      return (requirements as PermissionRequirement[])
        .map((req) => this.sanitizeRequirement(req))
        .filter((req): req is PermissionRequirement => !!req);
    }

    if (typeof requirements === 'string') {
      const parsed = this.parseRequirementString(requirements);
      return parsed ? [parsed] : [];
    }

    const sanitized = this.sanitizeRequirement(requirements);
    return sanitized ? [sanitized] : [];
  }

  private sanitizeRequirement(
    requirement?: PermissionRequirement
  ): PermissionRequirement | null {
    if (!requirement) return null;
    const module = this.normalizeModule(requirement.module);
    const level = requirement.level === 'write' ? 'write' : 'read';
    if (!module) return null;
    return { module, level };
  }

  private parseRequirementString(value: string): PermissionRequirement | null {
    if (!value) return null;
    const [module, level] = value.split(':');
    if (!module) return null;
    const normalizedModule = this.normalizeModule(module);
    const normalizedLevel = (level || 'read').trim().toLowerCase();
    const permissionLevel =
      normalizedLevel === 'write' ? 'write' : ('read' as AccessLevel);
    return { module: normalizedModule, level: permissionLevel };
  }

  private buildModuleMap(map?: Record<string, string>): Record<string, string> {
    if (!map) return {};
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(map)) {
      const normalizedKey = (key || '').trim().toLowerCase();
      const normalizedValue = (value || '').trim().toLowerCase();
      if (!normalizedKey) continue;
      result[normalizedKey] = normalizedValue || normalizedKey;
    }
    return result;
  }

  private normalizePrefix(prefix: string): string {
    if (!prefix) return '';
    let value = prefix.trim();
    if (!value.startsWith('/')) {
      value = `/${value}`;
    }
    return value.replace(/\/+$/, '').toLowerCase();
  }

  private extractModuleFromRelativePath(path: string): string {
    if (!path) return '';
    let working = this.normalizePath(path);
    if (this.apiPrefix && working.toLowerCase().startsWith(this.apiPrefix)) {
      working = working.slice(this.apiPrefix.length);
      if (!working.startsWith('/')) {
        working = `/${working}`;
      }
    }
    const segments = working.split('/').filter(Boolean);
    return segments[0]?.toLowerCase() ?? '';
  }

  private toRelativeApiPath(url: string): string {
    if (!url) return '';
    const trimmedBase = environment.apiBaseUrl.replace(/\/+$/, '');
    if (trimmedBase && url.startsWith(trimmedBase)) {
      const relative = url.slice(trimmedBase.length) || '/';
      return this.normalizePath(relative);
    }
    try {
      const baseUrl = trimmedBase || window.location.origin;
      const parsed = new URL(url, baseUrl + '/');
      return this.normalizePath(parsed.pathname);
    } catch {
      return this.normalizePath(url);
    }
  }

  private normalizePath(path: string): string {
    if (!path) return '';
    const withoutQuery = path.split('?')[0];
    if (!withoutQuery) return '';
    return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  }
}
