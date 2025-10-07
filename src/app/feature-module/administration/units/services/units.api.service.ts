import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import { ListUnitsParams, UnitViewModel } from '../../../../shared/models/units';
import { buildHttpParams } from '../../../../shared/utils/http-params';

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
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name,
      isActive: params.isActive,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });

    return this.http
      .get<RawPagedResult<UnitViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<UnitViewModel>(res)));
  }

  getById(id: string): Observable<UnitViewModel> {
    return this.http.get<UnitViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateUnitDto): Observable<UnitViewModel> {
    const payload: CreateUnitDto = {
      name: dto.name,
      isActive: dto.isActive,
    };
    return this.http.post<UnitViewModel>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdateUnitDto): Observable<UnitViewModel> {
    const payload: UpdateUnitDto = {
      name: dto.name,
      isActive: dto.isActive,
    };
    return this.http.put<UnitViewModel>(`${this.baseUrl}/${id}`, payload);
  }
}
