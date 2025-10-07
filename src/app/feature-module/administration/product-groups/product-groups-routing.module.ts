import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../../core/access-control/permission.guard';
import { ProductGroupUpsertComponent } from './product-group-upsert/product-group-upsert.component';
import { ProductGroupsComponent } from './product-groups/product-groups.component';

const routes: Routes = [
  {
    path: '',
    component: ProductGroupsComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'product-groups', level: 'read' } },
  },
  {
    path: 'create',
    component: ProductGroupUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'product-groups', level: 'write' } },
  },
  {
    path: ':id/view',
    component: ProductGroupUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'product-groups', level: 'read' }, readOnly: true },
  },
  {
    path: ':id/edit',
    component: ProductGroupUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'product-groups', level: 'write' } },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductGroupsRoutingModule {}
