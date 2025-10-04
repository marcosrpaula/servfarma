import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnitsComponent } from './units/units.component';
import { UnitUpsertComponent } from './unit-upsert/unit-upsert.component';
import { PermissionGuard } from '../../../core/access-control/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: UnitsComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'units', level: 'read' } },
  },
  {
    path: 'create',
    component: UnitUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'units', level: 'write' } },
  },
  {
    path: ':id/view',
    component: UnitUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'units', level: 'read' }, readOnly: true },
  },
  {
    path: ':id/edit',
    component: UnitUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'units', level: 'write' } },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnitsRoutingModule {}
