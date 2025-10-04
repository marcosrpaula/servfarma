import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CouriersRoutingModule } from './couriers-routing.module';
import { CouriersComponent } from './couriers/couriers.component';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';

@NgModule({
  declarations: [CouriersComponent],
  imports: [CommonModule, FormsModule, ServfarmaSharedModule, CustomPaginationModule, CouriersRoutingModule],
})
export class CouriersModule {}
