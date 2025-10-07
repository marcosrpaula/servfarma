import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../config/environment';
import {
  BankDetailsViewModel,
  BankViewModel,
  CreateBankPayload,
  ListBanksParams,
  UpdateBankPayload,
} from '../../../../shared/models/banks';
import { PagedResult, RawPagedResult, mapRawPaged } from '../../../../shared/models/pagination';
import { buildHttpParams } from '../../../../shared/utils/http-params';

@Injectable({ providedIn: 'root' })
export class BanksApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/banks`;

  constructor(private http: HttpClient) {}

  list(params: ListBanksParams = {}): Observable<PagedResult<BankViewModel>> {
    const { page = 1, pageSize = 10, orderBy, ascending, name, bankCode, isActive } = params;

    const httpParams = buildHttpParams({
      page,
      pageSize,
      orderBy,
      ascending,
      name,
      bankCode,
      isActive,
    });

    return this.http
      .get<RawPagedResult<BankViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<BankViewModel>(res)));
  }

  getById(id: string): Observable<BankDetailsViewModel> {
    return this.http.get<BankDetailsViewModel>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateBankPayload): Observable<void> {
    return this.http.post<void>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateBankPayload): Observable<BankDetailsViewModel> {
    return this.http.put<BankDetailsViewModel>(`${this.baseUrl}/${id}`, dto);
  }
}
