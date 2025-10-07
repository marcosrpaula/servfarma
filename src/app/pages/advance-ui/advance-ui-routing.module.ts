import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component pages
import { HighlightComponent } from './highlight/highlight.component';
import { RatingsComponent } from './ratings/ratings.component';
import { ScrollbarComponent } from './scrollbar/scrollbar.component';
import { ScrollspyComponent } from './scrollspy/scrollspy.component';
import { SweetalertsComponent } from './sweetalerts/sweetalerts.component';
import { SwipersComponent } from './swiper/swiper.component';
import { TourComponent } from './tour/tour.component';

const routes: Routes = [
  {
    path: 'sweetalerts',
    component: SweetalertsComponent,
  },
  {
    path: 'scrollbar',
    component: ScrollbarComponent,
  },
  {
    path: 'tour',
    component: TourComponent,
  },
  {
    path: 'swiper',
    component: SwipersComponent,
  },
  {
    path: 'ratings',
    component: RatingsComponent,
  },
  {
    path: 'highlight',
    component: HighlightComponent,
  },
  {
    path: 'scrollspy',
    component: ScrollspyComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsvanceUiRoutingModule {}
