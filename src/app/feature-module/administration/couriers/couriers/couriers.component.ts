import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';
import { CouriersApiService } from '../services/couriers.api.service';
import { CouriersStateService, CouriersListViewState } from '../services/couriers-state.service';
import { CourierCompaniesApiService } from '../../courier-companies/services/courier-companies.api.service';
import { CourierCompanySimpleViewModel } from '../../../../shared/models/courier-companies';
import {
  CourierListFilterState,
  CourierSortableField,
  CourierViewModel,
  ListCouriersParams,
  defaultCourierListFilterState,
  normalizeCourierListFilters,
} from '../../../../shared/models/couriers';

type CourierSortLabel = 'CreatedDate' | 'Name' | 'Status';

const SORT_LABEL_TO_FIELD: Record<CourierSortLabel, CourierSortableField> = {
  CreatedDate: 'createdAt',
  Name: 'name',
  Status: 'isActive',
};

@Component({
  selector: 'app-couriers',
  templateUrl: './couriers.component.html',
  styleUrls: ['./couriers.component.scss'],
  standalone: false,
})
export class CouriersComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Administracao' },
    { label: 'Entregadores', active: true },
  ];

  tableData: CourierViewModel[] = [];

  pageSize = 10;
  currentPage = 1;
  totalItems = 0;

  filtroNome = '';
  filtroEmpresa = '';
  filtroAtivo: '' | 'true' | 'false' = '';

  orderBy: CourierSortableField = 'createdAt';
  ascending = false;
  orderLabel: CourierSortLabel = 'CreatedDate';

  carregando = false;
  private lastPagerKey = '';
  private lastRequestSignature = '';
  private suppressPagerSync = true;
  private readonly destroyRef = inject(DestroyRef);

  companies: CourierCompanySimpleViewModel[] = [];

  constructor(
    private readonly api: CouriersApiService,
    private readonly courierCompaniesApi: CourierCompaniesApiService,
    private readonly pagination: PaginationService,
    private readonly state: CouriersStateService,
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

    this.loadCompanies();

    if (!savedState) {
      this.loadPage();
    }
  }

  toggleSort(label: CourierSortLabel): void {
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
    this.setFilters({ ...defaultCourierListFilterState });
    this.currentPage = 1;
    this.loadPage();
  }

  companyNames(companies?: CourierCompanySimpleViewModel[]): string {
    if (!companies || !companies.length) {
      return '\u2014';
    }
    return companies.map((company) => company.name).join(', ');
  }

  private loadCompanies(): void {
    this.courierCompaniesApi
      .list({ page: 1, pageSize: 100, orderBy: 'name', ascending: true })
      .subscribe((res) => {
        this.companies = res.items || [];
      });
  }

  private loadPage(): void {
    this.carregando = true;
    this.lastPagerKey = `${this.currentPage}|${this.pageSize}`;

    const filterState = this.captureFilters();
    const params: ListCouriersParams = {
      page: this.currentPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
      ...normalizeCourierListFilters(filterState),
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

  private applyPersistedState(state: CouriersListViewState): void {
    this.tableData = state.items;
    this.totalItems = state.totalItems;
    this.pageSize = state.pageSize;
    this.currentPage = state.page;
    this.orderBy = state.orderBy;
    this.ascending = state.ascending;
    this.lastRequestSignature = state.lastRequestSignature ?? '';
    this.lastPagerKey = state.lastPagerKey ?? `${state.page}|${state.pageSize}`;
    this.setFilters(state.filters);
    this.orderLabel = (Object.entries(SORT_LABEL_TO_FIELD).find(([, field]) => field === state.orderBy)?.[0] as CourierSortLabel) ?? this.orderLabel;
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

  private captureFilters(): CourierListFilterState {
    return {
      name: this.filtroNome,
      courierCompanyId: this.filtroEmpresa,
      servedCityId: '',
      isActive: this.filtroAtivo,
    };
  }

  private setFilters(filters: CourierListFilterState): void {
    this.filtroNome = filters.name;
    this.filtroEmpresa = filters.courierCompanyId;
    this.filtroAtivo = filters.isActive;
  }

  private resetFilters(): void {
    this.setFilters({ ...defaultCourierListFilterState });
  }

  private emitPaginationSnapshot(): void {
    this.pagination.calculatePageSize.next({
      totalData: this.totalItems,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: [],
    });
  }

  private persistListState(filterState: CourierListFilterState): void {
    const state: CouriersListViewState = {
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
