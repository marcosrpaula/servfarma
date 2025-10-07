import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import {
  CourierInput,
  CourierViewModel,
  CourierWithCitiesViewModel,
  ListCouriersParams,
  ServedCityInput,
} from '../../../../shared/models/couriers';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import { buildHttpParams } from '../../../../shared/utils/http-params';

@Injectable({ providedIn: 'root' })
export class CouriersApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/couriers`;

  constructor(private http: HttpClient) {}

  list(params: ListCouriersParams = {}): Observable<PagedResult<CourierViewModel>> {
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      courierCompanyId: params.courierCompanyId,
      servedCityId: params.servedCityId,
      name: params.name,
      isActive: params.isActive,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });

    return this.http
      .get<RawPagedResult<CourierViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<CourierViewModel>(res)));
  }

  getById(id: string): Observable<CourierWithCitiesViewModel> {
    return this.http.get<CourierWithCitiesViewModel>(`${this.baseUrl}/${id}`);
  }

  create(input: CourierInput): Observable<CourierWithCitiesViewModel> {
    return this.http.post<CourierWithCitiesViewModel>(this.baseUrl, input);
  }

  update(id: string, input: CourierInput): Observable<CourierWithCitiesViewModel> {
    return this.http.put<CourierWithCitiesViewModel>(`${this.baseUrl}/${id}`, input);
  }

  addServedCities(id: string, payload: ServedCityInput): Observable<CourierWithCitiesViewModel> {
    return this.http.post<CourierWithCitiesViewModel>(
      `${this.baseUrl}/${id}/served-cities`,
      payload,
    );
  }

  removeServedCities(id: string, payload: ServedCityInput): Observable<CourierWithCitiesViewModel> {
    return this.http.request<CourierWithCitiesViewModel>(
      'DELETE',
      `${this.baseUrl}/${id}/served-cities`,
      {
        body: payload,
      },
    );
  }
}
