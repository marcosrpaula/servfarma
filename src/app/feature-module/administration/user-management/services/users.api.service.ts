import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import {
  ListUsersParams,
  UserViewModel,
  UserDetailsViewModel,
} from '../../../../shared/models/users';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import { buildHttpParams } from '../../../../shared/utils/http-params';

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
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name,
      email: params.email,
      isActive: params.isActive,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });
    return this.http
      .get<RawPagedResult<UserViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map(res => mapRawPaged<UserViewModel>(res)));
  }

  getById(id: string): Observable<UserDetailsViewModel> {
    return this.http.get<UserDetailsViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateUserDto): Observable<void> {
    const payload: CreateUserDto = {
      name: dto.name,
      email: dto.email,
      permissions: dto.permissions,
      isActive: dto.isActive,
    };
    return this.http.post<void>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdateUserDto): Observable<void> {
    const payload: UpdateUserDto = {
      name: dto.name,
      permissions: dto.permissions,
      isActive: dto.isActive,
    };
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }
}
