import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../../core/access-control/permission.guard';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectUpsertComponent } from './project-upsert/project-upsert.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectsComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'projects', level: 'read' } },
  },
  {
    path: 'create',
    component: ProjectUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'projects', level: 'write' } },
  },
  {
    path: ':id/edit',
    component: ProjectUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'projects', level: 'write' } },
  },
  {
    path: ':id/view',
    component: ProjectUpsertComponent,
    canActivate: [PermissionGuard],
    data: { permission: { module: 'projects', level: 'read' }, readOnly: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
