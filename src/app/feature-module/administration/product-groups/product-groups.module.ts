import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { ProductGroupsRoutingModule } from './product-groups-routing.module';
import { ProductGroupsComponent } from './product-groups/product-groups.component';

@NgModule({
  declarations: [ProductGroupsComponent],
  imports: [
    CommonModule,
    ServfarmaSharedModule,
    CustomPaginationModule,
    ProductGroupsRoutingModule,
  ],
})
export class ProductGroupsModule {}
