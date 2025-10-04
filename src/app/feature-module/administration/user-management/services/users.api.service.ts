import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { UserViewModel, UserDetailsViewModel } from '../../../../shared/models/users';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  isActive?: boolean;
  orderBy?: string;
  ascending?: boolean;
}

export interface CreateUserDto {
  name: string;
  email: string;
  permissions: string[];
  isActive: boolean;
}

export interface UpdateUserDto {
  name: string;
  permissions: string[];
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/users`;

  constructor(private http: HttpClient) {}

  list(params: ListUsersParams = {}): Observable<PagedResult<UserViewModel>> {
    const httpParams = new HttpParams({ fromObject: {
      page: params.page?.toString() ?? '1',
      page_size: params.pageSize?.toString() ?? '10',
      ...(params.name ? { name: params.name } : {}),
      ...(params.email ? { email: params.email } : {}),
      ...(params.isActive !== undefined ? { is_active: String(params.isActive) } : {}),
      ...(params.orderBy ? { order_by: params.orderBy } : {}),
      ...(params.ascending !== undefined ? { ascending: String(params.ascending) } : {}),
    }});
    return this.http
      .get<RawPagedResult<UserViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map(res => mapRawPaged<UserViewModel>(res)));
  }

  getById(id: string): Observable<UserDetailsViewModel> {
    return this.http.get<UserDetailsViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateUserDto): Observable<void> {
    const payload: any = {
      name: dto.name,
      email: dto.email,
      permissions: dto.permissions,
      is_active: dto.isActive,
    };
    return this.http.post<void>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdateUserDto): Observable<void> {
    const payload: any = {
      name: dto.name,
      permissions: dto.permissions,
      is_active: dto.isActive,
    };
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }
}
