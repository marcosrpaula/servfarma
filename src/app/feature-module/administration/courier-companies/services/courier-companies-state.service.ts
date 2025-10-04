import { Injectable } from '@angular/core';
import { CourierCompanyViewModel } from '../../../../shared/models/courier-companies';

interface CourierCompaniesListState {
  tableData: CourierCompanyViewModel[];
  totalItems: number;
  pageSize: number;
  backendPage: number;
  filtroNome: string;
  filtroAtivo: '' | 'true' | 'false';
  orderBy: string;
  ascending: boolean;
  orderLabel: 'CreatedDate' | 'Name' | 'Status';
  lastRequestSignature?: string;
  lastPagerKey?: string;
}

@Injectable({ providedIn: 'root' })
export class CourierCompaniesStateService {
  private readonly cache = new Map<string, CourierCompanyViewModel>();
  private listState: CourierCompaniesListState | null = null;

  setMany(companies: CourierCompanyViewModel[]): void {
    companies.forEach((company) => this.upsert(company));
  }

  upsert(company: CourierCompanyViewModel): void {
    this.cache.set(company.id, { ...company });
  }

  getById(id: string | null | undefined): CourierCompanyViewModel | undefined {
    if (!id) {
      return undefined;
    }
    const company = this.cache.get(id);
    return company ? { ...company } : undefined;
  }

  setListState(state: CourierCompaniesListState): void {
    this.listState = {
      ...state,
      tableData: state.tableData.map(company => ({ ...company })),
    };
  }

  getListState(): CourierCompaniesListState | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      tableData: this.listState.tableData.map(company => ({ ...company })),
    };
  }

  updateListItem(updated: CourierCompanyViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.tableData.some(company => company.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      tableData: this.listState.tableData.map(company =>
        company.id === updated.id ? { ...updated } : { ...company }
      ),
    };
  }

  clearListState(): void {
    this.listState = null;
  }

  clear(): void {
    this.cache.clear();
    this.listState = null;
  }
}
