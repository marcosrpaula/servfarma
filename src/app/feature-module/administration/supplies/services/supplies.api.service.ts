import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../config/environment";
import {
  ListSuppliesParams,
  DryPackageInput,
  PackageViewModel,
  RefrigeratedPackageInput,
  SimpleItemInput,
  SimpleItemViewModel,
} from "../../../../shared/models/supplies";
export type { ListSuppliesParams } from "../../../../shared/models/supplies";
import {
  PagedResult,
  RawPagedResult,
  mapRawPaged,
} from "../../../../shared/models/pagination";
import { buildHttpParams } from "../../../../shared/utils/http-params";

@Injectable({ providedIn: "root" })
export class SuppliesApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/supplies`;

  constructor(private http: HttpClient) {}

  list(params: ListSuppliesParams = {}): Observable<PagedResult<SimpleItemViewModel>> {
    const httpParams = buildHttpParams({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name,
      isActive: params.isActive,
      orderBy: params.orderBy,
      ascending: params.ascending,
    });

    return this.http
      .get<RawPagedResult<SimpleItemViewModel>>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => mapRawPaged<SimpleItemViewModel>(res)));
  }

  getSimpleItem(id: string): Observable<SimpleItemViewModel> {
    return this.http.get<SimpleItemViewModel>(`${this.baseUrl}/simple/${id}`);
  }

  createSimpleItem(input: SimpleItemInput): Observable<SimpleItemViewModel> {
    return this.http.post<SimpleItemViewModel>(`${this.baseUrl}/simple`, this.toSimpleItemPayload(input));
  }

  updateSimpleItem(
    id: string,
    input: SimpleItemInput
  ): Observable<SimpleItemViewModel> {
    return this.http.put<SimpleItemViewModel>(`${this.baseUrl}/simple/${id}`, this.toSimpleItemPayload(input));
  }

  getDryPackage(id: string): Observable<PackageViewModel> {
    return this.http.get<PackageViewModel>(`${this.baseUrl}/dry-package/${id}`);
  }

  createDryPackage(input: DryPackageInput): Observable<PackageViewModel> {
    return this.http.post<PackageViewModel>(`${this.baseUrl}/dry-package`, this.toDryPackagePayload(input));
  }

  updateDryPackage(
    id: string,
    input: DryPackageInput
  ): Observable<PackageViewModel> {
    return this.http.put<PackageViewModel>(`${this.baseUrl}/dry-package/${id}`, this.toDryPackagePayload(input));
  }

  getRefrigeratedPackage(id: string): Observable<PackageViewModel> {
    return this.http.get<PackageViewModel>(`${this.baseUrl}/refrigerated-package/${id}`);
  }

  createRefrigeratedPackage(
    input: RefrigeratedPackageInput
  ): Observable<PackageViewModel> {
    return this.http.post<PackageViewModel>(
      `${this.baseUrl}/refrigerated-package`,
      this.toRefrigeratedPackagePayload(input)
    );
  }

  updateRefrigeratedPackage(
    id: string,
    input: RefrigeratedPackageInput
  ): Observable<PackageViewModel> {
    return this.http.put<PackageViewModel>(
      `${this.baseUrl}/refrigerated-package/${id}`,
      this.toRefrigeratedPackagePayload(input)
    );
  }

  private toSimpleItemPayload(input: SimpleItemInput): any {
    return {
      name: input.name,
      price: input.price,
      isActive: input.isActive,
      type: input.type,
    };
  }

  private toDryPackagePayload(input: DryPackageInput): any {
    return {
      name: input.name,
      price: input.price,
      height: input.height,
      width: input.width,
      depth: input.depth,
      barcode: input.barcode,
      isActive: input.isActive,
    };
  }

  private toRefrigeratedPackagePayload(input: RefrigeratedPackageInput): any {
    return {
      ...this.toDryPackagePayload(input),
      coolingDurationHours: input.coolingDurationHours,
    };
  }
}
