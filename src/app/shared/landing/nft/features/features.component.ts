import { Component, OnInit } from '@angular/core';

import { featuresData } from './data';
import { featuresModel } from './features.model';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  standalone: false,
})

/**
 * Features Component
 */
export class FeaturesComponent implements OnInit {
  featuresData!: featuresModel[];

  constructor() {}

  ngOnInit(): void {
    /**
     * fetches data
     */
    this._fetchData();
  }

  /**
   * User grid data fetches
   */
  private _fetchData() {
    this.featuresData = featuresData;
  }
}
