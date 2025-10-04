import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../config/environment";
import {
  CourierInput,
  CourierViewModel,
  CourierWithCitiesViewModel,
  ServedCityInput,
} from "../../../../shared/models/couriers";
import {
  PagedResult,
  RawPagedResult,
  mapRawPaged,
} from "../../../../shared/models/pagination";

export interface ListCouriersParams {
  page?: number;
  pageSize?: number;
  courierCompanyId?: string;
  servedCityId?: string;
  name?: string;
  isActive?: boolean;
  orderBy?: string;
  ascending?: boolean;
}

@Injectable({ providedIn: "root" })
export class CouriersApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/couriers`;

  constructor(private http: HttpClient) {}

  list(params: ListCouriersParams = {}): Observable<PagedResult<CourierViewModel>> {
    const httpParams = new HttpParams({
      fromObject: {
        page: params.page?.toString() ?? "1",
        page_size: params.pageSize?.toString() ?? "10",
        ...(params.courierCompanyId ? { courier_company_id: params.courierCompanyId } : {}),
        ...(params.servedCityId ? { served_city_id: params.servedCityId } : {}),
        ...(params.name ? { name: params.name } : {}),
        ...(params.isActive !== undefined ? { is_active: String(params.isActive) } : {}),
        ...(params.orderBy ? { order_by: params.orderBy } : {}),
        ...(params.ascending !== undefined ? { ascending: String(params.ascending) } : {}),
      },
    });

    return this.http
      .get<RawPagedResult<CourierViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<CourierViewModel>(res)));
  }

  getById(id: string): Observable<CourierWithCitiesViewModel> {
    return this.http.get<CourierWithCitiesViewModel>(`${this.baseUrl}/${id}`);
  }

  create(input: CourierInput): Observable<CourierWithCitiesViewModel> {
    return this.http.post<CourierWithCitiesViewModel>(this.baseUrl, this.toPayload(input));
  }

  update(id: string, input: CourierInput): Observable<CourierWithCitiesViewModel> {
    return this.http.put<CourierWithCitiesViewModel>(`${this.baseUrl}/${id}`, this.toPayload(input));
  }

  addServedCities(
    id: string,
    payload: ServedCityInput
  ): Observable<CourierWithCitiesViewModel> {
    return this.http.post<CourierWithCitiesViewModel>(
      `${this.baseUrl}/${id}/served-cities`,
      { city_ids: payload.cityIds }
    );
  }

  removeServedCities(
    id: string,
    payload: ServedCityInput
  ): Observable<CourierWithCitiesViewModel> {
    return this.http.request<CourierWithCitiesViewModel>("DELETE", `${this.baseUrl}/${id}/served-cities`, {
      body: { city_ids: payload.cityIds },
    });
  }

  private toPayload(input: CourierInput): any {
    return {
      name: input.name,
      legal_name: input.legalName,
      trade_name: input.tradeName,
      document: input.document,
      state_registration: input.stateRegistration ?? null,
      address: {
        zip_code: input.address.zipCode,
        street: input.address.street,
        number: input.address.number,
        additional_details: input.address.additionalDetails ?? null,
        reference_point: input.address.referencePoint ?? null,
        neighborhood: input.address.neighborhood,
        city_id: input.address.cityId,
      },
      email: input.email ?? null,
      phone: input.phone ?? null,
      code: input.code ?? null,
      observation: input.observation ?? null,
      ad_valorem_rule: input.adValoremRule
        ? {
            rate: input.adValoremRule.rate,
            min_goods_value: input.adValoremRule.minGoodsValue,
          }
        : null,
      courier_company_ids: input.courierCompanyIds,
      is_active: input.isActive,
    };
  }
}
