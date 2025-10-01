import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  AccessLevel,
  ModuleDefinition,
  ModulePermissionState,
  PaginatedResponse,
  RawPermission,
  RawRole,
  RawUser,
  RoleSummary,
  SavePermissionPayload,
  SaveRolePayload,
  SaveUserPayload,
  UserSummary
} from '../models/user-management.models';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly baseUrl = environment.apiBaseUrl?.replace(/\/$/, '') ?? '';
  private readonly endpoints = environment.userManagement ?? {};

  constructor(private http: HttpClient) { }

  listUsers(params: Record<string, any> = {}): Observable<PaginatedResponse<UserSummary>> {
    const url = this.buildUrl(this.endpoints.users ?? '/api/v1/users');
    const httpParams = this.buildHttpParams(params);
    return this.http.get<any>(url, { params: httpParams }).pipe(
      map(response => this.mapUserCollection(response)),
      catchError(() => of({ items: [] as UserSummary[], totalCount: 0 }))
    );
  }

  getUser(id: string): Observable<UserSummary> {
    const url = `${this.buildUrl(this.endpoints.users ?? '/api/v1/users')}/${id}`;
    return this.http.get<any>(url).pipe(
      map(response => this.mapUser(response)),
      catchError(() => of(this.emptyUser()))
    );
  }

  createUser(payload: SaveUserPayload): Observable<UserSummary> {
    const url = this.buildUrl(this.endpoints.users ?? '/api/v1/users');
    return this.http.post<any>(url, this.buildUserPayload(payload)).pipe(
      map(response => this.mapUser(response))
    );
  }

  updateUser(id: string, payload: SaveUserPayload): Observable<UserSummary> {
    const url = `${this.buildUrl(this.endpoints.users ?? '/api/v1/users')}/${id}`;
    return this.http.put<any>(url, this.buildUserPayload({ ...payload, id })).pipe(
      map(response => this.mapUser(response))
    );
  }

  listRoles(params: Record<string, any> = {}): Observable<PaginatedResponse<RoleSummary>> {
    const url = this.buildUrl(this.endpoints.roles ?? '/api/v1/roles');
    const httpParams = this.buildHttpParams(params);
    return this.http.get<any>(url, { params: httpParams }).pipe(
      map(response => this.mapRoleCollection(response)),
      catchError(() => of({ items: [] as RoleSummary[], totalCount: 0 }))
    );
  }

  getRole(id: string): Observable<RoleSummary> {
    const url = `${this.buildUrl(this.endpoints.roles ?? '/api/v1/roles')}/${id}`;
    return this.http.get<any>(url).pipe(
      map(response => this.mapRole(response)),
      catchError(() => of(this.emptyRole()))
    );
  }

  createRole(payload: SaveRolePayload): Observable<RoleSummary> {
    const url = this.buildUrl(this.endpoints.roles ?? '/api/v1/roles');
    return this.http.post<any>(url, this.buildRolePayload(payload)).pipe(
      map(response => this.mapRole(response))
    );
  }

  updateRole(id: string, payload: SaveRolePayload): Observable<RoleSummary> {
    const url = `${this.buildUrl(this.endpoints.roles ?? '/api/v1/roles')}/${id}`;
    return this.http.put<any>(url, this.buildRolePayload({ ...payload, id })).pipe(
      map(response => this.mapRole(response))
    );
  }

  getModules(): Observable<ModuleDefinition[]> {
    const url = this.buildUrl(this.endpoints.modules ?? '/api/v1/modules');
    return this.http.get<any>(url).pipe(
      map(response => this.unwrapCollection(response).map(item => this.mapModule(item))),
      catchError(() => of([]))
    );
  }

  getCurrentUserPermissions(): Observable<ModulePermissionState[]> {
    const path = this.endpoints.currentPermissions ?? `${this.endpoints.users ?? '/api/v1/users'}/current/permissions`;
    const url = this.buildUrl(path);
    return this.http.get<any>(url).pipe(
      map(response => this.unwrapCollection(response).map(permission => this.mapPermission(permission))),
      catchError(() => of([]))
    );
  }

  /** Helpers */
  private buildUrl(path: string): string {
    if (!path) {
      return this.baseUrl;
    }
    if (path.startsWith('http')) {
      return path;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  private buildHttpParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params || {}).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value);
      }
    });
    return httpParams;
  }

  private mapUserCollection(response: any): PaginatedResponse<UserSummary> {
    const collection = this.unwrapCollection(response);
    return {
      items: collection.map(item => this.mapUser(item)),
      totalCount: this.readNumber(response, ['totalCount', 'total', 'totalItems', 'count'], collection.length),
      page: this.readNumber(response, ['page', 'pageIndex', 'currentPage'], 1),
      pageSize: this.readNumber(response, ['pageSize', 'limit', 'perPage'], collection.length)
    };
  }

  private mapRoleCollection(response: any): PaginatedResponse<RoleSummary> {
    const collection = this.unwrapCollection(response);
    return {
      items: collection.map(item => this.mapRole(item)),
      totalCount: this.readNumber(response, ['totalCount', 'total', 'totalItems', 'count'], collection.length),
      page: this.readNumber(response, ['page', 'pageIndex', 'currentPage'], 1),
      pageSize: this.readNumber(response, ['pageSize', 'limit', 'perPage'], collection.length)
    };
  }

  private mapUser(raw: RawUser): UserSummary {
    if (!raw) {
      return this.emptyUser();
    }
    const permissions = this.normalizePermissions(this.readArray(raw, ['permissions', 'permissoes', 'modules', 'modulos']));
    const roles = this.readArray(raw, ['roles', 'perfis']).map(role => this.mapRole(role));
    return {
      id: this.readString(raw, ['id', 'userId', 'guid', 'codigo']),
      name: this.readString(raw, ['name', 'nome', 'fullName', 'displayName']),
      email: this.readString(raw, ['email', 'mail', 'username']),
      active: this.readBoolean(raw, ['active', 'ativo', 'isActive', 'enabled'], true),
      roles,
      permissions
    };
  }

  private mapRole(raw: RawRole): RoleSummary {
    if (!raw) {
      return this.emptyRole();
    }
    const permissions = this.normalizePermissions(this.readArray(raw, ['permissions', 'permissoes', 'modules', 'modulos']));
    return {
      id: this.readString(raw, ['id', 'roleId', 'guid', 'codigo']),
      name: this.readString(raw, ['name', 'nome', 'displayName', 'descricao']),
      description: this.readString(raw, ['description', 'descricao', 'detalhes']),
      permissions,
      isSystem: this.readBoolean(raw, ['isSystem', 'system', 'padrao'], false)
    };
  }

  private mapModule(raw: any): ModuleDefinition {
    if (!raw) {
      return { key: '', name: '' };
    }
    const key = this.readString(raw, ['key', 'moduleKey', 'code', 'codigo', 'slug']).toLowerCase();
    return {
      key: key || this.slugify(this.readString(raw, ['name', 'nome', 'title'])),
      name: this.readString(raw, ['name', 'nome', 'title', 'descricao']),
      description: this.readString(raw, ['description', 'descricao']),
      category: this.readString(raw, ['category', 'categoria'])
    };
  }

  private normalizePermissions(rawPermissions: RawPermission[]): ModulePermissionState[] {
    return (rawPermissions || []).map(permission => this.mapPermission(permission));
  }

  private mapPermission(raw: RawPermission): ModulePermissionState {
    const moduleKeyRaw = this.readString(raw, ['moduleKey', 'module', 'key', 'codigo', 'code', 'slug']);
    const moduleName = this.readString(raw, ['moduleName', 'module', 'name', 'nome', 'descricao'], moduleKeyRaw);
    const module: ModuleDefinition = {
      key: (moduleKeyRaw || this.slugify(moduleName)).toLowerCase(),
      name: moduleName || moduleKeyRaw,
      description: this.readString(raw, ['description', 'descricao'])
    };

    const hasAccess = this.readBoolean(raw, ['hasAccess', 'access', 'ativo', 'enabled', 'allow'], false);
    const level = this.readAccessLevel(raw, hasAccess);
    const canRead = hasAccess ? this.readBoolean(raw, ['canRead', 'read', 'leitura'], level !== 'none') : false;
    const canWrite = hasAccess ? this.readBoolean(raw, ['canWrite', 'write', 'escrita'], level === 'write' || level === 'admin') : false;
    const isAdmin = hasAccess ? this.readBoolean(raw, ['isAdmin', 'admin'], level === 'admin') : false;

    return {
      module,
      hasAccess,
      level,
      canRead: hasAccess ? (canRead || level !== 'none') : false,
      canWrite: hasAccess ? (canWrite || level === 'write' || level === 'admin') : false,
      isAdmin: hasAccess ? (isAdmin || level === 'admin') : false
    };
  }

  private buildUserPayload(payload: SaveUserPayload): any {
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      active: payload.active,
      roleIds: payload.roleIds,
      permissions: payload.permissions.map(permission => this.buildPermissionPayload(permission))
    };
  }

  private buildRolePayload(payload: SaveRolePayload): any {
    return {
      id: payload.id,
      name: payload.name,
      description: payload.description,
      permissions: payload.permissions.map(permission => this.buildPermissionPayload(permission))
    };
  }

  private buildPermissionPayload(permission: SavePermissionPayload): any {
    return {
      moduleKey: permission.moduleKey,
      accessLevel: this.capitalize(permission.accessLevel ?? 'none'),
      hasAccess: permission.hasAccess
    };
  }

  private readAccessLevel(raw: RawPermission, hasAccess: boolean): AccessLevel {
    const explicitLevel = this.readString(raw, ['accessLevel', 'level', 'nivel', 'tipo', 'type']);
    if (explicitLevel) {
      const normalized = explicitLevel.toString().toLowerCase();
      if (normalized.includes('admin')) {
        return 'admin';
      }
      if (normalized.includes('write') || normalized.includes('edit') || normalized.includes('escr')) {
        return 'write';
      }
      if (normalized.includes('read') || normalized.includes('leitura') || normalized.includes('view')) {
        return 'read';
      }
      if (normalized.includes('none') || normalized.includes('sem')) {
        return 'none';
      }
    }

    if (!hasAccess) {
      return 'none';
    }

    if (this.readBoolean(raw, ['isAdmin', 'admin'])) {
      return 'admin';
    }

    if (this.readBoolean(raw, ['canWrite', 'write', 'escrita', 'editar'])) {
      return 'write';
    }

    if (this.readBoolean(raw, ['canRead', 'read', 'leitura', 'visualizar'], true)) {
      return 'read';
    }

    return 'read';
  }

  private unwrapCollection(response: any): any[] {
    if (!response) {
      return [];
    }
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response?.items)) {
      return response.items;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    if (Array.isArray(response?.result)) {
      return response.result;
    }
    return [];
  }

  private readArray(source: any, keys: string[]): any[] {
    for (const key of keys) {
      const value = source?.[key];
      if (Array.isArray(value)) {
        return value;
      }
    }
    return [];
  }

  private readString(source: any, keys: string[], fallback: string = ''): string {
    for (const key of keys) {
      const value = source?.[key];
      if (value !== undefined && value !== null && value !== '') {
        return String(value);
      }
    }
    return fallback;
  }

  private readNumber(source: any, keys: string[], fallback = 0): number {
    for (const key of keys) {
      const value = source?.[key];
      if (value !== undefined && value !== null && !isNaN(Number(value))) {
        return Number(value);
      }
    }
    return fallback;
  }

  private readBoolean(source: any, keys: string[], fallback = false): boolean {
    for (const key of keys) {
      const value = source?.[key];
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          return value;
        }
        if (typeof value === 'string') {
          return ['true', '1', 'yes', 'sim'].includes(value.toLowerCase());
        }
        if (typeof value === 'number') {
          return value > 0;
        }
      }
    }
    return fallback;
  }

  private slugify(value: string): string {
    return (value || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private capitalize(value: AccessLevel): string {
    if (!value) {
      return 'None';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private emptyUser(): UserSummary {
    return {
      id: '',
      name: '',
      email: '',
      active: true,
      roles: [],
      permissions: []
    };
  }

  private emptyRole(): RoleSummary {
    return {
      id: '',
      name: '',
      description: '',
      permissions: [],
      isSystem: false
    };
  }
}
