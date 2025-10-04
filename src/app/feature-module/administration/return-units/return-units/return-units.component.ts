import { Component, OnInit } from '@angular/core';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';
import {
  ReturnUnitsApiService,
  ListReturnUnitsParams,
} from '../services/return-units.api.service';
import {
  ReturnUnitSortableField,
  ReturnUnitViewModel,
} from '../../../../shared/models/return-units';
import { LaboratoriesApiService } from '../../laboratories/services/laboratories.api.service';
import { LaboratoryViewModel } from '../../../../shared/models/laboratories';
import { ReturnUnitsStateService } from '../services/return-units-state.service';

@Component({
  selector: 'app-return-units',
  templateUrl: './return-units.component.html',
  styleUrls: ['./return-units.component.scss'],
  standalone: false,
})
export class ReturnUnitsComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Administracao' },
    { label: 'Unidades de Devolucao', active: true },
  ];
  tableData: ReturnUnitViewModel[] = [];
  pageSize = 10;
  backendPage = 1;
  totalItems = 0;

  filtroNome = '';
  filtroLaboratorio = '';
  filtroAtivo: '' | 'true' | 'false' = '';

  orderBy: ReturnUnitSortableField = 'createdAt';
  ascending = false;
  orderLabel: 'CreatedDate' | 'Name' | 'Status' = 'CreatedDate';

  carregando = false;
  private lastPagerKey = '';
  private lastRequestSignature = '';
  private allowPagerUpdates = false;

  labs: LaboratoryViewModel[] = [];

  constructor(
    private api: ReturnUnitsApiService,
    private labsApi: LaboratoriesApiService,
    private pagination: PaginationService,
    private returnUnitsState: ReturnUnitsStateService,
  ) {
    this.pagination.tablePageSize.subscribe(({ skip, pageSize }) => {
      if (!this.allowPagerUpdates) {
        return;
      }
      const size = typeof pageSize === 'number' && pageSize > 0 ? pageSize : this.pageSize || 10;
      const newPage = Math.floor((typeof skip === 'number' ? skip : 0) / size) + 1;
      const pagerKey = `${newPage}|${size}`;
      if (pagerKey === this.lastPagerKey) return;
      this.lastPagerKey = pagerKey;
      this.pageSize = size;
      this.backendPage = newPage;
      this.loadPage();
    });
  }

  ngOnInit(): void {
    this.loadLaboratories();

    const savedState = this.returnUnitsState.getListState();
    if (savedState) {
      this.totalItems = savedState.totalItems;
      this.pageSize = savedState.pageSize;
      this.backendPage = savedState.backendPage;
      this.filtroNome = savedState.filtroNome;
      this.filtroLaboratorio = savedState.filtroLaboratorio;
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

  private mapOrderField(field: 'CreatedDate' | 'Name' | 'Status'): ReturnUnitSortableField {
    switch (field) {
      case 'Name':
        return 'name';
      case 'Status':
        return 'isActive';
      case 'CreatedDate':
      default:
        return 'createdAt';
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
    this.filtroLaboratorio = '';
    this.filtroAtivo = '';
    this.backendPage = 1;
    this.loadPage();
  }

  labName(row: ReturnUnitViewModel): string {
    return row.laboratory?.tradeName ?? '—';
  }

  private loadLaboratories() {
    this.labsApi
      .list({ page: 1, pageSize: 100, orderBy: 'tradeName', ascending: true })
      .subscribe((res) => {
        this.labs = res.items || [];
      });
  }

  private loadPage() {
    this.carregando = true;
    this.lastPagerKey = `${this.backendPage}|${this.pageSize}`;
    const params: ListReturnUnitsParams = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
    };

    if (this.filtroNome) params.name = this.filtroNome;
    if (this.filtroLaboratorio) params.laboratoryId = this.filtroLaboratorio;
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
        this.returnUnitsState.setMany(this.tableData);
        this.returnUnitsState.setListState({
          tableData: this.tableData,
          totalItems: this.totalItems,
          pageSize: this.pageSize,
          backendPage: this.backendPage,
          filtroNome: this.filtroNome,
          filtroLaboratorio: this.filtroLaboratorio,
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
