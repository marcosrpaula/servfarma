import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { LaboratoryDetailsViewModel, LaboratoryViewModel } from '../../../../shared/models/laboratories';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';

export interface ListLaboratoriesParams {
  page?: number;
  pageSize?: number;
  tradeName?: string;
  legalName?: string;
  document?: string;
  isActive?: boolean;
  orderBy?: string;
  ascending?: boolean;
}

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
    const httpParams = new HttpParams({
      fromObject: {
        page: params.page?.toString() ?? '1',
        page_size: params.pageSize?.toString() ?? '10',
        ...(params.tradeName ? { trade_name: params.tradeName } : {} as any),
        ...(params.legalName ? { legal_name: params.legalName } : {} as any),
        ...(params.document ? { document: params.document } : {} as any),
        ...(params.isActive !== undefined ? { is_active: String(params.isActive) } : {} as any),
        ...(params.orderBy ? { order_by: params.orderBy } : {} as any),
        ...(params.ascending !== undefined ? { ascending: String(params.ascending) } : {} as any),
      },
    });

    return this.http
      .get<RawPagedResult<LaboratoryViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<LaboratoryViewModel>(res)));
  }

  getById(id: string): Observable<LaboratoryDetailsViewModel> {
    return this.http.get<LaboratoryDetailsViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateLaboratoryDto): Observable<void> {
    const payload: any = {
      trade_name: dto.tradeName,
      legal_name: dto.legalName,
      document: dto.document,
      observation: dto.observation ?? null,
      is_active: dto.isActive,
    };
    return this.http.post<void>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdateLaboratoryDto): Observable<LaboratoryDetailsViewModel> {
    const payload: any = {
      trade_name: dto.tradeName,
      legal_name: dto.legalName,
      document: dto.document,
      observation: dto.observation ?? null,
      is_active: dto.isActive,
    };
    return this.http.put<LaboratoryDetailsViewModel>(`${this.baseUrl}/${id}`, payload);
  }
}