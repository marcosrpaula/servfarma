import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../config/environment";
import {
  CourierCompanyInput,
  CourierCompanyViewModel,
} from "../../../../shared/models/courier-companies";
import {
  PagedResult,
  RawPagedResult,
  mapRawPaged,
} from "../../../../shared/models/pagination";

export interface ListCourierCompaniesParams {
  page?: number;
  pageSize?: number;
  name?: string;
  isActive?: boolean;
  orderBy?: string;
  ascending?: boolean;
}

@Injectable({ providedIn: "root" })
export class CourierCompaniesApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/courier-companies`;

  constructor(private http: HttpClient) {}

  list(
    params: ListCourierCompaniesParams = {}
  ): Observable<PagedResult<CourierCompanyViewModel>> {
    const httpParams = new HttpParams({
      fromObject: {
        page: params.page?.toString() ?? "1",
        page_size: params.pageSize?.toString() ?? "10",
        ...(params.name ? { name: params.name } : {}),
        ...(params.isActive !== undefined ? { is_active: String(params.isActive) } : {}),
        ...(params.orderBy ? { order_by: params.orderBy } : {}),
        ...(params.ascending !== undefined ? { ascending: String(params.ascending) } : {}),
      },
    });

    return this.http
      .get<RawPagedResult<CourierCompanyViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<CourierCompanyViewModel>(res)));
  }

  getById(id: string): Observable<CourierCompanyViewModel> {
    return this.http.get<CourierCompanyViewModel>(`${this.baseUrl}/${id}`);
  }

  create(input: CourierCompanyInput): Observable<CourierCompanyViewModel> {
    return this.http.post<CourierCompanyViewModel>(this.baseUrl, this.toPayload(input));
  }

  update(id: string, input: CourierCompanyInput): Observable<CourierCompanyViewModel> {
    return this.http.put<CourierCompanyViewModel>(`${this.baseUrl}/${id}`, this.toPayload(input));
  }

  private toPayload(input: CourierCompanyInput): any {
    const address = input.address
      ? {
          zip_code: input.address.zipCode,
          street: input.address.street,
          number: input.address.number,
          additional_details: input.address.additionalDetails ?? null,
          reference_point: input.address.referencePoint ?? null,
          neighborhood: input.address.neighborhood,
          city_id: input.address.cityId,
        }
      : null;

    return {
      name: input.name,
      legal_name: input.legalName ?? null,
      document: input.document ?? null,
      state_registration: input.stateRegistration ?? null,
      address,
      email: input.email ?? null,
      observation: input.observation ?? null,
      print_on_invoice: input.printOnInvoice,
      is_active: input.isActive,
    };
  }
}
