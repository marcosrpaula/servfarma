import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../../core/access-control/permission.guard';
import { DryPackageUpsertComponent } from './dry-package-upsert/dry-package-upsert.component';
import { RefrigeratedPackageUpsertComponent } from './refrigerated-package-upsert/refrigerated-package-upsert.component';
import { SimpleSupplyUpsertComponent } from './simple-supply-upsert/simple-supply-upsert.component';
import { SuppliesComponent } from './supplies/supplies.component';

const routes: Routes = [
  {
    path: '',
    component: SuppliesComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'read' } },
  },
  {
    path: 'simple/create',
    component: SimpleSupplyUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'write' } },
  },
  {
    path: 'simple/:id/edit',
    component: SimpleSupplyUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'write' } },
  },
  {
    path: 'simple/:id/view',
    component: SimpleSupplyUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'read' }, readOnly: true },
  },
  {
    path: 'dry-package/create',
    component: DryPackageUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'write' } },
  },
  {
    path: 'dry-package/:id/edit',
    component: DryPackageUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'write' } },
  },
  {
    path: 'dry-package/:id/view',
    component: DryPackageUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'read' }, readOnly: true },
  },
  {
    path: 'refrigerated-package/create',
    component: RefrigeratedPackageUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'write' } },
  },
  {
    path: 'refrigerated-package/:id/edit',
    component: RefrigeratedPackageUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'write' } },
  },
  {
    path: 'refrigerated-package/:id/view',
    component: RefrigeratedPackageUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'supplies', level: 'read' }, readOnly: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuppliesRoutingModule {}
