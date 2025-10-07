import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ChipsModule } from 'primeng/chips';
import { ServfarmaSharedModule } from '../../shared/servfarma-shared.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DealsDashboardComponent } from './deals-dashboard/deals-dashboard.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { LeadsDashboardComponent } from './leads-dashboard/leads-dashboard.component';
import { ModalDashboardComponent } from './modal-dashboard/modal-dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AdminDashboardComponent,
    EmployeeDashboardComponent,
    LeadsDashboardComponent,
    DealsDashboardComponent,
    ModalDashboardComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    TimepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ServfarmaSharedModule,
    ChipsModule,
  ],
})
export class DashboardModule {}
