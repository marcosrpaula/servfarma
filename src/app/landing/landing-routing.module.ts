import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component Pages
import { IndexComponent } from './index/index.component';
import { JobComponent } from './job/job.component';
import { NftComponent } from './nft/nft.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
  },
  {
    path: 'nft',
    component: NftComponent,
  },
  {
    path: 'job',
    component: JobComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandingRoutingModule {}
