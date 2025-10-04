import { Injectable } from '@angular/core';
import { UnitViewModel } from '../../../../shared/models/units';

interface UnitsListState {
  tableData: UnitViewModel[];
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
export class UnitsStateService {
  private readonly cache = new Map<string, UnitViewModel>();
  private listState: UnitsListState | null = null;

  upsert(unit: UnitViewModel): void {
    this.cache.set(unit.id, { ...unit });
  }

  setMany(units: UnitViewModel[]): void {
    units.forEach(unit => this.upsert(unit));
  }

  getById(id: string | null | undefined): UnitViewModel | undefined {
    if (!id) {
      return undefined;
    }
    const found = this.cache.get(id);
    return found ? { ...found } : undefined;
  }

  setListState(state: UnitsListState): void {
    this.listState = {
      ...state,
      tableData: state.tableData.map(unit => ({ ...unit })),
    };
  }

  getListState(): UnitsListState | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      tableData: this.listState.tableData.map(unit => ({ ...unit })),
    };
  }

  updateListItem(updated: UnitViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.tableData.some(unit => unit.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      tableData: this.listState.tableData.map(unit =>
        unit.id === updated.id ? { ...updated } : { ...unit }
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
