import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../../core/access-control/permission.guard';
import { CourierCompaniesComponent } from './courier-companies/courier-companies.component';
import { CourierCompanyUpsertComponent } from './courier-company-upsert/courier-company-upsert.component';

const routes: Routes = [
  {
    path: '',
    component: CourierCompaniesComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'couriers', level: 'read' } },
  },
  {
    path: 'create',
    component: CourierCompanyUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'couriers', level: 'write' } },
  },
  {
    path: ':id/edit',
    component: CourierCompanyUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'couriers', level: 'write' } },
  },
  {
    path: ':id/view',
    component: CourierCompanyUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'couriers', level: 'read' }, readOnly: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourierCompaniesRoutingModule {}
