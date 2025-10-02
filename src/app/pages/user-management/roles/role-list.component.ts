import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { RoleSummary } from '../../../core/models/user-management.models';
import { UserManagementService } from '../../../core/services/user-management.service';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
  standalone: false
})
export class RoleListComponent implements OnInit, OnDestroy {
  breadCrumbItems = [
    { label: 'Gestao' },
    { label: 'Perfis', active: true }
  ];
  filterForm: FormGroup;
  roles: RoleSummary[] = [];
  allRoles: RoleSummary[] = [];
  loading = false;
  error?: string;
  hasFiltersActive = false;
  private filtersSubscription?: Subscription;

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.filtersSubscription = this.filterForm.valueChanges
      .pipe(debounceTime(200))
      .subscribe(() => this.applyFilters());
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.filtersSubscription?.unsubscribe();
  }

  loadRoles(): void {
    this.loading = true;
    this.error = undefined;
    this.userManagementService.listRoles()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: response => {
          this.allRoles = response?.items ?? [];
          this.applyFilters();
        },
        error: () => {
          this.error = 'Nao foi possivel carregar os perfis. Tente novamente mais tarde.';
          this.roles = [];
          this.allRoles = [];
        }
      });
  }

  resetFilters(): void {
    this.filterForm.reset({ search: '' });
  }

  trackByRoleId(_: number, role: RoleSummary): string {
    return role.id;
  }

  private applyFilters(): void {
    const { search } = this.filterForm.getRawValue();
    const trimmedSearch = search?.trim() ?? '';
    this.hasFiltersActive = !!trimmedSearch;

    let filtered = [...this.allRoles];

    if (trimmedSearch) {
      const term = trimmedSearch.toLowerCase();
      filtered = filtered.filter(role => this.matchesSearch(role, term));
    }

    this.roles = filtered;
  }

  private matchesSearch(role: RoleSummary, term: string): boolean {
    const searchable = [role?.name, role?.description, role?.id];
    return searchable.some(value => (value ?? '').toLowerCase().includes(term));
  }
}
