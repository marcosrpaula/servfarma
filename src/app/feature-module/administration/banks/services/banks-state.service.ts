import { Injectable } from '@angular/core';
import {
  BankListFilterState,
  BankSortableField,
  BankViewModel,
} from '../../../../shared/models/banks';
import {
  ListViewState,
  cloneListViewState,
} from '../../../../shared/models/api/list-state';

export type BanksListViewState = ListViewState<
  BankViewModel,
  BankSortableField,
  BankListFilterState
>;

@Injectable({ providedIn: 'root' })
export class BanksStateService {
  private readonly cache = new Map<string, BankViewModel>();
  private listState: BanksListViewState | null = null;

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

  setListState(state: BanksListViewState): void {
    this.listState = cloneListViewState(state);
  }

  getListState(): BanksListViewState | null {
    if (!this.listState) {
      return null;
    }
    return cloneListViewState(this.listState);
  }

  updateListItem(updated: BankViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.items.some(bank => bank.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      items: this.listState.items.map(bank =>
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

