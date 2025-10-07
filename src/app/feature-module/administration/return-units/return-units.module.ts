import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { ReturnUnitsRoutingModule } from './return-units-routing.module';
import { ReturnUnitsComponent } from './return-units/return-units.component';

@NgModule({
  declarations: [ReturnUnitsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ServfarmaSharedModule,
    CustomPaginationModule,
    ReturnUnitsRoutingModule,
  ],
})
export class ReturnUnitsModule {}
