import { Component, OnInit, inject } from '@angular/core';
import { RolesApiService } from '../services/roles.api.service';
import { RoleViewModel } from '../../../../shared/models/users';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  standalone: false,
})
export class PermissionsComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Administracao' },
    { label: 'Roles & Permissions', active: true },
  ];

  private rolesApi = inject(RolesApiService);

  loading = true;
  // dados
  allRoles: RoleViewModel[] = [];
  filteredRoles: RoleViewModel[] = [];
  roles: RoleViewModel[] = [];

  // busca + paginação (client-side)
  searchTerm = '';
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];
  currentPage = 1;
  totalPages = 0;
  trackById = (_: number, r: RoleViewModel) => r.id;
  get startIndex() {
    return this.filteredRoles.length
      ? (this.currentPage - 1) * this.pageSize
      : 0;
  }
  get endIndex() {
    return Math.min(
      this.startIndex + this.roles.length,
      this.filteredRoles.length
    );
  }

  ngOnInit(): void {
    this.fetchAllRoles();
  }

  private fetchAllRoles() {
    this.loading = true;
    let page = 1;
    const pageSize = 100;
    const buffer: RoleViewModel[] = [];
    const fetchPage = () => {
      this.rolesApi
        .list({ page, pageSize, orderBy: 'name', ascending: true })
        .subscribe({
          next: (res: any) => {
            const items: RoleViewModel[] = res.items || [];
            buffer.push(...items);
            const hasNext = !!res.has_next_page;
            if (hasNext) {
              page += 1;
              fetchPage();
            } else {
              this.allRoles = buffer;
              this.applyFilter();
              this.loading = false;
            }
          },
          error: () => {
            // em caso de erro, mostra o que já tiver
            this.allRoles = buffer;
            this.applyFilter();
            this.loading = false;
          },
        });
    };
    fetchPage();
  }

  onSearchChange(value: string) {
    this.searchTerm = value || '';
    this.currentPage = 1;
    this.applyFilter();
  }

  // filtros instantâneos apenas por searchTerm

  changePageSize(size: number) {
    this.pageSize = Number(size) || 10;
    this.currentPage = 1;
    this.recalculate();
  }

  private applyFilter() {
    const term = this.searchTerm?.trim().toLowerCase();
    this.filteredRoles = this.allRoles.filter((r) => {
      const name = (r.name || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();

      const passSearch = term
        ? name.includes(term) || desc.includes(term)
        : true;
      return passSearch;
    });
    this.recalculate();
  }

  private recalculate() {
    const total = this.filteredRoles.length;
    this.totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.roles = this.filteredRoles.slice(start, end);
  }

  goTo(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.recalculate();
  }

  prev() {
    this.goTo(this.currentPage - 1);
  }
  next() {
    this.goTo(this.currentPage + 1);
  }
}


