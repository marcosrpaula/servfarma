import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  NgbAccordionModule,
  NgbAlertModule,
  NgbCarouselModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbToastModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

// Load Icons
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

import { SimplebarAngularModule } from 'simplebar-angular';

import { NgxMasonryModule } from 'ngx-masonry';

import { SharedModule } from '../../shared/shared.module';
import { AccordionsComponent } from './accordions/accordions.component';
import { AlertsComponent } from './alerts/alerts.component';
import { BadgesComponent } from './badges/badges.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { CardsComponent } from './cards/cards.component';
import { CarouselComponent } from './carousel/carousel.component';
import { ColorsComponent } from './colors/colors.component';
import { DropdownsComponent } from './dropdowns/dropdowns.component';
import { GeneralComponent } from './general/general.component';
import { GridComponent } from './grid/grid.component';
import { ImagesComponent } from './images/images.component';
import { LinksComponent } from './links/links.component';
import { ListComponent } from './list/list.component';
import { MediaComponent } from './media/media.component';
import { ModalsComponent } from './modals/modals.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ToastsContainer } from './notifications/toasts-container.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';
import { ProgressComponent } from './progress/progress.component';
import { RibbonsComponent } from './ribbons/ribbons.component';
import { TabsComponent } from './tabs/tabs.component';
import { TypographyComponent } from './typography/typography.component';
import { UiRoutingModule } from './ui-routing.module';
import { UtilitiesComponent } from './utilities/utilities.component';
import { VideoComponent } from './video/video.component';

@NgModule({
  declarations: [
    AlertsComponent,
    ButtonsComponent,
    BadgesComponent,
    ColorsComponent,
    CardsComponent,
    CarouselComponent,
    DropdownsComponent,
    GridComponent,
    ImagesComponent,
    TabsComponent,
    AccordionsComponent,
    ModalsComponent,
    PlaceholderComponent,
    ProgressComponent,
    NotificationsComponent,
    MediaComponent,
    VideoComponent,
    TypographyComponent,
    ListComponent,
    GeneralComponent,
    RibbonsComponent,
    UtilitiesComponent,
    ToastsContainer,
    LinksComponent,
  ],
  imports: [
    CommonModule,
    UiRoutingModule,
    SharedModule,
    FormsModule,
    NgbAlertModule,
    NgbCarouselModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbProgressbarModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgbPaginationModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbCollapseModule,
    NgbToastModule,
    SimplebarAngularModule,
    NgxMasonryModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UiModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
