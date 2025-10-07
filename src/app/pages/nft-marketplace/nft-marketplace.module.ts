import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExploreComponent } from './explore/explore.component';

// Bootstrap
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbProgressbarModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';

// Ngx Sliders
import { NgxSliderModule } from 'ngx-slider-v2';

// Drop Zone
import { DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';

// Simplebar
import { SimplebarAngularModule } from 'simplebar-angular';

// Component pages
import { SharedModule } from '../../shared/shared.module';
import { AuctionComponent } from './auction/auction.component';
import { CollectionsComponent } from './collections/collections.component';
import { CreateComponent } from './create/create.component';
import { CreatorsComponent } from './creators/creators.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { NftMarketplaceRoutingModule } from './nft-marketplace-routing.module';
import { RankingComponent } from './ranking/ranking.component';
import { WalletComponent } from './wallet/wallet.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*',
};

@NgModule({
  declarations: [
    ExploreComponent,
    AuctionComponent,
    WalletComponent,
    CreatorsComponent,
    CreateComponent,
    CollectionsComponent,
    ItemDetailsComponent,
    MarketplaceComponent,
    RankingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NftMarketplaceRoutingModule,
    NgbDropdownModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbProgressbarModule,
    NgbNavModule,
    NgbCollapseModule,
    SharedModule,
    NgxSliderModule,
    DropzoneModule,
    SimplebarAngularModule,
  ],
})
export class NftMarketplaceModule {}
