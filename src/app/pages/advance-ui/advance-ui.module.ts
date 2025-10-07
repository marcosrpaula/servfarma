import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { NgbDropdownModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';

// Simple bar
import { SimplebarAngularModule } from 'simplebar-angular';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

// Scrollto
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

// Load Icon
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

// Component pages
import { SharedModule } from '../../shared/shared.module';
import { AsvanceUiRoutingModule } from './advance-ui-routing.module';
import { HighlightComponent } from './highlight/highlight.component';
import { RatingsComponent } from './ratings/ratings.component';
import { ScrollbarComponent } from './scrollbar/scrollbar.component';
import { ScrollspyComponent } from './scrollspy/scrollspy.component';
import { SweetalertsComponent } from './sweetalerts/sweetalerts.component';
import { SwipersComponent } from './swiper/swiper.component';
import { TourComponent } from './tour/tour.component';

@NgModule({
  declarations: [
    SweetalertsComponent,
    ScrollbarComponent,
    TourComponent,
    SwipersComponent,
    RatingsComponent,
    HighlightComponent,
    ScrollspyComponent,
  ],
  imports: [
    CommonModule,
    NgbDropdownModule,
    NgbRatingModule,
    SimplebarAngularModule,
    AsvanceUiRoutingModule,
    SlickCarouselModule,
    SharedModule,
    ScrollToModule.forRoot(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdvanceUiModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
