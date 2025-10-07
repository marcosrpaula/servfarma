import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import {
  CourierCompanyInput,
  CourierCompanyViewModel,
  ListCourierCompaniesParams,
} from '../../../../shared/models/courier-companies';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import { buildHttpParams } from '../../../../shared/utils/http-params';

@Injectable({ providedIn: 'root' })
export class CourierCompaniesApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/courier-companies`;

  constructor(private http: HttpClient) {}

  list(params: ListCourierCompaniesParams = {}): Observable<PagedResult<CourierCompanyViewModel>> {
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name,
      isActive: params.isActive,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });

    return this.http
      .get<RawPagedResult<CourierCompanyViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<CourierCompanyViewModel>(res)));
  }

  getById(id: string): Observable<CourierCompanyViewModel> {
    return this.http.get<CourierCompanyViewModel>(`${this.baseUrl}/${id}`);
  }

  create(input: CourierCompanyInput): Observable<CourierCompanyViewModel> {
    return this.http.post<CourierCompanyViewModel>(this.baseUrl, input);
  }

  update(id: string, input: CourierCompanyInput): Observable<CourierCompanyViewModel> {
    return this.http.put<CourierCompanyViewModel>(`${this.baseUrl}/${id}`, input);
  }
}
