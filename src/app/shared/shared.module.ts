import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { NgbAccordionModule, NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

// Counter
import { CountUpModule } from 'ngx-countup';

import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ClientLogoComponent } from './landing/index/client-logo/client-logo.component';
import { CollectionComponent } from './landing/index/collection/collection.component';
import { ContactComponent } from './landing/index/contact/contact.component';
import { CounterComponent } from './landing/index/counter/counter.component';
import { CtaComponent } from './landing/index/cta/cta.component';
import { DesignedComponent } from './landing/index/designed/designed.component';
import { FaqsComponent } from './landing/index/faqs/faqs.component';
import { FooterComponent } from './landing/index/footer/footer.component';
import { PlanComponent } from './landing/index/plan/plan.component';
import { ReviewComponent } from './landing/index/review/review.component';
import { ServicesComponent } from './landing/index/services/services.component';
import { TeamComponent } from './landing/index/team/team.component';
import { WorkProcessComponent } from './landing/index/work-process/work-process.component';
import { LandingScrollspyDirective } from './landingscrollspy.directive';
import { ScrollspyDirective } from './scrollspy.directive';

// NFT Landing
import { CategoriesComponent } from './landing/nft/categories/categories.component';
import { DiscoverComponent } from './landing/nft/discover/discover.component';
import { FeaturesComponent } from './landing/nft/features/features.component';
import { MarketPlaceComponent } from './landing/nft/market-place/market-place.component';
import { TopCreatorComponent } from './landing/nft/top-creator/top-creator.component';
import { WalletComponent } from './landing/nft/wallet/wallet.component';

// Job Landing
import { BlogComponent } from './landing/job/blog/blog.component';
import { CandidatesComponent } from './landing/job/candidates/candidates.component';
import { FindjobsComponent } from './landing/job/findjobs/findjobs.component';
import { JobFooterComponent } from './landing/job/job-footer/job-footer.component';
import { JobcategoriesComponent } from './landing/job/jobcategories/jobcategories.component';
import { ProcessComponent } from './landing/job/process/process.component';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    ClientLogoComponent,
    ServicesComponent,
    CollectionComponent,
    CtaComponent,
    DesignedComponent,
    PlanComponent,
    FaqsComponent,
    ReviewComponent,
    CounterComponent,
    WorkProcessComponent,
    TeamComponent,
    ContactComponent,
    FooterComponent,
    MarketPlaceComponent,
    WalletComponent,
    FeaturesComponent,
    CategoriesComponent,
    DiscoverComponent,
    TopCreatorComponent,
    ProcessComponent,
    FindjobsComponent,
    CandidatesComponent,
    BlogComponent,
    JobcategoriesComponent,
    JobFooterComponent,
    ScrollspyDirective,
    LandingScrollspyDirective,
  ],
  imports: [
    CommonModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbDropdownModule,
    SlickCarouselModule,
    CountUpModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    BreadcrumbsComponent,
    ClientLogoComponent,
    ServicesComponent,
    CollectionComponent,
    CtaComponent,
    DesignedComponent,
    PlanComponent,
    FaqsComponent,
    ReviewComponent,
    CounterComponent,
    WorkProcessComponent,
    TeamComponent,
    ContactComponent,
    FooterComponent,
    WalletComponent,
    MarketPlaceComponent,
    FeaturesComponent,
    CategoriesComponent,
    DiscoverComponent,
    TopCreatorComponent,
    ScrollspyDirective,
    LandingScrollspyDirective,
    ProcessComponent,
    FindjobsComponent,
    CandidatesComponent,
    BlogComponent,
    JobcategoriesComponent,
    JobFooterComponent,
  ],
})
export class SharedModule {}
