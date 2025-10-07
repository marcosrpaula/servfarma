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
import { LogoutRoutingModule } from './logout-routing.module';

@NgModule({
  declarations: [BasicComponent, CoverComponent],
  imports: [CommonModule, NgbCarouselModule, ReactiveFormsModule, FormsModule, LogoutRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LogoutModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
