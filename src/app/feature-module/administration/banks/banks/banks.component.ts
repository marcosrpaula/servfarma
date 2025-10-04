import { Component, OnInit } from '@angular/core';
import { BanksApiService } from '../services/banks.api.service';
import { BanksStateService } from '../services/banks-state.service';
import { BankViewModel } from '../../../../shared/models/banks';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';

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
  backendPage = 1;
  totalItems = 0;

  filtroNome = '';
  filtroCodigo = '';
  filtroAtivo: '' | 'true' | 'false' = '';

  orderBy: string = 'created_at';
  ascending: boolean = false;
  orderLabel: 'CreatedDate' | 'Name' | 'BankCode' | 'Status' = 'CreatedDate';

  carregando = false;
  private lastPagerKey = '';
  private lastRequestSignature = '';
  private allowPagerUpdates = false;

  constructor(
    private api: BanksApiService,
    private pagination: PaginationService,
    private banksState: BanksStateService,
  ) {
    this.pagination.tablePageSize.subscribe(({ skip, limit, pageSize }) => {
      if (!this.allowPagerUpdates) {
        return;
      }
      const size = (typeof pageSize === 'number' && pageSize > 0) ? pageSize : this.pageSize || 10;
      const newPage = Math.floor((typeof skip === 'number' ? skip : 0) / size) + 1;
      const pagerKey = `${newPage}|${size}`;
      if (pagerKey === this.lastPagerKey) {
        return;
      }
      this.lastPagerKey = pagerKey;
      this.pageSize = size;
      this.backendPage = newPage;
      this.loadPage();
    });
  }

  ngOnInit(): void {
    const savedState = this.banksState.getListState();
    if (savedState) {
      this.totalItems = savedState.totalItems;
      this.pageSize = savedState.pageSize;
      this.backendPage = savedState.backendPage;
      this.filtroNome = savedState.filtroNome;
      this.filtroCodigo = savedState.filtroCodigo;
      this.filtroAtivo = savedState.filtroAtivo;
      this.orderBy = savedState.orderBy;
      this.ascending = savedState.ascending;
      this.orderLabel = savedState.orderLabel;
      this.tableData = savedState.tableData;
      this.lastRequestSignature = savedState.lastRequestSignature ?? '';
      this.lastPagerKey = savedState.lastPagerKey ?? `${this.backendPage}|${this.pageSize}`;
      this.pagination.calculatePageSize.next({
        totalData: this.totalItems,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: [],
      });
      this.pagination.tablePageSize.next({
        skip: (this.backendPage - 1) * this.pageSize,
        limit: this.backendPage * this.pageSize,
        pageSize: this.pageSize,
      });
      this.allowPagerUpdates = true;
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

  private mapOrderField(field: string): string {
    switch (field) {
      case 'CreatedDate':
        return 'created_at';
      case 'Name':
        return 'name';
      case 'BankCode':
        return 'bank_code';
      case 'Status':
        return 'active';
      default:
        return 'created_at';
    }
  }

  toggleSort(field: 'CreatedDate' | 'Name' | 'BankCode' | 'Status') {
    if (this.orderLabel === field) {
      this.ascending = !this.ascending;
    } else {
      this.orderLabel = field;
      this.ascending = true;
    }
    this.orderBy = this.mapOrderField(this.orderLabel);
    this.backendPage = 1;
    this.loadPage();
  }

  changePageSize(size: number) {
    this.pageSize = Number(size) || 10;
    this.backendPage = 1;
    this.pagination.tablePageSize.next({
      skip: (this.backendPage - 1) * this.pageSize,
      limit: this.backendPage * this.pageSize,
      pageSize: this.pageSize,
    });
  }

  aplicarFiltros() {
    this.backendPage = 1;
    this.loadPage();
  }

  limparFiltros() {
    this.filtroNome = '';
    this.filtroCodigo = '';
    this.filtroAtivo = '';
    this.backendPage = 1;
    this.loadPage();
  }

  private loadPage() {
    this.carregando = true;
    this.lastPagerKey = `${this.backendPage}|${this.pageSize}`;
    const params: any = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
    };
    if (this.filtroNome) params.name = this.filtroNome;
    if (this.filtroCodigo) params.bankCode = this.filtroCodigo;
    if (this.filtroAtivo !== '') params.isActive = this.filtroAtivo === 'true';

    const signature = JSON.stringify(params);
    if (signature === this.lastRequestSignature) {
      this.carregando = false;
      return;
    }
    this.lastRequestSignature = signature;

    this.api.list(params).subscribe({
      next: (res) => {
        this.totalItems = res.totalCount ?? 0;
        this.tableData = res.items || [];
        this.banksState.setMany(this.tableData);
        this.banksState.setListState({
          tableData: this.tableData,
          totalItems: this.totalItems,
          pageSize: this.pageSize,
          backendPage: this.backendPage,
          filtroNome: this.filtroNome,
          filtroCodigo: this.filtroCodigo,
          filtroAtivo: this.filtroAtivo,
          orderBy: this.orderBy,
          ascending: this.ascending,
          orderLabel: this.orderLabel,
          lastRequestSignature: this.lastRequestSignature,
          lastPagerKey: this.lastPagerKey,
        });
        this.pagination.calculatePageSize.next({
          totalData: this.totalItems,
          pageSize: this.pageSize,
          tableData: this.tableData,
          serialNumberArray: [],
        });
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }
}


