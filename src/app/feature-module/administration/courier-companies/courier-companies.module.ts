import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { CourierCompaniesRoutingModule } from './courier-companies-routing.module';
import { CourierCompaniesComponent } from './courier-companies/courier-companies.component';

@NgModule({
  declarations: [CourierCompaniesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ServfarmaSharedModule,
    CustomPaginationModule,
    CourierCompaniesRoutingModule,
  ],
})
export class CourierCompaniesModule {}
