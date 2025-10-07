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
  CourierCompanyListFilterState,
  CourierCompanySortableField,
  CourierCompanyViewModel,
  ListCourierCompaniesParams,
  defaultCourierCompanyListFilterState,
  normalizeCourierCompanyFilters,
} from '../../../../shared/models/courier-companies';
import {
  CourierCompaniesListState,
  CourierCompaniesStateService,
  CourierCompanySortLabel,
} from '../services/courier-companies-state.service';
import { CourierCompaniesApiService } from '../services/courier-companies.api.service';

const SORT_FIELD_MAP: Record<CourierCompanySortLabel, CourierCompanySortableField> = {
  CreatedDate: 'createdAt',
  Name: 'name',
  Status: 'isActive',
};

@Component({
  selector: 'app-courier-companies',
  templateUrl: './courier-companies.component.html',
  styleUrls: ['./courier-companies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CourierCompaniesComponent implements OnInit {
  private readonly api = inject(CourierCompaniesApiService);
  private readonly pagination = inject(PaginationService);
  private readonly state = inject(CourierCompaniesStateService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadCrumbItems = [
    { label: 'Administração' },
    { label: 'Transportadoras', active: true },
  ];

  readonly filtersForm = this.fb.group({
    name: [defaultCourierCompanyListFilterState.name],
    isActive: [defaultCourierCompanyListFilterState.isActive],
  });

  readonly tableData = signal<CourierCompanyViewModel[]>([]);
  readonly carregando = signal(false);
  readonly semResultados = computed(() => !this.carregando() && this.tableData().length === 0);

  pageSize = 10;
  backendPage = 1;
  totalItems = 0;

  orderBy: CourierCompanySortableField = 'createdAt';
  ascending = false;
  orderLabel: CourierCompanySortLabel = 'CreatedDate';

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

    const savedState = this.state.getListState();
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

  toggleSort(label: CourierCompanySortLabel): void {
    if (this.orderLabel === label) {
      this.ascending = !this.ascending;
    } else {
      this.orderLabel = label;
      this.ascending = true;
    }
    this.orderBy = SORT_FIELD_MAP[label];
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
      name: defaultCourierCompanyListFilterState.name,
      isActive: defaultCourierCompanyListFilterState.isActive,
    });
    this.backendPage = 1;
    this.lastRequestSignature = '';
    this.loadPage();
  }

  private restoreFromState(state: CourierCompaniesListState): void {
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
    const params: ListCourierCompaniesParams = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
      ...normalizeCourierCompanyFilters(filters),
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
          this.state.setMany(items);
          this.state.setListState({
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

  private getFilters(): CourierCompanyListFilterState {
    const { name, isActive } = this.filtersForm.getRawValue();
    return {
      name: name.trim(),
      isActive,
    };
  }
}
