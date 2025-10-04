import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { FormsModule } from '@angular/forms';
import { ServfarmaSharedModule } from '../../shared/servfarma-shared.module';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { LeadsDashboardComponent } from './leads-dashboard/leads-dashboard.component';
import { DealsDashboardComponent } from './deals-dashboard/deals-dashboard.component';
import { ChipsModule } from 'primeng/chips';
import { ModalDashboardComponent } from './modal-dashboard/modal-dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AdminDashboardComponent,
    EmployeeDashboardComponent,
    LeadsDashboardComponent,
    DealsDashboardComponent,
    ModalDashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    TimepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ServfarmaSharedModule,
    ChipsModule
  ]
})
export class DashboardModule { }
