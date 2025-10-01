import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaginatedRequest, PaginatedResponse, PaginationMeta } from '../models/pagination.model';
import {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UserAccount,
  UserFilters,
} from '../models/user.model';
import { Role } from '../models/role.model';
import { PermissionDirective } from '../models/permission.model';

interface ListUsersRequest extends PaginatedRequest {
  filters?: UserFilters;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  constructor(private http: HttpClient) {}

  listUsers(request: ListUsersRequest): Observable<PaginatedResponse<UserAccount>> {
    const params = this.buildHttpParams({
      page: request.page,
      pageSize: request.pageSize ?? environment.api.defaultPageSize,
      search: request.filters?.search,
      status: request.filters?.status && request.filters.status !== 'all' ? request.filters.status : undefined,
      roleIds: request.filters?.roles,
      sortField: request.sort?.active,
      sortDirection: request.sort?.direction,
    });

    return this.http
      .get<any>(environment.api.endpoints.users, { params })
      .pipe(map((response) => this.mapPaginatedResponse<UserAccount>(response)));
  }

  getUserById(id: string): Observable<UserAccount> {
    return this.http.get<UserAccount>(`${environment.api.endpoints.users}/${id}`);
  }

  createUser(payload: CreateUserPayload): Observable<UserAccount> {
    return this.http.post<UserAccount>(environment.api.endpoints.users, payload);
  }

  updateUser(payload: UpdateUserPayload): Observable<UserAccount> {
    return this.http.put<UserAccount>(`${environment.api.endpoints.users}/${payload.id}`, payload);
  }

  updateUserStatus(payload: UpdateUserStatusPayload): Observable<UserAccount> {
    return this.http.patch<UserAccount>(`${environment.api.endpoints.users}/${payload.id}/status`, payload);
  }

  getRoles(): Observable<Role[]> {
    return this.http
      .get<any>(environment.api.endpoints.roles)
      .pipe(map((response) => this.mapCollection<Role>(response)));
  }

  getPermissions(): Observable<PermissionDirective[]> {
    return this.http
      .get<any>(environment.api.endpoints.permissions)
      .pipe(map((response) => this.mapCollection<PermissionDirective>(response)));
  }

  getCurrentUserPermissions(): Observable<string[]> {
    return this.http
      .get<any>(environment.api.endpoints.currentUserPermissions)
      .pipe(map((response) => this.mapPermissionsResponse(response)));
  }

  private buildHttpParams(query: Record<string, unknown>): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        value
          .filter((item) => item !== undefined && item !== null)
          .forEach((item) => {
            params = params.append(key, String(item));
          });
        return;
      }

      params = params.append(key, String(value));
    });
    return params;
  }

  private mapPaginatedResponse<T>(response: any): PaginatedResponse<T> {
    const data: T[] = response?.data ?? response?.items ?? response?.results ?? [];
    const metaSource = response?.meta ?? response?.pagination ?? response ?? {};

    const page = metaSource?.page ?? metaSource?.currentPage ?? metaSource?.pageIndex ?? 1;
    const pageSize =
      metaSource?.pageSize ?? metaSource?.perPage ?? metaSource?.limit ?? environment.api.defaultPageSize;
    const totalItems = metaSource?.totalItems ?? metaSource?.total ?? metaSource?.totalCount ?? data.length;
    const totalPages =
      metaSource?.totalPages ??
      metaSource?.pageCount ??
      (pageSize ? Math.ceil((totalItems ?? 0) / pageSize) : 1);

    const meta: PaginationMeta = {
      page,
      pageSize,
      totalItems,
      totalPages,
    };

    return { data, meta };
  }

  private mapCollection<T>(response: any): T[] {
    return response?.data ?? response?.items ?? response?.results ?? response ?? [];
  }

  private mapPermissionsResponse(response: any): string[] {
    if (!response) {
      return [];
    }

    if (Array.isArray(response)) {
      return response.map((item) => (typeof item === 'string' ? item : item?.directive ?? item?.name)).filter(Boolean) as string[];
    }

    if (response?.data && Array.isArray(response.data)) {
      return response.data
        .map((item: any) => (typeof item === 'string' ? item : item?.directive ?? item?.name))
        .filter(Boolean) as string[];
    }

    return [];
  }
}
