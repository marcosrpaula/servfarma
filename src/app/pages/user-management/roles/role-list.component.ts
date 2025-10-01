import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleSummary } from '../../../core/models/user-management.models';
import { UserManagementService } from '../../../core/services/user-management.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
  standalone: false
})
export class RoleListComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Gestão' },
    { label: 'Perfis', active: true }
  ];
  roles: RoleSummary[] = [];
  loading = false;
  error?: string;

  constructor(
    private readonly router: Router,
    private readonly userManagementService: UserManagementService,
    private readonly permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.permissionService.ensurePermissionsLoaded();
    this.loadRoles();
  }

  get canCreateRole(): boolean {
    return this.permissionService.hasAccess('role', 'write');
  }

  loadRoles(): void {
    this.loading = true;
    this.error = undefined;
    this.userManagementService.listRoles().subscribe({
      next: response => {
        this.roles = response.items ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar os perfis. Tente novamente mais tarde.';
        this.loading = false;
      }
    });
  }

  trackByRoleId(_: number, role: RoleSummary): string {
    return role.id;
  }

  createRole(): void {
    this.router.navigate(['gestao', 'roles', 'novo']);
  }

  editRole(role: RoleSummary): void {
    if (!role?.id) {
      return;
    }
    this.router.navigate(['gestao', 'roles', role.id]);
  }
}
