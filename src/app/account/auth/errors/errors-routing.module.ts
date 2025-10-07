import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AltComponent } from './alt/alt.component';
import { BasicComponent } from './basic/basic.component';
import { CoverComponent } from './cover/cover.component';
import { OfflineComponent } from './offline/offline.component';
import { Page500Component } from './page500/page500.component';

const routes: Routes = [
  {
    path: '404-basic',
    component: BasicComponent,
  },
  {
    path: '404-cover',
    component: CoverComponent,
  },
  {
    path: '404-alt',
    component: AltComponent,
  },
  {
    path: 'page-500',
    component: Page500Component,
  },
  {
    path: 'offline',
    component: OfflineComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Error404RoutingModule {}
