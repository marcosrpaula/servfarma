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
import { LaboratoryViewModel } from '../../../../shared/models/laboratories';
import {
  ListReturnUnitsParams,
  ReturnUnitSortableField,
  ReturnUnitViewModel,
} from '../../../../shared/models/return-units';
import { LaboratoriesApiService } from '../../laboratories/services/laboratories.api.service';
import {
  ReturnUnitListFiltersState,
  ReturnUnitSortLabel,
  ReturnUnitsListState,
  ReturnUnitsStateService,
} from '../services/return-units-state.service';
import { ReturnUnitsApiService } from '../services/return-units.api.service';

const SORT_FIELD_MAP: Record<ReturnUnitSortLabel, ReturnUnitSortableField> = {
  CreatedDate: 'created_at',
  Name: 'name',
  Status: 'is_active',
};

@Component({
  selector: 'app-return-units',
  templateUrl: './return-units.component.html',
  styleUrls: ['./return-units.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReturnUnitsComponent implements OnInit {
  private readonly api = inject(ReturnUnitsApiService);
  private readonly labsApi = inject(LaboratoriesApiService);
  private readonly pagination = inject(PaginationService);
  private readonly returnUnitsState = inject(ReturnUnitsStateService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadCrumbItems = [
    { label: 'Administração' },
    { label: 'Unidades de devolução', active: true },
  ];

  readonly filtersForm = this.fb.group({
    name: [''],
    laboratoryId: [''],
    isActive: ['' as '' | 'true' | 'false'],
  });

  readonly laboratories = signal<LaboratoryViewModel[]>([]);
  readonly tableData = signal<ReturnUnitViewModel[]>([]);
  readonly carregando = signal(false);
  readonly semResultados = computed(() => !this.carregando() && this.tableData().length === 0);

  pageSize = 10;
  backendPage = 1;
  totalItems = 0;

  orderBy: ReturnUnitSortableField = 'created_at';
  ascending = false;
  orderLabel: ReturnUnitSortLabel = 'CreatedDate';

  private lastPagerKey = '';
  private lastRequestSignature = '';
  private allowPagerUpdates = false;

  readonly labName = (row: ReturnUnitViewModel): string => row.laboratory?.tradeName ?? 'N/A';

  ngOnInit(): void {
    this.loadLaboratories();

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

    const savedState = this.returnUnitsState.getListState();
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

  toggleSort(field: ReturnUnitSortLabel): void {
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
      laboratoryId: '',
      isActive: '',
    });
    this.backendPage = 1;
    this.lastRequestSignature = '';
    this.loadPage();
  }

  private loadLaboratories(): void {
    this.labsApi
      .list({ page: 1, pageSize: 100, orderBy: 'trade_name', ascending: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.laboratories.set(res.items ?? []);
      });
  }

  private restoreFromState(state: ReturnUnitsListState): void {
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
        laboratoryId: state.filters.laboratoryId,
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
    if (!filters.laboratoryId) {
      this.tableData.set([]);
      this.totalItems = 0;
      this.returnUnitsState.setListState({
        items: [],
        totalItems: this.totalItems,
        pageSize: this.pageSize,
        backendPage: this.backendPage,
        filters,
        sort: {
          field: this.orderBy,
          label: this.orderLabel,
          ascending: this.ascending,
        },
        lastRequestSignature: '',
        lastPagerKey: this.lastPagerKey,
      });
      this.pagination.calculatePageSize.next({
        totalData: 0,
        pageSize: this.pageSize,
        tableData: [],
        serialNumberArray: [],
      });
      this.carregando.set(false);
      return;
    }

    const params: ListReturnUnitsParams = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
      laboratoryId: filters.laboratoryId,
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
          this.returnUnitsState.setMany(items);
          this.returnUnitsState.setListState({
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

  private getFilters(): ReturnUnitListFiltersState {
    const { name, laboratoryId, isActive } = this.filtersForm.getRawValue();
    return {
      name: name.trim(),
      laboratoryId: laboratoryId?.trim() ?? '',
      isActive,
    };
  }
}
