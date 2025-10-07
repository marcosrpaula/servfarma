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
  LaboratorySortableField,
  LaboratoryViewModel,
  ListLaboratoriesParams,
} from '../../../../shared/models/laboratories';
import {
  LaboratoriesListState,
  LaboratoriesStateService,
  LaboratoryListFiltersState,
  LaboratorySortLabel,
} from '../services/laboratories-state.service';
import { LaboratoriesApiService } from '../services/laboratories.api.service';

const SORT_FIELD_MAP: Record<LaboratorySortLabel, LaboratorySortableField> = {
  CreatedDate: 'created_at',
  TradeName: 'trade_name',
  LegalName: 'legal_name',
  Document: 'document',
  Status: 'is_active',
};

@Component({
  selector: 'app-laboratories',
  templateUrl: './laboratories.component.html',
  styleUrl: './laboratories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LaboratoriesComponent implements OnInit {
  private readonly api = inject(LaboratoriesApiService);
  private readonly pagination = inject(PaginationService);
  private readonly laboratoriesState = inject(LaboratoriesStateService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadCrumbItems = [{ label: 'Administração' }, { label: 'Laboratórios', active: true }];

  readonly filtersForm = this.fb.group({
    tradeName: [''],
    legalName: [''],
    document: [''],
    isActive: ['' as '' | 'true' | 'false'],
  });

  readonly tableData = signal<LaboratoryViewModel[]>([]);
  readonly carregando = signal(false);
  readonly semResultados = computed(() => !this.carregando() && this.tableData().length === 0);

  pageSize = 10;
  backendPage = 1;
  totalItems = 0;

  orderBy: LaboratorySortableField = 'created_at';
  ascending = false;
  orderLabel: LaboratorySortLabel = 'CreatedDate';

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

    const savedState = this.laboratoriesState.getListState();
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

  toggleSort(field: LaboratorySortLabel): void {
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
      tradeName: '',
      legalName: '',
      document: '',
      isActive: '',
    });
    this.backendPage = 1;
    this.lastRequestSignature = '';
    this.loadPage();
  }

  private restoreFromState(state: LaboratoriesListState): void {
    this.totalItems = state.totalItems;
    this.pageSize = state.pageSize;
    this.backendPage = state.backendPage;
    this.orderBy = state.sort.field;
    this.orderLabel = state.sort.label;
    this.ascending = state.sort.ascending;
    this.tableData.set(state.items);
    this.filtersForm.setValue(
      {
        tradeName: state.filters.tradeName,
        legalName: state.filters.legalName,
        document: state.filters.document,
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
    const params: ListLaboratoriesParams = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
      tradeName: filters.tradeName || undefined,
      legalName: filters.legalName || undefined,
      document: filters.document || undefined,
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
          this.laboratoriesState.setMany(items);
          this.laboratoriesState.setListState({
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

  private getFilters(): LaboratoryListFiltersState {
    const { tradeName, legalName, document, isActive } = this.filtersForm.getRawValue();
    return {
      tradeName: tradeName.trim(),
      legalName: legalName.trim(),
      document: document.trim(),
      isActive,
    };
  }
}
