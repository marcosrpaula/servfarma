import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { ProductGroupViewModel } from '../../../../shared/models/product-groups';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';

export interface ListProductGroupsParams {
  page?: number;
  pageSize?: number;
  name?: string;
  isActive?: boolean;
  orderBy?: string;
  ascending?: boolean;
}

export interface CreateProductGroupDto {
  name: string;
  isActive: boolean;
}

export interface UpdateProductGroupDto {
  name: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductGroupsApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/product-groups`;

  constructor(private http: HttpClient) {}

  list(params: ListProductGroupsParams = {}): Observable<PagedResult<ProductGroupViewModel>> {
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
      .get<RawPagedResult<ProductGroupViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<ProductGroupViewModel>(res)));
  }

  getById(id: string): Observable<ProductGroupViewModel> {
    return this.http.get<ProductGroupViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateProductGroupDto): Observable<ProductGroupViewModel> {
    const payload = {
      name: dto.name,
      is_active: dto.isActive,
    };
    return this.http.post<ProductGroupViewModel>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdateProductGroupDto): Observable<ProductGroupViewModel> {
    const payload = {
      name: dto.name,
      is_active: dto.isActive,
    };
    return this.http.put<ProductGroupViewModel>(`${this.baseUrl}/${id}`, payload);
  }
}
