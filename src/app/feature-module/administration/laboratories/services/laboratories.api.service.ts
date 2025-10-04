import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import {
  LaboratoryDetailsViewModel,
  LaboratoryViewModel,
  ListLaboratoriesParams,
} from '../../../../shared/models/laboratories';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import { buildHttpParams } from '../../../../shared/utils/http-params';

export interface CreateLaboratoryDto {
  tradeName: string;
  legalName: string;
  document: string;
  observation?: string | null;
  isActive: boolean;
}

export interface UpdateLaboratoryDto extends CreateLaboratoryDto {}

@Injectable({ providedIn: 'root' })
export class LaboratoriesApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/laboratories`;

  constructor(private http: HttpClient) {}

  list(params: ListLaboratoriesParams = {}): Observable<PagedResult<LaboratoryViewModel>> {
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      tradeName: params.tradeName,
      legalName: params.legalName,
      document: params.document,
      isActive: params.isActive,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });

    return this.http
      .get<RawPagedResult<LaboratoryViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<LaboratoryViewModel>(res)));
  }

  getById(id: string): Observable<LaboratoryDetailsViewModel> {
    return this.http.get<LaboratoryDetailsViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateLaboratoryDto): Observable<void> {
    const payload: CreateLaboratoryDto = {
      tradeName: dto.tradeName,
      legalName: dto.legalName,
      document: dto.document,
      observation: dto.observation ?? null,
      isActive: dto.isActive,
    };
    return this.http.post<void>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdateLaboratoryDto): Observable<LaboratoryDetailsViewModel> {
    const payload: UpdateLaboratoryDto = {
      tradeName: dto.tradeName,
      legalName: dto.legalName,
      document: dto.document,
      observation: dto.observation ?? null,
      isActive: dto.isActive,
    };
    return this.http.put<LaboratoryDetailsViewModel>(`${this.baseUrl}/${id}`, payload);
  }
}