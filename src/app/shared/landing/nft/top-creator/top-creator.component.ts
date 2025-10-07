import { Component, OnInit } from '@angular/core';

import { creatorData } from './data';
import { creatorModel } from './top-creator.model';

@Component({
  selector: 'app-top-creator',
  templateUrl: './top-creator.component.html',
  styleUrls: ['./top-creator.component.scss'],
  standalone: false,
})

/**
 * TopCreator Component
 */
export class TopCreatorComponent implements OnInit {
  creatorData!: creatorModel[];

  constructor() {}

  ngOnInit(): void {
    this.creatorData = creatorData;
  }
}
