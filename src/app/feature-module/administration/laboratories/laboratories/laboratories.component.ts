import { Component, OnInit } from '@angular/core';
import { LaboratoriesApiService } from '../services/laboratories.api.service';
import { LaboratoryViewModel } from '../../../../shared/models/laboratories';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';
import { LaboratoriesStateService } from '../services/laboratories-state.service';

@Component({
  selector: 'app-laboratories',
  templateUrl: './laboratories.component.html',
  styleUrl: './laboratories.component.scss',
  standalone: false,
})
export class LaboratoriesComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Administracao' },
    { label: 'Laboratorios', active: true },
  ];

  tableData: LaboratoryViewModel[] = [];

  pageSize = 10;
  backendPage = 1;
  totalItems = 0;

  filtroTradeName = '';
  filtroLegalName = '';
  filtroDocumento = '';
  filtroAtivo: '' | 'true' | 'false' = '';

  orderBy: string = 'created_at';
  ascending = false;
  orderLabel: 'CreatedDate' | 'TradeName' | 'LegalName' | 'Document' | 'Status' = 'CreatedDate';

  carregando = false;
  private lastPagerKey = '';
  private lastRequestSignature = '';
  private allowPagerUpdates = false;

  constructor(
    private api: LaboratoriesApiService,
    private pagination: PaginationService,
    private laboratoriesState: LaboratoriesStateService,
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
    const savedState = this.laboratoriesState.getListState();
    if (savedState) {
      this.totalItems = savedState.totalItems;
      this.pageSize = savedState.pageSize;
      this.backendPage = savedState.backendPage;
      this.filtroTradeName = savedState.filtroTradeName;
      this.filtroLegalName = savedState.filtroLegalName;
      this.filtroDocumento = savedState.filtroDocumento;
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

  private mapOrderField(field: 'CreatedDate' | 'TradeName' | 'LegalName' | 'Document' | 'Status'): string {
    switch (field) {
      case 'TradeName':
        return 'trade_name';
      case 'LegalName':
        return 'legal_name';
      case 'Document':
        return 'document';
      case 'Status':
        return 'active';
      default:
        return 'created_at';
    }
  }

  toggleSort(field: 'CreatedDate' | 'TradeName' | 'LegalName' | 'Document' | 'Status'): void {
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
    this.loadPage();
  }

  limparFiltros(): void {
    this.filtroTradeName = '';
    this.filtroLegalName = '';
    this.filtroDocumento = '';
    this.filtroAtivo = '';
    this.backendPage = 1;
    this.loadPage();
  }

  private loadPage(): void {
    this.carregando = true;
    this.lastPagerKey = `${this.backendPage}|${this.pageSize}`;
    const params: any = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
    };
    if (this.filtroTradeName) params.tradeName = this.filtroTradeName;
    if (this.filtroLegalName) params.legalName = this.filtroLegalName;
    if (this.filtroDocumento) params.document = this.filtroDocumento;
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
        this.tableData = res.items ?? [];
        this.laboratoriesState.setMany(this.tableData);
        this.laboratoriesState.setListState({
          tableData: this.tableData,
          totalItems: this.totalItems,
          pageSize: this.pageSize,
          backendPage: this.backendPage,
          filtroTradeName: this.filtroTradeName,
          filtroLegalName: this.filtroLegalName,
          filtroDocumento: this.filtroDocumento,
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
