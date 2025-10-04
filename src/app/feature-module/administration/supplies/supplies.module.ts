import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SuppliesRoutingModule } from './supplies-routing.module';
import { SuppliesComponent } from './supplies/supplies.component';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';

@NgModule({
  declarations: [SuppliesComponent],
  imports: [CommonModule, FormsModule, ServfarmaSharedModule, CustomPaginationModule, SuppliesRoutingModule],
})
export class SuppliesModule {}
