import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { CouriersRoutingModule } from './couriers-routing.module';
import { CouriersComponent } from './couriers/couriers.component';

@NgModule({
  declarations: [CouriersComponent],
  imports: [
    CommonModule,
    FormsModule,
    ServfarmaSharedModule,
    CustomPaginationModule,
    CouriersRoutingModule,
  ],
})
export class CouriersModule {}
