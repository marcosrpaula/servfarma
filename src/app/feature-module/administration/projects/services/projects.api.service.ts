import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../config/environment";
import {
  ProjectInput,
  ProjectViewModel,
} from "../../../../shared/models/projects";
import {
  PagedResult,
  RawPagedResult,
  mapRawPaged,
} from "../../../../shared/models/pagination";

export interface ListProjectsParams {
  page?: number;
  pageSize?: number;
  laboratoryId?: string;
  name?: string;
  isActive?: boolean;
  orderBy?: string;
  ascending?: boolean;
}

@Injectable({ providedIn: "root" })
export class ProjectsApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/projects`;

  constructor(private http: HttpClient) {}

  list(params: ListProjectsParams = {}): Observable<PagedResult<ProjectViewModel>> {
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
      laboratory_id: input.laboratoryId,
      observation: input.observation ?? null,
      emit_return_invoice: input.emitReturnInvoice,
      emit_invoice: input.emitInvoice,
      stock: input.stock
        ? {
            main_stock: input.stock.mainStock,
            kit_stock: input.stock.kitStock,
            sample_stock: input.stock.sampleStock,
            blocked_stock: input.stock.blockedStock,
            block_similar_lot: input.stock.blockSimilarLot,
            block_before_expiration_in_months:
              input.stock.blockBeforeExpirationInMonths,
          }
        : null,
      allowed_service_types: input.allowedServiceTypes,
      is_active: input.isActive,
    };
  }
}
