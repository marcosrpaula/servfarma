import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
import { PlaceholderComponent } from './placeholder/placeholder.component';
import { ProgressComponent } from './progress/progress.component';
import { RibbonsComponent } from './ribbons/ribbons.component';
import { TabsComponent } from './tabs/tabs.component';
import { TypographyComponent } from './typography/typography.component';
import { UtilitiesComponent } from './utilities/utilities.component';
import { VideoComponent } from './video/video.component';

const routes: Routes = [
  {
    path: 'alerts',
    component: AlertsComponent,
  },
  {
    path: 'badges',
    component: BadgesComponent,
  },
  {
    path: 'buttons',
    component: ButtonsComponent,
  },
  {
    path: 'cards',
    component: CardsComponent,
  },
  {
    path: 'carousel',
    component: CarouselComponent,
  },
  {
    path: 'dropdowns',
    component: DropdownsComponent,
  },
  {
    path: 'grid',
    component: GridComponent,
  },
  {
    path: 'images',
    component: ImagesComponent,
  },
  {
    path: 'tabs',
    component: TabsComponent,
  },
  {
    path: 'colors',
    component: ColorsComponent,
  },
  {
    path: 'accordions',
    component: AccordionsComponent,
  },
  {
    path: 'modals',
    component: ModalsComponent,
  },
  {
    path: 'placeholder',
    component: PlaceholderComponent,
  },
  {
    path: 'progress',
    component: ProgressComponent,
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
  },
  {
    path: 'media',
    component: MediaComponent,
  },
  {
    path: 'video',
    component: VideoComponent,
  },
  {
    path: 'typography',
    component: TypographyComponent,
  },
  {
    path: 'list',
    component: ListComponent,
  },
  {
    path: 'general',
    component: GeneralComponent,
  },
  {
    path: 'ribbons',
    component: RibbonsComponent,
  },
  {
    path: 'utilities',
    component: UtilitiesComponent,
  },
  {
    path: 'links',
    component: LinksComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UiRoutingModule {}
