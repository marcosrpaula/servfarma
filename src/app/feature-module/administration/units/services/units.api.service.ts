import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { UnitViewModel } from '../../../../shared/models/units';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';

export interface ListUnitsParams {
  page?: number;
  pageSize?: number;
  name?: string;
  isActive?: boolean;
  orderBy?: string;
  ascending?: boolean;
}

export interface CreateUnitDto {
  name: string;
  isActive: boolean;
}

export interface UpdateUnitDto {
  name: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class UnitsApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/units`;

  constructor(private http: HttpClient) {}

  list(params: ListUnitsParams = {}): Observable<PagedResult<UnitViewModel>> {
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
      .get<RawPagedResult<UnitViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<UnitViewModel>(res)));
  }

  getById(id: string): Observable<UnitViewModel> {
    return this.http.get<UnitViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateUnitDto): Observable<UnitViewModel> {
    const payload = {
      name: dto.name,
      is_active: dto.isActive,
    };
    return this.http.post<UnitViewModel>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdateUnitDto): Observable<UnitViewModel> {
    const payload = {
      name: dto.name,
      is_active: dto.isActive,
    };
    return this.http.put<UnitViewModel>(`${this.baseUrl}/${id}`, payload);
  }
}
