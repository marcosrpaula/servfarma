import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component pages
import { FaqsComponent } from './faqs/faqs.component';
import { GalleryComponent } from './gallery/gallery.component';
import { PagesBlogGridComponent } from './pages-blog-grid/pages-blog-grid.component';
import { PagesBlogListComponent } from './pages-blog-list/pages-blog-list.component';
import { PagesBlogOverviewComponent } from './pages-blog-overview/pages-blog-overview.component';
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

const routes: Routes = [
  {
    path: 'starter',
    component: StarterComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'profile-setting',
    component: SettingsComponent,
  },
  {
    path: 'team',
    component: TeamComponent,
  },
  {
    path: 'timeline',
    component: TimelineComponent,
  },
  {
    path: 'faqs',
    component: FaqsComponent,
  },
  {
    path: 'pricing',
    component: PricingComponent,
  },
  {
    path: 'gallery',
    component: GalleryComponent,
  },
  {
    path: 'sitemap',
    component: SitemapComponent,
  },
  {
    path: 'search-results',
    component: SearchResultsComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'terms-condition',
    component: TermsConditionComponent,
  },
  {
    path: 'pages-blog-list',
    component: PagesBlogListComponent,
  },
  {
    path: 'pages-blog-grid',
    component: PagesBlogGridComponent,
  },
  {
    path: 'pages-blog-overview',
    component: PagesBlogOverviewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExtraPagesRoutingModule {}
