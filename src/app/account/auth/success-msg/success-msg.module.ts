import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

// Component
import { BasicComponent } from './basic/basic.component';
import { CoverComponent } from './cover/cover.component';
import { SuccessMsgRoutingModule } from './success-msg-routing.module';

@NgModule({
  declarations: [CoverComponent, BasicComponent],
  imports: [
    CommonModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    FormsModule,
    SuccessMsgRoutingModule,
  ],
})
export class SuccessMsgModule {}
