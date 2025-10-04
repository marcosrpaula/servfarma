import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../config/environment";
import {
  ReturnUnitInput,
  ReturnUnitViewModel,
} from "../../../../shared/models/return-units";
import {
  PagedResult,
  RawPagedResult,
  mapRawPaged,
} from "../../../../shared/models/pagination";

export interface ListReturnUnitsParams {
  page?: number;
  pageSize?: number;
  laboratoryId?: string;
  name?: string;
  isActive?: boolean;
  orderBy?: string;
  ascending?: boolean;
}

@Injectable({ providedIn: "root" })
export class ReturnUnitsApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/return-units`;

  constructor(private http: HttpClient) {}

  list(params: ListReturnUnitsParams = {}): Observable<PagedResult<ReturnUnitViewModel>> {
    const httpParams = new HttpParams({
      fromObject: {
        page: params.page?.toString() ?? "1",
        page_size: params.pageSize?.toString() ?? "10",
        ...(params.laboratoryId ? { laboratory_id: params.laboratoryId } : {}),
        ...(params.name ? { name: params.name } : {}),
        ...(params.isActive !== undefined ? { is_active: String(params.isActive) } : {}),
        ...(params.orderBy ? { order_by: params.orderBy } : {}),
        ...(params.ascending !== undefined ? { ascending: String(params.ascending) } : {}),
      },
    });

    return this.http
      .get<RawPagedResult<ReturnUnitViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<ReturnUnitViewModel>(res)));
  }

  getById(id: string): Observable<ReturnUnitViewModel> {
    return this.http.get<ReturnUnitViewModel>(`${this.baseUrl}/${id}`);
  }

  create(input: ReturnUnitInput): Observable<ReturnUnitViewModel> {
    return this.http.post<ReturnUnitViewModel>(this.baseUrl, this.toPayload(input));
  }

  update(id: string, input: ReturnUnitInput): Observable<ReturnUnitViewModel> {
    return this.http.put<ReturnUnitViewModel>(`${this.baseUrl}/${id}`, this.toPayload(input));
  }

  private toPayload(input: ReturnUnitInput): any {
    return {
      laboratory_id: input.laboratoryId,
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
      phone: input.phone ?? null,
      email: input.email ?? null,
      observation: input.observation ?? null,
      is_active: input.isActive,
    };
  }
}
