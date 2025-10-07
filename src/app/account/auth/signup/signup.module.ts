import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BasicComponent } from './basic/basic.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

// Component
import { CoverComponent } from './cover/cover.component';
import { SigninRoutingModule } from './signup-routing.module';

@NgModule({
  declarations: [BasicComponent, CoverComponent],
  imports: [CommonModule, NgbCarouselModule, ReactiveFormsModule, FormsModule, SigninRoutingModule],
})
export class SignupModule {}
