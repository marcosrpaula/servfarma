import { Component, OnInit } from '@angular/core';

import { nftwalletData } from 'src/app/core/data';
import { walletModel } from './wallet.model';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  standalone: false,
})

/**
 * Wallet Component
 */
export class WalletComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  walletData!: walletModel[];

  constructor() {}

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'NFT Marketplace' },
      { label: 'Wallet Connect', active: true },
    ];

    /**
     * fetches data
     */
    this._fetchData();
  }

  /**
   * NFT Wallet data fetches
   */
  private _fetchData() {
    this.walletData = nftwalletData;
  }
}
