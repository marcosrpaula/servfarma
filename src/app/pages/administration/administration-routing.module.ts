import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/guards/permission.guard';
import { UserListComponent } from './users/user-list/user-list.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [PermissionGuard],
    children: [
      {
        path: 'users',
        component: UserListComponent,
        data: {
          permissions: ['manage_users', 'users:read'],
          breadcrumb: ['Administração', 'Usuários'],
          pageTitle: 'Gestão de usuários',
        },
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'users',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministrationRoutingModule {}
