import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DateRangePickerComponent } from './date-range-picker.component';

@NgModule({
  declarations: [DateRangePickerComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BsDatepickerModule],
  exports: [DateRangePickerComponent],
})
export class DateRangePickerModule {}
