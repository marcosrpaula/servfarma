import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import {
  ListPharmaceuticalFormsParams,
  PharmaceuticalFormViewModel,
} from '../../../../shared/models/pharmaceutical-forms';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import { buildHttpParams } from '../../../../shared/utils/http-params';

export interface CreatePharmaceuticalFormDto {
  name: string;
  isActive: boolean;
}

export interface UpdatePharmaceuticalFormDto {
  name: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class PharmaceuticalFormsApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/pharmaceutical-forms`;

  constructor(private http: HttpClient) {}

  list(params: ListPharmaceuticalFormsParams = {}): Observable<PagedResult<PharmaceuticalFormViewModel>> {
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name,
      isActive: params.isActive,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });

    return this.http
      .get<RawPagedResult<PharmaceuticalFormViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<PharmaceuticalFormViewModel>(res)));
  }

  getById(id: string): Observable<PharmaceuticalFormViewModel> {
    return this.http.get<PharmaceuticalFormViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreatePharmaceuticalFormDto): Observable<PharmaceuticalFormViewModel> {
    const payload: CreatePharmaceuticalFormDto = {
      name: dto.name,
      isActive: dto.isActive,
    };
    return this.http.post<PharmaceuticalFormViewModel>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdatePharmaceuticalFormDto): Observable<PharmaceuticalFormViewModel> {
    const payload: UpdatePharmaceuticalFormDto = {
      name: dto.name,
      isActive: dto.isActive,
    };
    return this.http.put<PharmaceuticalFormViewModel>(`${this.baseUrl}/${id}`, payload);
  }
}
