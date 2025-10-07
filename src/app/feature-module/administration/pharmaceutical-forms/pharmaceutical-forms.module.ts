import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { PharmaceuticalFormsRoutingModule } from './pharmaceutical-forms-routing.module';
import { PharmaceuticalFormsComponent } from './pharmaceutical-forms/pharmaceutical-forms.component';

@NgModule({
  declarations: [PharmaceuticalFormsComponent],
  imports: [
    CommonModule,
    ServfarmaSharedModule,
    CustomPaginationModule,
    PharmaceuticalFormsRoutingModule,
  ],
})
export class PharmaceuticalFormsModule {}
