import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbAccordionModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

// Select Droup down
import { NgSelectModule } from '@ng-select/ng-select';
// Flatpicker
import { FlatpickrModule } from 'angularx-flatpickr';

// Feather Icon
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';

// Ng Search
import { NgPipesModule } from 'ngx-pipes';

// Load Icon
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

// Component pages
import { SharedModule } from '../../shared/shared.module';
import { ExtraPagesRoutingModule } from './extrapages-routing.module';
import { FaqsComponent } from './faqs/faqs.component';
import { GalleryComponent } from './gallery/gallery.component';
import { PricingComponent } from './pricing/pricing.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { SettingsComponent } from './profile/settings/settings.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SitemapComponent } from './sitemap/sitemap.component';
import { StarterComponent } from './starter/starter.component';
import { TeamComponent } from './team/team.component';
import { TermsConditionComponent } from './terms-condition/terms-condition.component';
import { TimelineComponent } from './timeline/timeline.component';

@NgModule({
  declarations: [
    StarterComponent,
    ProfileComponent,
    SettingsComponent,
    TeamComponent,
    TimelineComponent,
    FaqsComponent,
    PricingComponent,
    GalleryComponent,
    SitemapComponent,
    SearchResultsComponent,
    PrivacyPolicyComponent,
    TermsConditionComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbNavModule,
    NgbDropdownModule,
    NgbAccordionModule,
    NgbTooltipModule,
    NgbPaginationModule,
    SlickCarouselModule,
    NgSelectModule,
    FlatpickrModule,
    ExtraPagesRoutingModule,
    SharedModule,
    FeatherModule.pick(allIcons),
    NgPipesModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExtraspagesModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
