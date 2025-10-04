import { Component, OnInit } from '@angular/core';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';
import {
  SuppliesApiService,
  ListSuppliesParams,
} from '../services/supplies.api.service';
import {
  SimpleItemViewModel,
  SupplySortableField,
  SupplyType,
} from '../../../../shared/models/supplies';
import { SuppliesStateService } from '../services/supplies-state.service';

function supplyTypeLabel(type: SupplyType): string {
  switch (type) {
    case SupplyType.SecurityEnvelope:
      return 'Envelope de Seguranca';
    case SupplyType.Label:
      return 'Etiqueta';
    case SupplyType.Receipt:
      return 'Recibo';
    case SupplyType.DryPackage:
      return 'Pacote Seco';
    case SupplyType.RefrigeratedPackage:
      return 'Pacote Refrigerado';
    default:
      return 'Desconhecido';
  }
}

function supplyEditPath(type: SupplyType): string {
  if (
    type === SupplyType.SecurityEnvelope ||
    type === SupplyType.Label ||
    type === SupplyType.Receipt
  ) {
    return 'simple';
  }
  if (type === SupplyType.DryPackage) {
    return 'dry-package';
  }
  return 'refrigerated-package';
}

@Component({
  selector: 'app-supplies',
  templateUrl: './supplies.component.html',
  styleUrls: ['./supplies.component.scss'],
  standalone: false,
})
export class SuppliesComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Catalogos' },
    { label: 'Suprimentos', active: true },
  ];
  supplyTypeLabel = supplyTypeLabel;
  supplyEditPath = supplyEditPath;

  tableData: SimpleItemViewModel[] = [];
  pageSize = 10;
  backendPage = 1;
  totalItems = 0;

  filtroNome = '';
  filtroAtivo: '' | 'true' | 'false' = '';

  orderBy: SupplySortableField = 'createdAt';
  ascending = false;
  orderLabel: 'CreatedDate' | 'Name' | 'Status' = 'CreatedDate';

  carregando = false;
  private lastPagerKey = '';
  private lastRequestSignature = '';
  private allowPagerUpdates = false;

  constructor(
    private api: SuppliesApiService,
    private pagination: PaginationService,
    private suppliesState: SuppliesStateService,
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
    const savedState = this.suppliesState.getListState();
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

  private mapOrderField(field: 'CreatedDate' | 'Name' | 'Status'): SupplySortableField {
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
    this.filtroAtivo = '';
    this.backendPage = 1;
    this.loadPage();
  }

  get SupplyType() {
    return SupplyType;
  }

  private loadPage() {
    this.carregando = true;
    this.lastPagerKey = `${this.backendPage}|${this.pageSize}`;
    const params: ListSuppliesParams = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
    };

    if (this.filtroNome) params.name = this.filtroNome;
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
        this.suppliesState.setMany(this.tableData);
        this.suppliesState.setListState({
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

