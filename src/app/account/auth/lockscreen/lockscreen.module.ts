import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

// Component
import { BasicComponent } from './basic/basic.component';
import { CoverComponent } from './cover/cover.component';
import { LockScreenRoutingModule } from './lockscreen-routing.module';

@NgModule({
  declarations: [BasicComponent, CoverComponent],
  imports: [
    CommonModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    FormsModule,
    LockScreenRoutingModule,
  ],
})
export class LockscreenModule {}
