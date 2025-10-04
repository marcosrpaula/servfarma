import { Injectable } from '@angular/core';
import { BankViewModel } from '../../../../shared/models/banks';

interface BanksListState {
  tableData: BankViewModel[];
  totalItems: number;
  pageSize: number;
  backendPage: number;
  filtroNome: string;
  filtroCodigo: string;
  filtroAtivo: '' | 'true' | 'false';
  orderBy: string;
  ascending: boolean;
  orderLabel: 'CreatedDate' | 'Name' | 'BankCode' | 'Status';
  lastRequestSignature?: string;
  lastPagerKey?: string;
}

@Injectable({ providedIn: 'root' })
export class BanksStateService {
  private readonly cache = new Map<string, BankViewModel>();
  private listState: BanksListState | null = null;

  upsert(bank: BankViewModel): void {
    this.cache.set(bank.id, { ...bank });
  }

  setMany(banks: BankViewModel[]): void {
    banks.forEach(bank => this.upsert(bank));
  }

  getById(id: string | null | undefined): BankViewModel | undefined {
    if (!id) {
      return undefined;
    }
    const found = this.cache.get(id);
    return found ? { ...found } : undefined;
  }

  setListState(state: BanksListState): void {
    this.listState = {
      ...state,
      tableData: state.tableData.map(bank => ({ ...bank })),
    };
  }

  getListState(): BanksListState | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      tableData: this.listState.tableData.map(bank => ({ ...bank })),
    };
  }

  updateListItem(updated: BankViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.tableData.some(bank => bank.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      tableData: this.listState.tableData.map(bank =>
        bank.id === updated.id ? { ...updated } : { ...bank }
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

