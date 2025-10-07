import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdownModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';

// Counter
import { CountUpModule } from 'ngx-countup';
// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

// Apex Chart Package
import { NgApexchartsModule } from 'ng-apexcharts';

// File Uploads
import { DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';

// NG2 Search Filter
import { NgPipesModule } from 'ngx-pipes';

// Component pages
import { SharedModule } from '../../shared/shared.module';
import { BuySellComponent } from './buy-sell/buy-sell.component';
import { CryptoRoutingModule } from './crypto-routing.module';
import { IcoComponent } from './ico/ico.component';
import { KycComponent } from './kyc/kyc.component';
import { OrdersComponent } from './orders/orders.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { WalletComponent } from './wallet/wallet.component';

// Load Icons
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*',
};

@NgModule({
  declarations: [
    TransactionsComponent,
    BuySellComponent,
    OrdersComponent,
    WalletComponent,
    IcoComponent,
    KycComponent,
  ],

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbNavModule,
    NgbDropdownModule,
    CountUpModule,
    FlatpickrModule,
    SlickCarouselModule,
    NgApexchartsModule,
    DropzoneModule,
    CryptoRoutingModule,
    SharedModule,
    NgPipesModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CryptoModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
