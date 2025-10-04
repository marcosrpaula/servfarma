import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { BanksApiService } from '../services/banks.api.service';
import { BanksStateService } from '../services/banks-state.service';
import {
  BankListFilterState,
  BankSortableField,
  BankViewModel,
  ListBanksParams,
  defaultBankListFilterState,
  normalizeBankListFilters,
} from '../../../../shared/models/banks';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';
import { BanksListViewState } from '../services/banks-state.service';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  standalone: false,
})
export class BanksComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Administracao' },
    { label: 'Bancos', active: true },
  ];

  tableData: BankViewModel[] = [];

  pageSize = 10;
  currentPage = 1;
  totalItems = 0;

  filtroNome = '';
  filtroCodigo = '';
  filtroAtivo: '' | 'true' | 'false' = '';

  orderBy: BankSortableField = 'createdAt';
  ascending = false;

  carregando = false;
  private lastPagerKey = '';
  private lastRequestSignature = '';
  private suppressPagerSync = true;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private api: BanksApiService,
    private pagination: PaginationService,
    private banksState: BanksStateService,
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
    const savedState = this.banksState.getListState();

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

  toggleSort(field: BankSortableField) {
    this.ascending = this.orderBy === field ? !this.ascending : true;
    this.orderBy = field;
    this.currentPage = 1;
    this.loadPage();
  }

  changePageSize(size: number) {
    this.pageSize = Number(size) || 10;
    this.currentPage = 1;
    this.pagination.tablePageSize.next({
      skip: (this.currentPage - 1) * this.pageSize,
      limit: this.currentPage * this.pageSize,
      pageSize: this.pageSize,
    });
  }

  aplicarFiltros() {
    this.currentPage = 1;
    this.loadPage();
  }

  limparFiltros() {
    this.setFilters(defaultBankListFilterState);
    this.currentPage = 1;
    this.loadPage();
  }

  private loadPage() {
    this.carregando = true;
    this.lastPagerKey = `${this.currentPage}|${this.pageSize}`;

    const filterState = this.captureFilters();
    const params: ListBanksParams = {
      page: this.currentPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
      ...normalizeBankListFilters(filterState),
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
          this.banksState.setMany(this.tableData);
          this.persistListState(filterState);
          this.emitPaginationSnapshot();
        },
        error: () => {
          this.lastRequestSignature = '';
        },
      });
  }

  private applyPersistedState(state: BanksListViewState): void {
    this.tableData = state.items;
    this.totalItems = state.totalItems;
    this.pageSize = state.pageSize;
    this.currentPage = state.page;
    this.orderBy = state.orderBy;
    this.ascending = state.ascending;
    this.lastRequestSignature = state.lastRequestSignature ?? '';
    this.lastPagerKey = state.lastPagerKey ?? `${state.page}|${state.pageSize}`;
    this.setFilters(state.filters);
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

  private captureFilters(): BankListFilterState {
    return {
      name: this.filtroNome,
      bankCode: this.filtroCodigo,
      isActive: this.filtroAtivo,
    };
  }

  private setFilters(filters: BankListFilterState): void {
    this.filtroNome = filters.name;
    this.filtroCodigo = filters.bankCode;
    this.filtroAtivo = filters.isActive;
  }

  private resetFilters(): void {
    this.setFilters(defaultBankListFilterState);
  }

  private emitPaginationSnapshot(): void {
    this.pagination.calculatePageSize.next({
      totalData: this.totalItems,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: [],
    });
  }

  private persistListState(filters: BankListFilterState): void {
    this.banksState.setListState({
      items: this.tableData,
      totalItems: this.totalItems,
      page: this.currentPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
      filters,
      lastRequestSignature: this.lastRequestSignature,
      lastPagerKey: this.lastPagerKey,
    });
  }
}


