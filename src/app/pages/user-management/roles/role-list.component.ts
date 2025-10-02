import { Component, OnInit } from '@angular/core';
import { RoleSummary } from '../../../core/models/user-management.models';
import { UserManagementService } from '../../../core/services/user-management.service';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
  standalone: false
})
export class RoleListComponent implements OnInit {
  breadCrumbItems = [
    { label: 'Gestao' },
    { label: 'Perfis', active: true }
  ];
  roles: RoleSummary[] = [];
  loading = false;
  error?: string;

  constructor(private readonly userManagementService: UserManagementService) { }

  ngOnInit(): void {
    this.loadRoles();
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
        this.error = 'Nao foi possivel carregar os perfis. Tente novamente mais tarde.';
        this.loading = false;
      }
    });
  }

  trackByRoleId(_: number, role: RoleSummary): string {
    return role.id;
  }
}
