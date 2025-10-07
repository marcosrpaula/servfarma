import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { BanksRoutingModule } from './banks-routing.module';
import { BanksComponent } from './banks/banks.component';

@NgModule({
  declarations: [BanksComponent],
  imports: [CommonModule, ServfarmaSharedModule, CustomPaginationModule, BanksRoutingModule],
})
export class BanksModule {}
