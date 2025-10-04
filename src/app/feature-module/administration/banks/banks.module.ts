import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { BanksRoutingModule } from './banks-routing.module';
import { BanksComponent } from './banks/banks.component';

@NgModule({
  declarations: [BanksComponent],
  imports: [CommonModule, ServfarmaSharedModule, CustomPaginationModule, BanksRoutingModule],
})
export class BanksModule {}

