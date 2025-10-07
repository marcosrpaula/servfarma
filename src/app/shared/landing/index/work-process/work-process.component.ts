import { Component, OnInit } from '@angular/core';

import { Process } from './data';
import { ProcessModel } from './work-process.module';

@Component({
  selector: 'app-work-process',
  templateUrl: './work-process.component.html',
  styleUrls: ['./work-process.component.scss'],
  standalone: false,
})

/**
 * WorkProcess Component
 */
export class WorkProcessComponent implements OnInit {
  Process!: ProcessModel[];

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
    this.Process = Process;
  }
}
