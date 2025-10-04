import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LaboratoriesComponent } from './laboratories/laboratories.component';
import { LaboratoryUpsertComponent } from './laboratory-upsert/laboratory-upsert.component';
import { PermissionGuard } from '../../../core/access-control/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: LaboratoriesComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'laboratories', level: 'read' } },
  },
  {
    path: 'create',
    component: LaboratoryUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'laboratories', level: 'write' } },
  },
  {
    path: ':id/view',
    component: LaboratoryUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'laboratories', level: 'read' }, readOnly: true },
  },
  {
    path: ':id/edit',
    component: LaboratoryUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'laboratories', level: 'write' } },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LaboratoriesRoutingModule {}