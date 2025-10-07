import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { LaboratoriesRoutingModule } from './laboratories-routing.module';
import { LaboratoriesComponent } from './laboratories/laboratories.component';

@NgModule({
  declarations: [LaboratoriesComponent],
  imports: [CommonModule, ServfarmaSharedModule, CustomPaginationModule, LaboratoriesRoutingModule],
})
export class LaboratoriesModule {}
