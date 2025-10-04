import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../../core/access-control/permission.guard';

import { UsersComponent } from './users/users.component';
import { UserUpsertComponent } from './user-upsert/user-upsert.component';
import { PermissionsComponent } from './permissions/permissions.component';

// Se você tiver um shell (ex.: UserManagementComponent), troque conforme o seu.
// Aqui vou sem shell para manter simples.
const routes: Routes = [
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'users', level: 'read' } },
  },
  {
    path: 'users/create',
    component: UserUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'users', level: 'write' } },
  },
  {
    path: 'users/:id/edit',
    component: UserUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'users', level: 'write' } },
  },
  {
    path: 'roles-permissions',
    component: PermissionsComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'users', level: 'read' } },
  },
  { path: '', pathMatch: 'full', redirectTo: 'users' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule {}
