import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { combineLatest, firstValueFrom, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { PermissionDirective } from 'src/app/core/models/permission.model';
import { Role, RoleSummary } from 'src/app/core/models/role.model';
import { SortState } from 'src/app/core/models/pagination.model';
import { UserAccount, UserStatus } from 'src/app/core/models/user.model';
import { RootReducerState } from 'src/app/store';
import { BreadcrumbsComponent } from 'src/app/shared/breadcrumbs/breadcrumbs.component';
import * as UsersActions from 'src/app/store/Administration/users/users.actions';
import * as UsersSelectors from 'src/app/store/Administration/users/users.selectors';
import * as RolesActions from 'src/app/store/Administration/roles/roles.actions';
import * as RolesSelectors from 'src/app/store/Administration/roles/roles.selectors';
import { UserFormComponent } from '../user-form/user-form.component';

interface ColumnConfig {
  key: string;
  label: string;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class UserListComponent implements OnInit, OnDestroy {
  breadCrumbItems: BreadcrumbsComponent['breadcrumbItems'] = [];
  pageTitle = 'Gestão de usuários';

  filterForm!: FormGroup;
  readonly users$ = this.store.select(UsersSelectors.selectUsers);
  readonly loading$ = this.store.select(UsersSelectors.selectUsersLoading);
  readonly pagination$ = this.store.select(UsersSelectors.selectUsersPagination);
  readonly filters$ = this.store.select(UsersSelectors.selectUsersFilters);
  readonly sort$ = this.store.select(UsersSelectors.selectUsersSort);
  readonly mutationLoading$ = this.store.select(UsersSelectors.selectUsersMutationLoading);
  readonly mutationError$ = this.store.select(UsersSelectors.selectUsersMutationError);
  readonly roles$ = this.store.select(RolesSelectors.selectRoles);
  readonly rolesLoading$ = this.store.select(RolesSelectors.selectRolesLoading);
  readonly permissionsCatalog$ = this.store.select(RolesSelectors.selectPermissionsCatalog);

  currentSort: SortState | null = null;
  readonly statusOptions: { value: UserStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' },
    { value: 'blocked', label: 'Bloqueados' },
  ];

  readonly columns: ColumnConfig[] = [
    { key: 'name', label: 'Usuário' },
    { key: 'email', label: 'E-mail' },
    { key: 'roles', label: 'Perfis' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Criado em' },
  ];

  readonly statusBadgeMap: Record<UserStatus, string> = {
    active: 'bg-soft-success text-success',
    inactive: 'bg-soft-warning text-warning',
    blocked: 'bg-soft-danger text-danger',
  };

  readonly statusLabelMap: Record<UserStatus, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    blocked: 'Bloqueado',
  };

  private destroy$ = new Subject<void>();

  constructor(private store: Store<RootReducerState>, private fb: FormBuilder, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Administração' },
      { label: 'Usuários', active: true },
    ];

    this.filterForm = this.fb.group({
      search: [''],
      status: ['all'],
      roles: [[]],
    });

    this.store.dispatch(UsersActions.initUsersPage());
    this.store.dispatch(RolesActions.loadRoles());

    this.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters) => this.filterForm.patchValue(filters, { emitEvent: false }));

    this.sort$
      .pipe(takeUntil(this.destroy$))
      .subscribe((sort) => (this.currentSort = sort));

    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => this.store.dispatch(UsersActions.setFilters({ filters: value })));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(page: number): void {
    this.store.dispatch(UsersActions.setPagination({ page }));
  }

  changePageSize(pageSize: number | string): void {
    const size = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
    this.store.dispatch(UsersActions.setPagination({ page: 1, pageSize: size }));
  }

  onSort(column: string): void {
    const newDirection: SortState['direction'] =
      this.currentSort?.active === column && this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    this.store.dispatch(UsersActions.setSort({ sort: { active: column, direction: newDirection } }));
  }

  clearFilters(): void {
    this.filterForm.reset({ search: '', status: 'all', roles: [] });
    this.store.dispatch(UsersActions.resetFilters());
  }

  async openCreateUser(): Promise<void> {
    const [roles, permissions] = await this.getRolesAndPermissions();
    const modalRef = this.modalService.open(UserFormComponent, {
      size: 'xl',
      scrollable: true,
      backdrop: 'static',
      centered: true,
    });

    const component = modalRef.componentInstance as UserFormComponent;
    component.roles = roles;
    component.permissionsCatalog = permissions;
    component.mode = 'create';

    let hasSubmitted = false;
    const statusSub = combineLatest([this.mutationLoading$, this.mutationError$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([loading, error]) => {
        component.loading = loading;
        component.submissionError = error ?? null;
        if (hasSubmitted && !loading && !error) {
          modalRef.close();
        }
      });

    component.save.subscribe((payload) => {
      hasSubmitted = true;
      this.store.dispatch(UsersActions.createUser({ payload: payload as any }));
    });

    component.cancel.subscribe(() => modalRef.dismiss());

    modalRef.closed.pipe(take(1)).subscribe(() => {
      statusSub.unsubscribe();
    });
    modalRef.dismissed.pipe(take(1)).subscribe(() => {
      statusSub.unsubscribe();
    });
  }

  async openEditUser(user: UserAccount): Promise<void> {
    const [roles, permissions] = await this.getRolesAndPermissions();
    const modalRef = this.modalService.open(UserFormComponent, {
      size: 'xl',
      scrollable: true,
      backdrop: 'static',
      centered: true,
    });
    const component = modalRef.componentInstance as UserFormComponent;
    component.roles = roles;
    component.permissionsCatalog = permissions;
    component.mode = 'edit';
    component.initialValue = user;

    let hasSubmitted = false;
    const statusSub = combineLatest([this.mutationLoading$, this.mutationError$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([loading, error]) => {
        component.loading = loading;
        component.submissionError = error ?? null;
        if (hasSubmitted && !loading && !error) {
          modalRef.close();
        }
      });

    component.save.subscribe((payload) => {
      hasSubmitted = true;
      this.store.dispatch(UsersActions.updateUser({ payload: payload as any }));
    });
    component.cancel.subscribe(() => modalRef.dismiss());

    modalRef.closed.pipe(take(1)).subscribe(() => {
      statusSub.unsubscribe();
    });
    modalRef.dismissed.pipe(take(1)).subscribe(() => {
      statusSub.unsubscribe();
    });
  }

  toggleStatus(user: UserAccount): void {
    const nextStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    this.store.dispatch(
      UsersActions.updateUserStatus({ payload: { id: user.id, status: nextStatus } })
    );
  }

  trackByUser(_: number, user: UserAccount): string {
    return user.id;
  }

  trackByRole(_: number, role: Role | RoleSummary): string {
    return role.id;
  }

  displayName(user: UserAccount): string {
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return name || user.email || user.id;
  }

  statusLabel(status: UserStatus): string {
    return this.statusLabelMap[status] ?? status;
  }

  private getRolesAndPermissions(): Promise<[Role[], PermissionDirective[]]> {
    return firstValueFrom(
      combineLatest([this.roles$, this.permissionsCatalog$]).pipe(take(1))
    );
  }
}
