export interface ListViewState<
  TItem extends Record<string, unknown>,
  TSortField extends string,
  TFilterState extends Record<string, unknown>,
> {
  items: TItem[];
  totalItems: number;
  page: number;
  pageSize: number;
  orderBy: TSortField;
  ascending: boolean;
  filters: TFilterState;
  lastRequestSignature?: string;
  lastPagerKey?: string;
}

export function cloneListViewState<
  TItem extends Record<string, unknown>,
  TSortField extends string,
  TFilterState extends Record<string, unknown>,
>(
  state: ListViewState<TItem, TSortField, TFilterState>,
): ListViewState<TItem, TSortField, TFilterState> {
  return {
    ...state,
    items: state.items.map((item) => ({ ...item })),
    filters: { ...state.filters },
  };
}
