import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { PharmaceuticalFormViewModel } from '../../../../shared/models/pharmaceutical-forms';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';

export interface ListPharmaceuticalFormsParams {
  page?: number;
  pageSize?: number;
  name?: string;
  isActive?: boolean;
  orderBy?: string;
  ascending?: boolean;
}

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
    const httpParams = new HttpParams({
      fromObject: {
        page: params.page?.toString() ?? '1',
        page_size: params.pageSize?.toString() ?? '10',
        ...(params.name ? { name: params.name } : {}),
        ...(params.isActive !== undefined ? { is_active: String(params.isActive) } : {}),
        ...(params.orderBy ? { order_by: params.orderBy } : {}),
        ...(params.ascending !== undefined ? { ascending: String(params.ascending) } : {}),
      },
    });

    return this.http
      .get<RawPagedResult<PharmaceuticalFormViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<PharmaceuticalFormViewModel>(res)));
  }

  getById(id: string): Observable<PharmaceuticalFormViewModel> {
    return this.http.get<PharmaceuticalFormViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreatePharmaceuticalFormDto): Observable<PharmaceuticalFormViewModel> {
    const payload = {
      name: dto.name,
      is_active: dto.isActive,
    };
    return this.http.post<PharmaceuticalFormViewModel>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdatePharmaceuticalFormDto): Observable<PharmaceuticalFormViewModel> {
    const payload = {
      name: dto.name,
      is_active: dto.isActive,
    };
    return this.http.put<PharmaceuticalFormViewModel>(`${this.baseUrl}/${id}`, payload);
  }
}
