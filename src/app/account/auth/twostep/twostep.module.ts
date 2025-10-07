import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

// otp module
import { NgOtpInputModule } from 'ng-otp-input';

// Component
import { BasicComponent } from './basic/basic.component';
import { CoverComponent } from './cover/cover.component';
import { TwoStepRoutingModule } from './twostep-routing.module';

@NgModule({
  declarations: [BasicComponent, CoverComponent],
  imports: [
    CommonModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    FormsModule,
    NgOtpInputModule,
    TwoStepRoutingModule,
  ],
})
export class TwostepModule {}
