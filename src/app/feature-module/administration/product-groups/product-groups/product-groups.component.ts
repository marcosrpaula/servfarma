import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';
import {
  ListProductGroupsParams,
  ProductGroupSortableField,
  ProductGroupViewModel,
} from '../../../../shared/models/product-groups';
import {
  ProductGroupListFiltersState,
  ProductGroupSortLabel,
  ProductGroupsListState,
  ProductGroupsStateService,
} from '../services/product-groups-state.service';
import { ProductGroupsApiService } from '../services/product-groups.api.service';

const SORT_FIELD_MAP: Record<ProductGroupSortLabel, ProductGroupSortableField> = {
  CreatedDate: 'createdAt',
  Name: 'name',
  Status: 'isActive',
};

@Component({
  selector: 'app-product-groups',
  templateUrl: './product-groups.component.html',
  styleUrls: ['./product-groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ProductGroupsComponent implements OnInit {
  private readonly api = inject(ProductGroupsApiService);
  private readonly pagination = inject(PaginationService);
  private readonly groupsState = inject(ProductGroupsStateService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadCrumbItems = [
    { label: 'Catálogos' },
    { label: 'Grupos de produtos', active: true },
  ];

  readonly filtersForm = this.fb.group({
    name: [''],
    isActive: ['' as '' | 'true' | 'false'],
  });

  readonly tableData = signal<ProductGroupViewModel[]>([]);
  readonly carregando = signal(false);
  readonly semResultados = computed(() => !this.carregando() && this.tableData().length === 0);

  pageSize = 10;
  backendPage = 1;
  totalItems = 0;

  orderBy: ProductGroupSortableField = 'createdAt';
  ascending = false;
  orderLabel: ProductGroupSortLabel = 'CreatedDate';

  private lastPagerKey = '';
  private lastRequestSignature = '';
  private allowPagerUpdates = false;

  ngOnInit(): void {
    this.pagination.tablePageSize
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ skip, pageSize }) => {
        if (!this.allowPagerUpdates) {
          return;
        }
        const size = typeof pageSize === 'number' && pageSize > 0 ? pageSize : this.pageSize || 10;
        const skipValue = typeof skip === 'number' && skip >= 0 ? skip : 0;
        const newPage = Math.floor(skipValue / size) + 1;
        const pagerKey = `${newPage}|${size}`;
        if (pagerKey === this.lastPagerKey) {
          return;
        }
        this.lastPagerKey = pagerKey;
        this.pageSize = size;
        this.backendPage = newPage;
        this.loadPage();
      });

    const savedState = this.groupsState.getListState();
    if (savedState) {
      this.restoreFromState(savedState);
      return;
    }

    this.allowPagerUpdates = true;
    this.pagination.calculatePageSize.next({
      totalData: this.totalItems,
      pageSize: this.pageSize,
      tableData: [],
      serialNumberArray: [],
    });
    this.loadPage();
  }

  toggleSort(field: ProductGroupSortLabel): void {
    if (this.orderLabel === field) {
      this.ascending = !this.ascending;
    } else {
      this.orderLabel = field;
      this.ascending = true;
    }
    this.orderBy = SORT_FIELD_MAP[field];
    this.backendPage = 1;
    this.loadPage();
  }

  changePageSize(size: number): void {
    this.pageSize = Number(size) || 10;
    this.backendPage = 1;
    this.pagination.tablePageSize.next({
      skip: (this.backendPage - 1) * this.pageSize,
      limit: this.backendPage * this.pageSize,
      pageSize: this.pageSize,
    });
  }

  aplicarFiltros(): void {
    this.backendPage = 1;
    this.lastRequestSignature = '';
    this.loadPage();
  }

  limparFiltros(): void {
    this.filtersForm.setValue({
      name: '',
      isActive: '',
    });
    this.backendPage = 1;
    this.lastRequestSignature = '';
    this.loadPage();
  }

  private restoreFromState(state: ProductGroupsListState): void {
    this.totalItems = state.totalItems;
    this.pageSize = state.pageSize;
    this.backendPage = state.backendPage;
    this.orderBy = state.sort.field;
    this.orderLabel = state.sort.label;
    this.ascending = state.sort.ascending;
    this.tableData.set(state.items);
    this.filtersForm.setValue(
      {
        name: state.filters.name,
        isActive: state.filters.isActive,
      },
      { emitEvent: false },
    );
    this.lastRequestSignature = state.lastRequestSignature ?? '';
    this.lastPagerKey = state.lastPagerKey ?? `${this.backendPage}|${this.pageSize}`;

    this.pagination.calculatePageSize.next({
      totalData: this.totalItems,
      pageSize: this.pageSize,
      tableData: state.items,
      serialNumberArray: [],
    });
    this.pagination.tablePageSize.next({
      skip: (this.backendPage - 1) * this.pageSize,
      limit: this.backendPage * this.pageSize,
      pageSize: this.pageSize,
    });
    this.allowPagerUpdates = true;
  }

  private loadPage(): void {
    this.carregando.set(true);
    this.lastPagerKey = `${this.backendPage}|${this.pageSize}`;

    const filters = this.getFilters();
    const params: ListProductGroupsParams = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
      name: filters.name || undefined,
      isActive: filters.isActive === '' ? undefined : filters.isActive === 'true',
    };

    const signature = JSON.stringify(params);
    if (signature === this.lastRequestSignature) {
      this.carregando.set(false);
      return;
    }
    this.lastRequestSignature = signature;

    this.api
      .list(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregando.set(false)),
      )
      .subscribe({
        next: (res) => {
          this.totalItems = res.totalCount ?? 0;
          const items = res.items ?? [];
          this.tableData.set(items);
          this.groupsState.setMany(items);
          this.groupsState.setListState({
            items,
            totalItems: this.totalItems,
            pageSize: this.pageSize,
            backendPage: this.backendPage,
            filters,
            sort: {
              field: this.orderBy,
              label: this.orderLabel,
              ascending: this.ascending,
            },
            lastRequestSignature: this.lastRequestSignature,
            lastPagerKey: this.lastPagerKey,
          });
          this.pagination.calculatePageSize.next({
            totalData: this.totalItems,
            pageSize: this.pageSize,
            tableData: items,
            serialNumberArray: [],
          });
        },
        error: () => {
          this.lastRequestSignature = '';
        },
      });
  }

  private getFilters(): ProductGroupListFiltersState {
    const { name, isActive } = this.filtersForm.getRawValue();
    return {
      name: name.trim(),
      isActive,
    };
  }
}
