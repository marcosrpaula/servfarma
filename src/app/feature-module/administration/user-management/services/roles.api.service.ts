import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { RoleViewModel } from '../../../../shared/models/users';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';

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
    const httpParams = new HttpParams({ fromObject: {
      page: params.page?.toString() ?? '1',
      page_size: params.pageSize?.toString() ?? '10',
      ...(params.orderBy ? { order_by: params.orderBy } : {}),
      ...(params.ascending !== undefined ? { ascending: String(params.ascending) } : {}),
    }});
    return this.http
      .get<RawPagedResult<RoleViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map(res => mapRawPaged<RoleViewModel>(res)));
  }
}
