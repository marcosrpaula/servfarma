import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  PaginatedResponse,
  RoleSummary,
  SaveUserPayload,
  UserSummary
} from '../models/user-management.models';

interface EndpointConfig {
  users: string;
  roles: string;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly baseUrl = environment.apiBaseUrl?.replace(/\/$/, '') ?? '';
  private readonly endpoints: EndpointConfig = this.resolveEndpointConfig();

  constructor(private http: HttpClient) { }

  listUsers(params: Record<string, any> = {}): Observable<PaginatedResponse<UserSummary>> {
    const url = this.buildUrl(this.endpoints.users);
    const httpParams = this.buildHttpParams(params);
    return this.http.get<any>(url, { params: httpParams }).pipe(
      map(response => this.mapUserCollection(response)),
      catchError(() => of({ items: [] as UserSummary[], totalCount: 0, currentPage: 1, pageSize: 0 }))
    );
  }

  getUser(id: string): Observable<UserSummary> {
    const url = `${this.buildUrl(this.endpoints.users)}/${id}`;
    return this.http.get<any>(url).pipe(
      map(response => this.mapUserDetails(response)),
      catchError(() => of(this.emptyUser()))
    );
  }

  createUser(payload: SaveUserPayload): Observable<UserSummary> {
    const url = this.buildUrl(this.endpoints.users);
    return this.http.post<any>(url, this.buildCreateUserPayload(payload)).pipe(
      map(response => this.mapUserDetails(response))
    );
  }

  updateUser(id: string, payload: SaveUserPayload): Observable<UserSummary> {
    const url = `${this.buildUrl(this.endpoints.users)}/${id}`;
    return this.http.put<any>(url, this.buildUpdateUserPayload(payload)).pipe(
      map(response => this.mapUserDetails(response))
    );
  }

  listRoles(params: Record<string, any> = {}): Observable<PaginatedResponse<RoleSummary>> {
    const url = this.buildUrl(this.endpoints.roles);
    const httpParams = this.buildHttpParams(params);
    return this.http.get<any>(url, { params: httpParams }).pipe(
      map(response => this.mapRoleCollection(response)),
      catchError(() => of({ items: [] as RoleSummary[], totalCount: 0, currentPage: 1, pageSize: 0 }))
    );
  }

  private resolveEndpointConfig(): EndpointConfig {
    const override = (environment as any)?.userManagement ?? {};
    return {
      users: override.users ?? '/api/v1/users',
      roles: override.roles ?? '/api/v1/roles'
    };
  }

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
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== undefined && item !== null && item !== '') {
            httpParams = httpParams.append(key, String(item));
          }
        });
        return;
      }
      httpParams = httpParams.append(key, String(value));
    });
    return httpParams;
  }

  private mapUserCollection(response: any): PaginatedResponse<UserSummary> {
    const collection = this.readArray(response, ['items']);
    return {
      items: collection.map(item => this.mapUserSummary(item)),
      totalCount: this.readNumber(response, ['total_count', 'totalCount', 'total', 'count'], collection.length),
      currentPage: this.readNumber(response, ['current_page', 'currentPage', 'page', 'pageIndex'], 1),
      pageSize: this.readNumber(response, ['page_size', 'pageSize', 'limit', 'perPage'], collection.length)
    };
  }

  private mapUserSummary(raw: any): UserSummary {
    return {
      id: this.readString(raw, ['id', 'userId']),
      name: this.readString(raw, ['name', 'nome']),
      email: this.readString(raw, ['email']),
      active: this.readBoolean(raw, ['is_active', 'active', 'ativo'], true),
      permissions: this.mapRoleList(this.readArray(raw, ['permissions', 'roles'])),
      createdAt: this.readString(raw, ['created_at', 'createdAt']),
      createdBy: this.readString(raw, ['created_by', 'createdBy']),
      updatedAt: this.readString(raw, ['updated_at', 'updatedAt']),
      updatedBy: this.readString(raw, ['updated_by', 'updatedBy'])
    };
  }

  private mapUserDetails(raw: any): UserSummary {
    if (!raw) {
      return this.emptyUser();
    }
    return this.mapUserSummary(raw);
  }

  private mapRoleCollection(response: any): PaginatedResponse<RoleSummary> {
    const collection = this.readArray(response, ['items']);
    return {
      items: collection.map(item => this.mapRole(item)),
      totalCount: this.readNumber(response, ['total_count', 'totalCount', 'total', 'count'], collection.length),
      currentPage: this.readNumber(response, ['current_page', 'currentPage', 'page', 'pageIndex'], 1),
      pageSize: this.readNumber(response, ['page_size', 'pageSize', 'limit', 'perPage'], collection.length)
    };
  }

  private mapRole(raw: any): RoleSummary {
    return {
      id: this.readString(raw, ['id', 'roleId']),
      name: this.readString(raw, ['name', 'nome']),
      description: this.readString(raw, ['description', 'descricao'])
    };
  }

  private mapRoleList(items: any[]): RoleSummary[] {
    return (items || []).map(item => this.mapRole(item)).filter(role => !!role.id);
  }

  private buildCreateUserPayload(payload: SaveUserPayload): any {
    return {
      name: payload.name,
      email: payload.email,
      permissions: payload.permissionIds ?? [],
      is_active: payload.active
    };
  }

  private buildUpdateUserPayload(payload: SaveUserPayload): any {
    return {
      name: payload.name,
      permissions: payload.permissionIds ?? [],
      is_active: payload.active
    };
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
          const normalized = value.toLowerCase();
          return ['true', '1', 'yes', 'sim'].includes(normalized);
        }
        if (typeof value === 'number') {
          return value > 0;
        }
      }
    }
    return fallback;
  }

  private emptyUser(): UserSummary {
    return {
      id: '',
      name: '',
      email: '',
      active: true,
      permissions: []
    };
  }
}
