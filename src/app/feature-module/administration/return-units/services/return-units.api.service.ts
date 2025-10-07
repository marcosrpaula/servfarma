import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import {
  ListReturnUnitsParams,
  ReturnUnitInput,
  ReturnUnitViewModel,
} from '../../../../shared/models/return-units';
import { buildHttpParams } from '../../../../shared/utils/http-params';
export type { ListReturnUnitsParams } from '../../../../shared/models/return-units';

@Injectable({ providedIn: 'root' })
export class ReturnUnitsApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/return-units`;

  constructor(private http: HttpClient) {}

  list(params: ListReturnUnitsParams = {}): Observable<PagedResult<ReturnUnitViewModel>> {
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      laboratoryId: params.laboratoryId,
      name: params.name,
      isActive: params.isActive,
      orderBy: params.orderBy,
      ascending: params.ascending,
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
      laboratoryId: input.laboratoryId,
      name: input.name,
      legalName: input.legalName,
      tradeName: input.tradeName,
      document: input.document,
      stateRegistration: input.stateRegistration ?? null,
      address: {
        zipCode: input.address.zipCode,
        street: input.address.street,
        number: input.address.number,
        additionalDetails: input.address.additionalDetails ?? null,
        referencePoint: input.address.referencePoint ?? null,
        neighborhood: input.address.neighborhood,
        cityId: input.address.cityId,
      },
      phone: input.phone ?? null,
      email: input.email ?? null,
      observation: input.observation ?? null,
      isActive: input.isActive,
    };
  }
}
