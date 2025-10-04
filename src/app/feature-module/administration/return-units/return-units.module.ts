import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReturnUnitsRoutingModule } from './return-units-routing.module';
import { ReturnUnitsComponent } from './return-units/return-units.component';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';

@NgModule({
  declarations: [ReturnUnitsComponent],
  imports: [CommonModule, FormsModule, ServfarmaSharedModule, CustomPaginationModule, ReturnUnitsRoutingModule],
})
export class ReturnUnitsModule {}
