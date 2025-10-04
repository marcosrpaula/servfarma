import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CourierCompaniesRoutingModule } from './courier-companies-routing.module';
import { CourierCompaniesComponent } from './courier-companies/courier-companies.component';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';

@NgModule({
  declarations: [CourierCompaniesComponent],
  imports: [CommonModule, FormsModule, ServfarmaSharedModule, CustomPaginationModule, CourierCompaniesRoutingModule],
})
export class CourierCompaniesModule {}
