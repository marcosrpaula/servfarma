import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';
import { CourierCompaniesApiService } from '../services/courier-companies.api.service';
import { CourierCompaniesStateService, CourierCompaniesListViewState } from '../services/courier-companies-state.service';
import {
  CourierCompanyListFilterState,
  CourierCompanySortableField,
  CourierCompanyViewModel,
  ListCourierCompaniesParams,
  defaultCourierCompanyListFilterState,
  normalizeCourierCompanyFilters,
} from '../../../../shared/models/courier-companies';

type CourierCompanySortLabel = 'CreatedDate' | 'Name' | 'Status';

const SORT_LABEL_TO_FIELD: Record<CourierCompanySortLabel, CourierCompanySortableField> = {
  CreatedDate: 'createdAt',
  Name: 'name',
  Status: 'isActive',
};

@Component({
  selector: 'app-courier-companies',
  templateUrl: './courier-companies.component.html',
  styleUrls: ['./courier-companies.component.scss'],
  standalone: false,
})
export class CourierCompaniesComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Administracao' },
    { label: 'Transportadoras', active: true },
  ];

  tableData: CourierCompanyViewModel[] = [];

  pageSize = 10;
  currentPage = 1;
  totalItems = 0;

  filtroNome = '';
  filtroAtivo: '' | 'true' | 'false' = '';

  orderBy: CourierCompanySortableField = 'createdAt';
  ascending = false;
  orderLabel: CourierCompanySortLabel = 'CreatedDate';

  carregando = false;
  private lastPagerKey = '';
  private lastRequestSignature = '';
  private suppressPagerSync = true;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly api: CourierCompaniesApiService,
    private readonly pagination: PaginationService,
    private readonly state: CourierCompaniesStateService,
  ) {
    this.pagination.tablePageSize
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ skip, pageSize }) => {
        if (this.suppressPagerSync) {
          return;
        }

        const normalizedPageSize =
          typeof pageSize === 'number' && pageSize > 0 ? pageSize : this.pageSize || 10;
        const normalizedSkip = typeof skip === 'number' && skip >= 0 ? skip : 0;
        const newPage = Math.floor(normalizedSkip / normalizedPageSize) + 1;
        const pagerKey = `${newPage}|${normalizedPageSize}`;
        if (pagerKey === this.lastPagerKey) {
          return;
        }

        this.applyPaginationChange(newPage, normalizedPageSize);
        this.loadPage();
      });
  }

  ngOnInit(): void {
    const savedState = this.state.getListState();

    this.suppressPagerSync = true;
    if (savedState) {
      this.applyPersistedState(savedState);
    } else {
      this.resetFilters();
      this.emitPaginationSnapshot();
    }
    this.suppressPagerSync = false;

    if (!savedState) {
      this.loadPage();
    }
  }

  toggleSort(label: CourierCompanySortLabel): void {
    const nextField = SORT_LABEL_TO_FIELD[label];
    this.ascending = this.orderBy === nextField ? !this.ascending : true;
    this.orderBy = nextField;
    this.orderLabel = label;
    this.currentPage = 1;
    this.loadPage();
  }

  changePageSize(size: number): void {
    this.pageSize = Number(size) || 10;
    this.currentPage = 1;
    this.pagination.tablePageSize.next({
      skip: (this.currentPage - 1) * this.pageSize,
      limit: this.currentPage * this.pageSize,
      pageSize: this.pageSize,
    });
  }

  aplicarFiltros(): void {
    this.currentPage = 1;
    this.loadPage();
  }

  limparFiltros(): void {
    this.setFilters({ ...defaultCourierCompanyListFilterState });
    this.currentPage = 1;
    this.loadPage();
  }

  private loadPage(): void {
    this.carregando = true;
    this.lastPagerKey = `${this.currentPage}|${this.pageSize}`;

    const filterState = this.captureFilters();
    const params: ListCourierCompaniesParams = {
      page: this.currentPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
      ...normalizeCourierCompanyFilters(filterState),
    };

    const signature = JSON.stringify(params);
    if (signature === this.lastRequestSignature) {
      this.carregando = false;
      return;
    }

    this.lastRequestSignature = signature;

    this.api
      .list(params)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (res) => {
          this.totalItems = res.totalCount ?? 0;
          this.tableData = res.items || [];
          this.state.setMany(this.tableData);
          this.persistListState(filterState);
          this.emitPaginationSnapshot();
        },
        error: () => {
          this.lastRequestSignature = '';
        },
      });
  }

  private applyPersistedState(state: CourierCompaniesListViewState): void {
    this.tableData = state.items;
    this.totalItems = state.totalItems;
    this.pageSize = state.pageSize;
    this.currentPage = state.page;
    this.orderBy = state.orderBy;
    this.ascending = state.ascending;
    this.lastRequestSignature = state.lastRequestSignature ?? '';
    this.lastPagerKey = state.lastPagerKey ?? `${state.page}|${state.pageSize}`;
    this.setFilters(state.filters);
    this.orderLabel = (Object.entries(SORT_LABEL_TO_FIELD).find(([, field]) => field === state.orderBy)?.[0] as CourierCompanySortLabel) ?? this.orderLabel;
    this.emitPaginationSnapshot();
    this.pagination.tablePageSize.next({
      skip: (this.currentPage - 1) * this.pageSize,
      limit: this.currentPage * this.pageSize,
      pageSize: this.pageSize,
    });
  }

  private applyPaginationChange(page: number, size: number): void {
    this.currentPage = page;
    this.pageSize = size;
    this.lastPagerKey = `${page}|${size}`;
  }

  private captureFilters(): CourierCompanyListFilterState {
    return {
      name: this.filtroNome,
      isActive: this.filtroAtivo,
    };
  }

  private setFilters(filters: CourierCompanyListFilterState): void {
    this.filtroNome = filters.name;
    this.filtroAtivo = filters.isActive;
  }

  private resetFilters(): void {
    this.setFilters({ ...defaultCourierCompanyListFilterState });
  }

  private emitPaginationSnapshot(): void {
    this.pagination.calculatePageSize.next({
      totalData: this.totalItems,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: [],
    });
  }

  private persistListState(filterState: CourierCompanyListFilterState): void {
    const state: CourierCompaniesListViewState = {
      items: this.tableData,
      totalItems: this.totalItems,
      page: this.currentPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
      filters: filterState,
      lastRequestSignature: this.lastRequestSignature,
      lastPagerKey: this.lastPagerKey,
    };

    this.state.setListState(state);
  }
}
