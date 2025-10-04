import { Component, OnInit } from '@angular/core';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';
import {
  CourierCompaniesApiService,
  ListCourierCompaniesParams,
} from '../services/courier-companies.api.service';
import { CourierCompaniesStateService } from '../services/courier-companies-state.service';
import { CourierCompanyViewModel } from '../../../../shared/models/courier-companies';

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
  backendPage = 1;
  totalItems = 0;

  filtroNome = '';
  filtroAtivo: '' | 'true' | 'false' = '';

  orderBy = 'created_at';
  ascending = false;
  orderLabel: 'CreatedDate' | 'Name' | 'Status' = 'CreatedDate';

  carregando = false;
  private lastPagerKey = '';
  private lastRequestSignature = '';
  private allowPagerUpdates = false;

  constructor(
    private api: CourierCompaniesApiService,
    private pagination: PaginationService,
    private state: CourierCompaniesStateService,
  ) {
    this.pagination.tablePageSize.subscribe(({ skip, limit, pageSize }) => {
      if (!this.allowPagerUpdates) {
        return;
      }
      const size = typeof pageSize === 'number' && pageSize > 0 ? pageSize : this.pageSize || 10;
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
    const savedState = this.state.getListState();
    if (savedState) {
      this.totalItems = savedState.totalItems;
      this.pageSize = savedState.pageSize;
      this.backendPage = savedState.backendPage;
      this.filtroNome = savedState.filtroNome;
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

  toggleSort(field: 'CreatedDate' | 'Name' | 'Status') {
    if (this.orderLabel === field) {
      this.ascending = !this.ascending;
    } else {
      this.orderLabel = field;
      this.ascending = true;
    }
    this.orderBy = this.mapOrderField(field);
    this.backendPage = 1;
    this.loadPage();
  }

  private mapOrderField(field: 'CreatedDate' | 'Name' | 'Status'): string {
    switch (field) {
      case 'Name':
        return 'name';
      case 'Status':
        return 'active';
      case 'CreatedDate':
      default:
        return 'created_at';
    }
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
    this.filtroAtivo = '';
    this.backendPage = 1;
    this.loadPage();
  }

  private loadPage() {
    this.carregando = true;
    this.lastPagerKey = `${this.backendPage}|${this.pageSize}`;
    const params: ListCourierCompaniesParams = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
    };

    if (this.filtroNome) {
      params.name = this.filtroNome;
    }
    if (this.filtroAtivo !== '') {
      params.isActive = this.filtroAtivo === 'true';
    }

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
        this.state.setMany(this.tableData);
        this.state.setListState({
          tableData: this.tableData,
          totalItems: this.totalItems,
          pageSize: this.pageSize,
          backendPage: this.backendPage,
          filtroNome: this.filtroNome,
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

