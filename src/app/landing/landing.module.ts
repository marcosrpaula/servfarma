import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IndexComponent } from './index/index.component';

import { NgbCarouselModule, NgbCollapseModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

import { SharedModule } from '../shared/shared.module';
import { JobComponent } from './job/job.component';
import { LandingRoutingModule } from './landing-routing.module';
import { NftComponent } from './nft/nft.component';

@NgModule({
  declarations: [IndexComponent, NftComponent, JobComponent],
  imports: [
    CommonModule,
    NgbCarouselModule,
    LandingRoutingModule,
    SharedModule,
    NgbTooltipModule,
    NgbCollapseModule,
    ScrollToModule.forRoot(),
  ],
})
export class LandingModule {}
