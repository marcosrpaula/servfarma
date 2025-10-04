import { Injectable } from '@angular/core';
import { LaboratoryViewModel } from '../../../../shared/models/laboratories';

interface LaboratoriesListState {
  tableData: LaboratoryViewModel[];
  totalItems: number;
  pageSize: number;
  backendPage: number;
  filtroTradeName: string;
  filtroLegalName: string;
  filtroDocumento: string;
  filtroAtivo: '' | 'true' | 'false';
  orderBy: string;
  ascending: boolean;
  orderLabel: 'CreatedDate' | 'TradeName' | 'LegalName' | 'Document' | 'Status';
  lastRequestSignature?: string;
  lastPagerKey?: string;
}

@Injectable({ providedIn: 'root' })
export class LaboratoriesStateService {
  private readonly cache = new Map<string, LaboratoryViewModel>();
  private listState: LaboratoriesListState | null = null;

  upsert(laboratory: LaboratoryViewModel): void {
    this.cache.set(laboratory.id, { ...laboratory });
  }

  setMany(laboratories: LaboratoryViewModel[]): void {
    laboratories.forEach(laboratory => this.upsert(laboratory));
  }

  getById(id: string | null | undefined): LaboratoryViewModel | undefined {
    if (!id) {
      return undefined;
    }
    const found = this.cache.get(id);
    return found ? { ...found } : undefined;
  }

  setListState(state: LaboratoriesListState): void {
    this.listState = {
      ...state,
      tableData: state.tableData.map(laboratory => ({ ...laboratory })),
    };
  }

  getListState(): LaboratoriesListState | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      tableData: this.listState.tableData.map(laboratory => ({ ...laboratory })),
    };
  }

  updateListItem(updated: LaboratoryViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.tableData.some(laboratory => laboratory.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      tableData: this.listState.tableData.map(laboratory =>
        laboratory.id === updated.id ? { ...updated } : { ...laboratory }
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
