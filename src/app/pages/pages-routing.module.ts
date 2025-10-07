import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PermissionGuard } from '../core/access-control/permission.guard';
import { DashboardComponent } from './dashboards/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'dashboard',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'banks',
    canMatch: [PermissionGuard],
    data: { permission: { module: 'banks', level: 'read' } },
    loadChildren: () =>
      import('../feature-module/administration/banks/banks.module').then((m) => m.BanksModule),
  },
  {
    path: 'laboratories',
    canMatch: [PermissionGuard],
    data: { permission: { module: 'laboratories', level: 'read' } },
    loadChildren: () =>
      import('../feature-module/administration/laboratories/laboratories.module').then(
        (m) => m.LaboratoriesModule,
      ),
  },
  {
    path: 'courier-companies',
    canMatch: [PermissionGuard],
    data: { permission: { module: 'couriers', level: 'read' } },
    loadChildren: () =>
      import('../feature-module/administration/courier-companies/courier-companies.module').then(
        (m) => m.CourierCompaniesModule,
      ),
  },
  {
    path: 'couriers',
    canMatch: [PermissionGuard],
    data: { permission: { module: 'couriers', level: 'read' } },
    loadChildren: () =>
      import('../feature-module/administration/couriers/couriers.module').then(
        (m) => m.CouriersModule,
      ),
  },
  {
    path: 'return-units',
    canMatch: [PermissionGuard],
    data: { permission: { module: 'return-units', level: 'read' } },
    loadChildren: () =>
      import('../feature-module/administration/return-units/return-units.module').then(
        (m) => m.ReturnUnitsModule,
      ),
  },
  {
    path: 'projects',
    canMatch: [PermissionGuard],
    data: { permission: { module: 'projects', level: 'read' } },
    loadChildren: () =>
      import('../feature-module/administration/projects/projects.module').then(
        (m) => m.ProjectsModule,
      ),
  },
  {
    path: 'supplies',
    canMatch: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'read' } },
    loadChildren: () =>
      import('../feature-module/administration/supplies/supplies.module').then(
        (m) => m.SuppliesModule,
      ),
  },
  {
    path: 'pharmaceutical-forms',
    canMatch: [PermissionGuard],
    data: { permission: { module: 'pharmaceutical-forms', level: 'read' } },
    loadChildren: () =>
      import(
        '../feature-module/administration/pharmaceutical-forms/pharmaceutical-forms.module'
      ).then((m) => m.PharmaceuticalFormsModule),
  },
  {
    path: 'units',
    canMatch: [PermissionGuard],
    data: { permission: { module: 'units', level: 'read' } },
    loadChildren: () =>
      import('../feature-module/administration/units/units.module').then((m) => m.UnitsModule),
  },
  {
    path: 'user-management',
    canMatch: [PermissionGuard],
    data: { permission: ['users:read', 'roles:read'], permissionMode: 'any' },
    loadChildren: () =>
      import('../feature-module/administration/user-management/user-management.module').then(
        (m) => m.UserManagementModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
