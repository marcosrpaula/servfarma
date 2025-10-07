import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../../core/access-control/permission.guard';
import { CourierUpsertComponent } from './courier-upsert/courier-upsert.component';
import { CouriersComponent } from './couriers/couriers.component';

const routes: Routes = [
  {
    path: '',
    component: CouriersComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'couriers', level: 'read' } },
  },
  {
    path: 'create',
    component: CourierUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'couriers', level: 'write' } },
  },
  {
    path: ':id/edit',
    component: CourierUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'couriers', level: 'write' } },
  },
  {
    path: ':id/view',
    component: CourierUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'couriers', level: 'read' }, readOnly: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CouriersRoutingModule {}
