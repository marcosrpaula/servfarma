import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

// Load Icons
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

// Component
import { BasicComponent } from './basic/basic.component';
import { CoverComponent } from './cover/cover.component';
import { PassResetRoutingModule } from './pass-reset-routing.module';

@NgModule({
  declarations: [BasicComponent, CoverComponent],
  imports: [
    CommonModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    FormsModule,
    PassResetRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PassResetModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
