import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { UnitsRoutingModule } from './units-routing.module';
import { UnitsComponent } from './units/units.component';

@NgModule({
  declarations: [UnitsComponent],
  imports: [CommonModule, ServfarmaSharedModule, CustomPaginationModule, UnitsRoutingModule],
})
export class UnitsModule {}
