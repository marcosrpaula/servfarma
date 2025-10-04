import { Injectable } from '@angular/core';
import { CourierViewModel } from '../../../../shared/models/couriers';

interface CouriersListState {
  tableData: CourierViewModel[];
  totalItems: number;
  pageSize: number;
  backendPage: number;
  filtroNome: string;
  filtroEmpresa: string;
  filtroAtivo: '' | 'true' | 'false';
  orderBy: string;
  ascending: boolean;
  orderLabel: 'CreatedDate' | 'Name' | 'Status';
  lastRequestSignature?: string;
  lastPagerKey?: string;
}

@Injectable({ providedIn: 'root' })
export class CouriersStateService {
  private readonly cache = new Map<string, CourierViewModel>();
  private listState: CouriersListState | null = null;

  setMany(couriers: CourierViewModel[]): void {
    couriers.forEach((courier) => this.upsert(courier));
  }

  upsert(courier: CourierViewModel): void {
    this.cache.set(courier.id, { ...courier });
  }

  getById(id: string | null | undefined): CourierViewModel | undefined {
    if (!id) {
      return undefined;
    }
    const courier = this.cache.get(id);
    return courier ? { ...courier } : undefined;
  }

  setListState(state: CouriersListState): void {
    this.listState = {
      ...state,
      tableData: state.tableData.map(courier => ({ ...courier })),
    };
  }

  getListState(): CouriersListState | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      tableData: this.listState.tableData.map(courier => ({ ...courier })),
    };
  }

  updateListItem(updated: CourierViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.tableData.some(courier => courier.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      tableData: this.listState.tableData.map(courier =>
        courier.id === updated.id ? { ...updated } : { ...courier }
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
