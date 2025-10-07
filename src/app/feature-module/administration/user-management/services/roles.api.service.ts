import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import { RoleViewModel } from '../../../../shared/models/users';
import { buildHttpParams } from '../../../../shared/utils/http-params';

export interface ListRolesParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
}

@Injectable()
export class RolesApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/roles`;
  constructor(private http: HttpClient) {}
  list(params: ListRolesParams = {}): Observable<PagedResult<RoleViewModel>> {
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });
    return this.http
      .get<RawPagedResult<RoleViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<RoleViewModel>(res)));
  }
}
