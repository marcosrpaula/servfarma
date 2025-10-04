import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import { BankViewModel, BankDetailsViewModel } from '../../../../shared/models/banks';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';

export interface ListBanksParams {
  page?: number;
  pageSize?: number;
  name?: string;
  bankCode?: string;
  isActive?: boolean;
  orderBy?: string;
  ascending?: boolean;
}

export interface CreateBankDto {
  name: string;
  bankCode: string;
  isActive: boolean;
}

export interface UpdateBankDto {
  name: string;
  bankCode: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class BanksApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/banks`;

  constructor(private http: HttpClient) {}

  list(params: ListBanksParams = {}): Observable<PagedResult<BankViewModel>> {
    const httpParams = new HttpParams({
      fromObject: {
        page: params.page?.toString() ?? '1',
        page_size: params.pageSize?.toString() ?? '10',
        ...(params.name ? { name: params.name } : {} as any),
        ...(params.bankCode ? { bank_code: params.bankCode } : {} as any),
        ...(params.isActive !== undefined ? { is_active: String(params.isActive) } : {} as any),
        ...(params.orderBy ? { order_by: params.orderBy } : {} as any),
        ...(params.ascending !== undefined ? { ascending: String(params.ascending) } : {} as any),
      },
    });
    return this.http
      .get<RawPagedResult<BankViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map(res => mapRawPaged<BankViewModel>(res)));
  }

  getById(id: string): Observable<BankDetailsViewModel> {
    return this.http.get<BankDetailsViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateBankDto): Observable<void> {
    const payload: any = {
      name: dto.name,
      bankCode: dto.bankCode,
      is_active: dto.isActive,
    };
    return this.http.post<void>(this.baseUrl, payload);
  }

  update(id: string, dto: UpdateBankDto): Observable<BankDetailsViewModel> {
    const payload: any = {
      name: dto.name,
      bankCode: dto.bankCode,
      is_active: dto.isActive,
    };
    return this.http.put<BankDetailsViewModel>(`${this.baseUrl}/${id}`, payload);
  }
}

