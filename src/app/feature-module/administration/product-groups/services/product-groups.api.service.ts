import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import {
  ListProductGroupsParams,
  ProductGroupViewModel,
} from '../../../../shared/models/product-groups';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import { buildHttpParams } from '../../../../shared/utils/http-params';

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
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name,
      isActive: params.isActive,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });

    return this.http
      .get<RawPagedResult<ProductGroupViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<ProductGroupViewModel>(res)));
  }

  getById(id: string): Observable<ProductGroupViewModel> {
    return this.http.get<ProductGroupViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateProductGroupDto): Observable<ProductGroupViewModel> {
    const payload: CreateProductGroupDto = {
      name: dto.name,
      isActive: dto.isActive,
    };
    return this.http.post<ProductGroupViewModel>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdateProductGroupDto): Observable<ProductGroupViewModel> {
    const payload: UpdateProductGroupDto = {
      name: dto.name,
      isActive: dto.isActive,
    };
    return this.http.put<ProductGroupViewModel>(`${this.baseUrl}/${id}`, payload);
  }
}
