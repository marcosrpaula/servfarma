import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmaceuticalFormsComponent } from './pharmaceutical-forms/pharmaceutical-forms.component';
import { PharmaceuticalFormUpsertComponent } from './pharmaceutical-form-upsert/pharmaceutical-form-upsert.component';
import { PermissionGuard } from '../../../core/access-control/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: PharmaceuticalFormsComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'pharmaceutical-forms', level: 'read' } },
  },
  {
    path: 'create',
    component: PharmaceuticalFormUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'pharmaceutical-forms', level: 'write' } },
  },
  {
    path: ':id/view',
    component: PharmaceuticalFormUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'pharmaceutical-forms', level: 'read' }, readOnly: true },
  },
  {
    path: ':id/edit',
    component: PharmaceuticalFormUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'pharmaceutical-forms', level: 'write' } },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PharmaceuticalFormsRoutingModule {}
