import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import {
  ListProjectsParams,
  ProjectInput,
  ProjectViewModel,
} from '../../../../shared/models/projects';
import { buildHttpParams } from '../../../../shared/utils/http-params';
export type { ListProjectsParams } from '../../../../shared/models/projects';

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/projects`;

  constructor(private http: HttpClient) {}

  list(params: ListProjectsParams = {}): Observable<PagedResult<ProjectViewModel>> {
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
      .get<RawPagedResult<ProjectViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<ProjectViewModel>(res)));
  }

  getById(id: string): Observable<ProjectViewModel> {
    return this.http.get<ProjectViewModel>(`${this.baseUrl}/${id}`);
  }

  create(input: ProjectInput): Observable<ProjectViewModel> {
    return this.http.post<ProjectViewModel>(this.baseUrl, this.toPayload(input));
  }

  update(id: string, input: ProjectInput): Observable<ProjectViewModel> {
    return this.http.put<ProjectViewModel>(`${this.baseUrl}/${id}`, this.toPayload(input));
  }

  private toPayload(input: ProjectInput): any {
    return {
      name: input.name,
      laboratoryId: input.laboratoryId,
      observation: input.observation ?? null,
      emitReturnInvoice: input.emitReturnInvoice,
      emitInvoice: input.emitInvoice,
      stock: input.stock
        ? {
            mainStock: input.stock.mainStock,
            kitStock: input.stock.kitStock,
            sampleStock: input.stock.sampleStock,
            blockedStock: input.stock.blockedStock,
            blockSimilarLot: input.stock.blockSimilarLot,
            blockBeforeExpirationInMonths: input.stock.blockBeforeExpirationInMonths,
          }
        : null,
      allowedServiceTypes: input.allowedServiceTypes,
      isActive: input.isActive,
    };
  }
}
