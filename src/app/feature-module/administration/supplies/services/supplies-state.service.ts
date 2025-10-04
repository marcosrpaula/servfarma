import { Injectable } from '@angular/core';
import { SimpleItemViewModel } from '../../../../shared/models/supplies';

interface SuppliesListState {
  tableData: SimpleItemViewModel[];
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
export class SuppliesStateService {
  private readonly cache = new Map<string, SimpleItemViewModel>();
  private listState: SuppliesListState | null = null;

  upsert(supply: SimpleItemViewModel): void {
    this.cache.set(supply.id, { ...supply });
  }

  setMany(supplies: SimpleItemViewModel[]): void {
    supplies.forEach(supply => this.upsert(supply));
  }

  getById(id: string | null | undefined): SimpleItemViewModel | undefined {
    if (!id) {
      return undefined;
    }
    const found = this.cache.get(id);
    return found ? { ...found } : undefined;
  }

  setListState(state: SuppliesListState): void {
    this.listState = {
      ...state,
      tableData: state.tableData.map(supply => ({ ...supply })),
    };
  }

  getListState(): SuppliesListState | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      tableData: this.listState.tableData.map(supply => ({ ...supply })),
    };
  }

  updateListItem(updated: SimpleItemViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.tableData.some(supply => supply.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      tableData: this.listState.tableData.map(supply =>
        supply.id === updated.id ? { ...updated } : { ...supply }
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
