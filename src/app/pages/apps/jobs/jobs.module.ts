import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdownModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

// Routing
import { SharedModule } from 'src/app/shared/shared.module';
import { CandidateListsModule } from './candidate-lists/candidate-lists.module';
import { JobListsModule } from './job-lists/job-lists.module';
import { JobsRoutingModule } from './jobs-routing.module';

// Component
import { ApplicationComponent } from './application/application.component';
import { CompaniesListComponent } from './companies-list/companies-list.component';
import { JobCategoriesComponent } from './job-categories/job-categories.component';
import { NewjobComponent } from './newjob/newjob.component';
import { StatisticsComponent } from './statistics/statistics.component';

// Apex Chart Package
import { NgApexchartsModule } from 'ng-apexcharts';

// Feather Icon
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';

// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';

// Ng Select
import { NgSelectModule } from '@ng-select/ng-select';
// Load Icon
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

@NgModule({
  declarations: [
    StatisticsComponent,
    ApplicationComponent,
    NewjobComponent,
    CompaniesListComponent,
    JobCategoriesComponent,
  ],
  imports: [
    CommonModule,
    JobsRoutingModule,
    SharedModule,
    NgApexchartsModule,
    FeatherModule.pick(allIcons),
    NgbDropdownModule,
    JobListsModule,
    CandidateListsModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    FlatpickrModule,
    NgSelectModule,
    NgbPaginationModule,
    NgbNavModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class JobsModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
