import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { UserSummary } from '../../../core/models/user-management.models';
import { UserManagementService } from '../../../core/services/user-management.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: false
})
export class UserListComponent implements OnInit, OnDestroy {
  breadCrumbItems = [
    { label: 'Gestao' },
    { label: 'Usuarios', active: true }
  ];
  filterForm: FormGroup;
  users: UserSummary[] = [];
  allUsers: UserSummary[] = [];
  loading = false;
  error?: string;
  hasFiltersActive = false;
  selectedUserIds = new Set<string>();
  private readonly defaultFilters = {
    search: '',
    status: 'all',
    createdFrom: '',
    createdTo: ''
  };
  private filtersSubscription?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly userManagementService: UserManagementService,
    private readonly permissionService: PermissionService,
    private readonly fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [this.defaultFilters.search],
      status: [this.defaultFilters.status],
      createdFrom: [this.defaultFilters.createdFrom],
      createdTo: [this.defaultFilters.createdTo]
    });
  }

  ngOnInit(): void {
    this.permissionService.ensurePermissionsLoaded();
    this.filtersSubscription = this.filterForm.valueChanges
      .pipe(debounceTime(200))
      .subscribe(() => this.applyFilters());
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.filtersSubscription?.unsubscribe();
  }

  get canCreateUser(): boolean {
    return this.permissionService.hasAccess('user', 'write');
  }

  get canEditUser(): boolean {
    return this.permissionService.hasAccess('user', 'write');
  }

  get selectedCount(): number {
    return this.selectedUserIds.size;
  }

  get isAllVisibleSelected(): boolean {
    return this.users.length > 0 && this.users.every(user => user?.id && this.selectedUserIds.has(user.id));
  }

  loadUsers(): void {
    this.loading = true;
    this.error = undefined;
    this.userManagementService.listUsers()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: response => {
          this.allUsers = response?.items ?? [];
          this.selectedUserIds.clear();
          this.applyFilters();
        },
        error: () => {
          this.error = 'Nao foi possivel carregar a lista de usuarios. Tente novamente mais tarde.';
          this.users = [];
          this.allUsers = [];
        }
      });
  }

  resetFilters(): void {
    this.filterForm.reset({ ...this.defaultFilters });
  }
  trackByUserId(_: number, item: UserSummary): string {
    return item.id;
  }

  getRoleNames(user: UserSummary): string {
    if (!user?.permissions?.length) {
      return '';
    }
    return user.permissions
      .map(role => role?.name)
      .filter((name): name is string => !!name)
      .join(', ');
  }

  getInitials(user: UserSummary): string {
    const source = (user?.name || user?.email || '').trim();
    if (!source) {
      return '';
    }
    const parts = source.split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return source.substring(0, 2).toUpperCase();
    }
    const initials = parts.slice(0, 2).map(part => part.charAt(0)).join('');
    return initials.toUpperCase();
  }

  isUserSelected(user: UserSummary): boolean {
    return !!user?.id && this.selectedUserIds.has(user.id);
  }

  toggleUserSelection(user: UserSummary, checked: boolean): void {
    if (!user?.id) {
      return;
    }
    if (checked) {
      this.selectedUserIds.add(user.id);
    } else {
      this.selectedUserIds.delete(user.id);
    }
  }

  toggleSelectAll(checked: boolean): void {
    if (!checked) {
      this.users.forEach(user => {
        if (user?.id) {
          this.selectedUserIds.delete(user.id);
        }
      });
      return;
    }
    this.users.forEach(user => {
      if (user?.id) {
        this.selectedUserIds.add(user.id);
      }
    });
  }

  private applyFilters(): void {
    const { search, status, createdFrom, createdTo } = this.filterForm.getRawValue();
    const trimmedSearch = search?.trim() ?? '';
    this.hasFiltersActive = !!trimmedSearch || status !== 'all' || !!createdFrom || !!createdTo;

    let filtered = [...this.allUsers];

    if (trimmedSearch) {
      const term = trimmedSearch.toLowerCase();
      filtered = filtered.filter(user => this.matchesSearch(user, term));
    }

    if (status === 'active' || status === 'inactive') {
      const expectation = status === 'active';
      filtered = filtered.filter(user => user.active === expectation);
    }

    const fromDate = this.normalizeDate(createdFrom, 'start');
    if (fromDate) {
      filtered = filtered.filter(user => {
        const createdAt = this.toDate(user.createdAt);
        return createdAt ? createdAt >= fromDate : false;
      });
    }

    const toDate = this.normalizeDate(createdTo, 'end');
    if (toDate) {
      filtered = filtered.filter(user => {
        const createdAt = this.toDate(user.createdAt);
        return createdAt ? createdAt <= toDate : false;
      });
    }

    this.users = filtered;
    this.cleanupSelection();
  }

  private matchesSearch(user: UserSummary, term: string): boolean {
    const searchable = [
      user?.name,
      user?.email,
      user?.id,
      this.getRoleNames(user)
    ];
    return searchable.some(value => (value ?? '').toLowerCase().includes(term));
  }

  private normalizeDate(value: string | undefined, boundary: 'start' | 'end'): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    const normalized = new Date(parsed);
    if (boundary === 'start') {
      normalized.setHours(0, 0, 0, 0);
    } else {
      normalized.setHours(23, 59, 59, 999);
    }
    return normalized;
  }

  private toDate(value?: string | null): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private cleanupSelection(): void {
    if (!this.selectedUserIds.size) {
      return;
    }
    const allowedIds = new Set(this.users.map(user => user.id).filter(id => !!id));
    Array.from(this.selectedUserIds).forEach(id => {
      if (!allowedIds.has(id)) {
        this.selectedUserIds.delete(id);
      }
    });
  }

  createUser(): void {
    this.router.navigate(['gestao', 'usuarios', 'novo']);
  }

  editUser(user: UserSummary): void {
    if (!user?.id) {
      return;
    }
    this.router.navigate(['gestao', 'usuarios', user.id]);
  }
}
