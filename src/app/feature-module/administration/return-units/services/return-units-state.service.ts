import { Injectable } from '@angular/core';
import { ReturnUnitViewModel } from '../../../../shared/models/return-units';

interface ReturnUnitsListState {
  tableData: ReturnUnitViewModel[];
  totalItems: number;
  pageSize: number;
  backendPage: number;
  filtroNome: string;
  filtroLaboratorio: string;
  filtroAtivo: '' | 'true' | 'false';
  orderBy: string;
  ascending: boolean;
  orderLabel: 'CreatedDate' | 'Name' | 'Status';
  lastRequestSignature?: string;
  lastPagerKey?: string;
}

function cloneReturnUnit(unit: ReturnUnitViewModel): ReturnUnitViewModel {
  return {
    ...unit,
    laboratory: unit.laboratory ? { ...unit.laboratory } : unit.laboratory,
    address: unit.address
      ? {
          ...unit.address,
          city: unit.address.city
            ? {
                ...unit.address.city,
                state: unit.address.city.state ? { ...unit.address.city.state } : unit.address.city.state,
              }
            : unit.address.city,
        }
      : unit.address,
  };
}

@Injectable({ providedIn: 'root' })
export class ReturnUnitsStateService {
  private readonly cache = new Map<string, ReturnUnitViewModel>();
  private listState: ReturnUnitsListState | null = null;

  upsert(unit: ReturnUnitViewModel): void {
    this.cache.set(unit.id, cloneReturnUnit(unit));
  }

  setMany(units: ReturnUnitViewModel[]): void {
    units.forEach(unit => this.upsert(unit));
  }

  getById(id: string | null | undefined): ReturnUnitViewModel | undefined {
    if (!id) {
      return undefined;
    }
    const found = this.cache.get(id);
    return found ? cloneReturnUnit(found) : undefined;
  }

  setListState(state: ReturnUnitsListState): void {
    this.listState = {
      ...state,
      tableData: state.tableData.map(cloneReturnUnit),
    };
  }

  getListState(): ReturnUnitsListState | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      tableData: this.listState.tableData.map(cloneReturnUnit),
    };
  }

  updateListItem(updated: ReturnUnitViewModel): void {
    const cloned = cloneReturnUnit(updated);
    this.cache.set(cloned.id, cloned);
    if (!this.listState) {
      return;
    }
    if (!this.listState.tableData.some(unit => unit.id === cloned.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      tableData: this.listState.tableData.map(unit =>
        unit.id === cloned.id ? cloneReturnUnit(cloned) : cloneReturnUnit(unit)
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
