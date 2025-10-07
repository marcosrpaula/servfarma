export interface ListSortState<TSortField extends string> {
  field: TSortField;
  label: string;
  ascending: boolean;
}

export interface EntityListState<
  TItem extends { id: string },
  TFilters,
  TSortField extends string,
> {
  items: TItem[];
  totalItems: number;
  pageSize: number;
  backendPage: number;
  filters: TFilters;
  sort: ListSortState<TSortField>;
  lastRequestSignature?: string;
  lastPagerKey?: string;
}

export class EntityListStateService<
  TItem extends { id: string },
  TFilters,
  TSortField extends string,
> {
  private readonly cache = new Map<string, TItem>();
  private listState: EntityListState<TItem, TFilters, TSortField> | null = null;

  upsert(item: TItem): void {
    this.cache.set(item.id, this.clone(item));
  }

  setMany(items: readonly TItem[]): void {
    items.forEach((item) => this.upsert(item));
  }

  getById(id: string | null | undefined): TItem | undefined {
    if (!id) {
      return undefined;
    }
    const found = this.cache.get(id);
    return found ? this.clone(found) : undefined;
  }

  setListState(state: EntityListState<TItem, TFilters, TSortField>): void {
    this.listState = {
      ...state,
      items: state.items.map((item) => this.clone(item)),
      filters: this.cloneFilters(state.filters),
      sort: { ...state.sort },
    };
  }

  getListState(): EntityListState<TItem, TFilters, TSortField> | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      items: this.listState.items.map((item) => this.clone(item)),
      filters: this.cloneFilters(this.listState.filters),
      sort: { ...this.listState.sort },
    };
  }

  updateListItem(updated: TItem): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.items.some((item) => item.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      items: this.listState.items.map((item) =>
        item.id === updated.id ? this.clone(updated) : this.clone(item),
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

  protected cloneFilters(filters: TFilters): TFilters {
    return this.clone(filters);
  }

  private clone<TValue>(value: TValue): TValue {
    if (typeof structuredClone === 'function') {
      return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value)) as TValue;
  }
}
