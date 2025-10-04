import { Injectable } from '@angular/core';
import {
  CourierCompanyListFilterState,
  CourierCompanySortableField,
  CourierCompanyViewModel,
} from '../../../../shared/models/courier-companies';
import { ListViewState, cloneListViewState } from '../../../../shared/models/api/list-state';

export type CourierCompaniesListViewState = ListViewState<
  CourierCompanyViewModel,
  CourierCompanySortableField,
  CourierCompanyListFilterState
>;

@Injectable({ providedIn: 'root' })
export class CourierCompaniesStateService {
  private readonly cache = new Map<string, CourierCompanyViewModel>();
  private listState: CourierCompaniesListViewState | null = null;

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

  setListState(state: CourierCompaniesListViewState): void {
    this.listState = cloneListViewState(state);
  }

  getListState(): CourierCompaniesListViewState | null {
    if (!this.listState) {
      return null;
    }
    return cloneListViewState(this.listState);
  }

  updateListItem(updated: CourierCompanyViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.items.some(company => company.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      items: this.listState.items.map(company =>
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
