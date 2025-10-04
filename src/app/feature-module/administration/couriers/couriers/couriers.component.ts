import { Component, OnInit } from '@angular/core';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';
import { CouriersApiService, ListCouriersParams } from '../services/couriers.api.service';
import { CouriersStateService } from '../services/couriers-state.service';
import { CourierViewModel } from '../../../../shared/models/couriers';
import { CourierCompaniesApiService } from '../../courier-companies/services/courier-companies.api.service';
import { CourierCompanySimpleViewModel } from '../../../../shared/models/courier-companies';

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
  backendPage = 1;
  totalItems = 0;

  filtroNome = '';
  filtroEmpresa = '';
  filtroAtivo: '' | 'true' | 'false' = '';

  orderBy = 'created_at';
  ascending = false;
  orderLabel: 'CreatedDate' | 'Name' | 'Status' = 'CreatedDate';

  carregando = false;
  private lastPagerKey = '';
  private lastRequestSignature = '';
  private allowPagerUpdates = false;

  companies: CourierCompanySimpleViewModel[] = [];

  constructor(
    private api: CouriersApiService,
    private courierCompaniesApi: CourierCompaniesApiService,
    private pagination: PaginationService,
    private state: CouriersStateService,
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
      this.filtroEmpresa = savedState.filtroEmpresa;
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
      this.loadCompanies();
      return;
    }

    this.allowPagerUpdates = true;
    this.pagination.calculatePageSize.next({
      totalData: this.totalItems,
      pageSize: this.pageSize,
      tableData: [],
      serialNumberArray: [],
    });
    this.loadCompanies();
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
    this.filtroEmpresa = '';
    this.filtroAtivo = '';
    this.backendPage = 1;
    this.loadPage();
  }

  companyNames(companies?: CourierCompanySimpleViewModel[]): string {
    if (!companies || !companies.length) return '\\u2014';
    return companies.map((company) => company.name).join(', ');
  }

  private loadCompanies() {
    this.courierCompaniesApi
      .list({ page: 1, pageSize: 100, orderBy: 'name', ascending: true })
      .subscribe((res) => {
        this.companies = res.items || [];
      });
  }

  private loadPage() {
    this.carregando = true;
    this.lastPagerKey = `${this.backendPage}|${this.pageSize}`;
    const params: ListCouriersParams = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
    };

    if (this.filtroNome) {
      params.name = this.filtroNome;
    }
    if (this.filtroEmpresa) {
      params.courierCompanyId = this.filtroEmpresa;
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
          filtroEmpresa: this.filtroEmpresa,
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

