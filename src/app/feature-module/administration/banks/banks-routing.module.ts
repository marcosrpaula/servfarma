import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BanksComponent } from './banks/banks.component';
import { BankUpsertComponent } from './bank-upsert/bank-upsert.component';
import { PermissionGuard } from '../../../core/access-control/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: BanksComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'banks', level: 'read' } },
  },
  {
    path: 'create',
    component: BankUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'banks', level: 'write' } },
  },
  {
    path: ':id/view',
    component: BankUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'banks', level: 'read' }, readOnly: true },
  },
  {
    path: ':id/edit',
    component: BankUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'banks', level: 'write' } },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BanksRoutingModule {}



