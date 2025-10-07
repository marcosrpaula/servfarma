import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../../core/access-control/permission.guard';
import { ReturnUnitUpsertComponent } from './return-unit-upsert/return-unit-upsert.component';
import { ReturnUnitsComponent } from './return-units/return-units.component';

const routes: Routes = [
  {
    path: '',
    component: ReturnUnitsComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'return-units', level: 'read' } },
  },
  {
    path: 'create',
    component: ReturnUnitUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'return-units', level: 'write' } },
  },
  {
    path: ':id/edit',
    component: ReturnUnitUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'return-units', level: 'write' } },
  },
  {
    path: ':id/view',
    component: ReturnUnitUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'return-units', level: 'read' }, readOnly: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReturnUnitsRoutingModule {}
