import { Component, OnInit } from '@angular/core';
import { UsersApiService } from '../services/users.api.service';
import { UserViewModel, UserDetailsViewModel } from '../../../../shared/models/users';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';

type UserRow = UserViewModel & { roles?: string[] };

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: false
})
export class UsersComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Administracao' },
    { label: 'Usuarios', active: true },
  ];

  // tabela
  tableData: UserRow[] = [];

  // paginação (server-side)
  pageSize = 10;
  backendPage = 1;
  totalItems = 0;

  // filtros
  filtroNome = '';
  filtroEmail = '';
  filtroAtivo: '' | 'true' | 'false' = '';
  // sem filtro por função na listagem

  // ordenação
  orderBy: string = 'createdAt';
  ascending: boolean = false;

  orderLabel: string = 'CreatedDate';

  // carregamento
  carregando = false;

  // anti-loop / dedupe
  private lastPagerKey = '';
  private lastRequestSignature = '';

  // roles na listagem (sem fetch por usuário)

  constructor(
    private api: UsersApiService,
    private pagination: PaginationService
  ) {
    this.pagination.tablePageSize.subscribe(({ skip, limit, pageSize }) => {
      const size = (typeof pageSize === 'number' && pageSize > 0) ? pageSize : this.pageSize || 10;
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
      case 'CreatedDate': return 'createdAt';
      case 'Name':        return 'name';
      case 'Email':       return 'email';
      case 'Status':      return 'isActive';
      default:            return 'createdAt';
    }
  }

  sortBy(field: string, dir: 'asc' | 'desc') {
    this.orderBy = this.mapOrderField(field);
    this.ascending = dir === 'asc';
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
    this.filtroEmail = '';
    this.filtroAtivo = '';
    this.backendPage = 1;
    this.loadPage();
  }

  private loadPage() {
    this.carregando = true;

    const params: any = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
    };
    if (this.filtroNome) params.name = this.filtroNome;
    if (this.filtroEmail) params.email = this.filtroEmail;
    if (this.filtroAtivo !== '') params.isActive = this.filtroAtivo === 'true';

    const signature = JSON.stringify(params);
    if (signature === this.lastRequestSignature) {
      this.carregando = false;
      return;
    }
    this.lastRequestSignature = signature;

    this.api.list(params).subscribe({
      next: (res) => {
        const items = res.items || [];
        this.totalItems = res.totalCount ?? 0;

        this.tableData = items.map(u => ({
          ...u,
        }));

        this.pagination.calculatePageSize.next({
          totalData: this.totalItems,
          pageSize: this.pageSize,
          tableData: this.tableData,
          serialNumberArray: [],
        });

        // sem filtro local por função

        this.carregando = false;
      },
      error: () => { this.carregando = false; }
    });
  }

  // Ordenação pelo clique no cabeçalho
  toggleSort(fieldLabel: 'CreatedDate' | 'Name' | 'Email' | 'Status') {
    if (this.orderLabel === fieldLabel) {
      this.ascending = !this.ascending;
    } else {
      this.orderLabel = fieldLabel;
      this.ascending = true;
    }
    this.sortBy(this.orderLabel, this.ascending ? 'asc' : 'desc');
  }

}



