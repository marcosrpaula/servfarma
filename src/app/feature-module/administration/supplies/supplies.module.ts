import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { SuppliesRoutingModule } from './supplies-routing.module';
import { SuppliesComponent } from './supplies/supplies.component';

@NgModule({
  declarations: [SuppliesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ServfarmaSharedModule,
    CustomPaginationModule,
    SuppliesRoutingModule,
  ],
})
export class SuppliesModule {}
