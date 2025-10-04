import { Injectable } from '@angular/core';
import {
  CourierListFilterState,
  CourierSortableField,
  CourierViewModel,
} from '../../../../shared/models/couriers';
import { ListViewState, cloneListViewState } from '../../../../shared/models/api/list-state';

export type CouriersListViewState = ListViewState<
  CourierViewModel,
  CourierSortableField,
  CourierListFilterState
>;

@Injectable({ providedIn: 'root' })
export class CouriersStateService {
  private readonly cache = new Map<string, CourierViewModel>();
  private listState: CouriersListViewState | null = null;

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

  setListState(state: CouriersListViewState): void {
    this.listState = cloneListViewState(state);
  }

  getListState(): CouriersListViewState | null {
    if (!this.listState) {
      return null;
    }
    return cloneListViewState(this.listState);
  }

  updateListItem(updated: CourierViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.items.some(courier => courier.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      items: this.listState.items.map(courier =>
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
