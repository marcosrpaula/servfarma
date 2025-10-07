import { Component, OnInit } from '@angular/core';

import { MonthlyPlan, SimplePlan, YearlyPlan, pricingPlan } from 'src/app/core/data';
import { MonthlyPlanModel, PricingModel, SimpleModel, YearlyPlanModel } from './pricing.model';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
  standalone: false,
})

/**
 * Pricing Component
 */
export class PricingComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  MonthlyPlan!: MonthlyPlanModel[];
  YearlyPlan!: YearlyPlanModel[];
  pricingPlan!: PricingModel[];
  SimplePlan!: SimpleModel[];

  constructor() {}

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [{ label: 'Pages' }, { label: 'Pricing', active: true }];

    // Chat Data Get Function
    this._fetchData();
  }

  // Chat Data Fetch
  private _fetchData() {
    this.MonthlyPlan = MonthlyPlan;
    this.YearlyPlan = YearlyPlan;
    this.pricingPlan = pricingPlan;
    this.SimplePlan = SimplePlan;
  }
}
