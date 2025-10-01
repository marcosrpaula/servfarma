import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './users/user-list.component';
import { UserFormComponent } from './users/user-form.component';
import { RoleListComponent } from './roles/role-list.component';
import { RoleFormComponent } from './roles/role-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
  { path: 'usuarios', component: UserListComponent },
  { path: 'usuarios/novo', component: UserFormComponent },
  { path: 'usuarios/:id', component: UserFormComponent },
  { path: 'roles', component: RoleListComponent },
  { path: 'roles/novo', component: RoleFormComponent },
  { path: 'roles/:id', component: RoleFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
