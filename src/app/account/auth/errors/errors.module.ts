import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

// Load Icons
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

// Component
import { AltComponent } from './alt/alt.component';
import { BasicComponent } from './basic/basic.component';
import { CoverComponent } from './cover/cover.component';
import { Error404RoutingModule } from './errors-routing.module';
import { OfflineComponent } from './offline/offline.component';
import { Page500Component } from './page500/page500.component';

@NgModule({
  declarations: [BasicComponent, CoverComponent, AltComponent, Page500Component, OfflineComponent],
  imports: [CommonModule, Error404RoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ErrorsModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
