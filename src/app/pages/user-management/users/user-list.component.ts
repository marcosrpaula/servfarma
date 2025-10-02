import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserSummary } from '../../../core/models/user-management.models';
import { UserManagementService } from '../../../core/services/user-management.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: false
})
export class UserListComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Gestao' },
    { label: 'Usuarios', active: true }
  ];
  users: UserSummary[] = [];
  loading = false;
  error?: string;

  constructor(
    private readonly router: Router,
    private readonly userManagementService: UserManagementService,
    private readonly permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.permissionService.ensurePermissionsLoaded();
    this.loadUsers();
  }

  get canCreateUser(): boolean {
    return this.permissionService.hasAccess('user', 'write');
  }

  get canEditUser(): boolean {
    return this.permissionService.hasAccess('user', 'write');
  }

  loadUsers(): void {
    this.loading = true;
    this.error = undefined;
    this.userManagementService.listUsers().subscribe({
      next: response => {
        this.users = response.items ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Nao foi possivel carregar a lista de usuarios. Tente novamente mais tarde.';
        this.loading = false;
      }
    });
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
