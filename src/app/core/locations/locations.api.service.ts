import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../config/environment";
import {
  CitySimpleViewModel,
  PostalAddressViewModel,
  StateSimpleViewModel,
} from "../../shared/models/addresses";
import {
  PagedResult,
  RawPagedResult,
  mapRawPaged,
} from "../../shared/models/pagination";
import { buildHttpParams } from "../../shared/utils/http-params";

export interface ListStatesParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
}

export interface ListCitiesParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
}

@Injectable({ providedIn: "root" })
export class LocationsApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/locations`;

  constructor(private http: HttpClient) {}

  listStates(params: ListStatesParams = {}): Observable<PagedResult<StateSimpleViewModel>> {
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });

    return this.http
      .get<RawPagedResult<StateSimpleViewModel>>(`${this.baseUrl}/states`, {
        params: httpParams,
      })
      .pipe(map((res) => mapRawPaged<StateSimpleViewModel>(res)));
  }

  listCities(
    stateUf: string,
    params: ListCitiesParams = {}
  ): Observable<PagedResult<CitySimpleViewModel>> {
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });

    return this.http
      .get<RawPagedResult<CitySimpleViewModel>>(
        `${this.baseUrl}/states/${stateUf}/cities`,
        { params: httpParams }
      )
      .pipe(map((res) => mapRawPaged<CitySimpleViewModel>(res)));
  }

  getAddressByZip(code: string): Observable<PostalAddressViewModel | null> {
    return this.http
      .get<PostalAddressViewModel>(`${this.baseUrl}/zipcode/${code}`)
      .pipe(catchError(() => of(null)));
  }
}
