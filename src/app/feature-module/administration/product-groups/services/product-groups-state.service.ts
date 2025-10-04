import { Injectable } from '@angular/core';
import { ProductGroupViewModel } from '../../../../shared/models/product-groups';

interface ProductGroupsListState {
  tableData: ProductGroupViewModel[];
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
export class ProductGroupsStateService {
  private readonly cache = new Map<string, ProductGroupViewModel>();
  private listState: ProductGroupsListState | null = null;

  upsert(group: ProductGroupViewModel): void {
    this.cache.set(group.id, { ...group });
  }

  setMany(groups: ProductGroupViewModel[]): void {
    groups.forEach(group => this.upsert(group));
  }

  getById(id: string | null | undefined): ProductGroupViewModel | undefined {
    if (!id) {
      return undefined;
    }
    const found = this.cache.get(id);
    return found ? { ...found } : undefined;
  }

  setListState(state: ProductGroupsListState): void {
    this.listState = {
      ...state,
      tableData: state.tableData.map(group => ({ ...group })),
    };
  }

  getListState(): ProductGroupsListState | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      tableData: this.listState.tableData.map(group => ({ ...group })),
    };
  }

  updateListItem(updated: ProductGroupViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.tableData.some(group => group.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      tableData: this.listState.tableData.map(group =>
        group.id === updated.id ? { ...updated } : { ...group }
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
