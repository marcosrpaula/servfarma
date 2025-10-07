import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdownModule,
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';

// routing
import { SharedModule } from 'src/app/shared/shared.module';
import { JobListsRoutingModule } from './job-lists-routing.module';

// component
import { ListComponent } from './list/list.component';

// Apex Chart Package
import { NgApexchartsModule } from 'ng-apexcharts';
import { GridComponent } from './grid/grid.component';
import { OverviewComponent } from './overview/overview.component';

@NgModule({
  declarations: [ListComponent, GridComponent, OverviewComponent],
  imports: [
    CommonModule,
    JobListsRoutingModule,
    SharedModule,
    NgbPaginationModule,
    NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    NgbDropdownModule,
    NgbTooltipModule,
  ],
})
export class JobListsModule {}
