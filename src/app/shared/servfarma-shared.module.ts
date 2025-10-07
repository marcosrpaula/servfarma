import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { LightgalleryModule } from 'lightgallery/angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxEditorModule } from 'ngx-editor';
import { LightboxModule } from 'ngx-lightbox';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { HasPermissionDirective } from '../core/access-control/has-permission.directive';
import { HasReadOnlyPermissionDirective } from '../core/access-control/has-read-only-permission.directive';
import { BreadcrumbsComponent } from '../feature-module/common/breadcrumbs/breadcrumbs.component';
import { CollapseHeaderModule } from '../feature-module/common/collapse-header/collapse-header.module';
import { DateRangePickerModule } from '../feature-module/common/date-range-picker/date-range-picker.module';
import { FooterComponent } from '../feature-module/common/footer/footer.component';

@NgModule({
  declarations: [BreadcrumbsComponent, FooterComponent],
  imports: [
    CommonModule,
    RouterModule,
    NgScrollbarModule,
    MatTooltipModule,
    LightboxModule,
    CarouselModule,
    BsDatepickerModule.forRoot(),
    LightgalleryModule,
    MatSelectModule,
    MatSortModule,
    NgScrollbarModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgxDropzoneModule,
    NgApexchartsModule,
    TooltipModule.forRoot(),
    ToastModule,
    NgxEditorModule,
    PopoverModule,
    CollapseHeaderModule,
    DateRangePickerModule,
    FormsModule,
    FullCalendarModule,
    CalendarModule,
    HasPermissionDirective,
    HasReadOnlyPermissionDirective,
  ],
  exports: [
    CommonModule,
    RouterModule,
    NgScrollbarModule,
    MatTooltipModule,
    LightboxModule,
    CarouselModule,
    BsDatepickerModule,
    LightgalleryModule,
    MatSelectModule,
    MatSortModule,
    NgScrollbarModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgxDropzoneModule,
    NgApexchartsModule,
    TooltipModule,
    ToastModule,
    NgxEditorModule,
    PopoverModule,
    CollapseHeaderModule,
    DateRangePickerModule,
    BreadcrumbsComponent,
    FooterComponent,
    HasPermissionDirective,
    HasReadOnlyPermissionDirective,
    FormsModule,
    FullCalendarModule,
    CalendarModule,
  ],
  providers: [provideNgxMask(), DatePipe, BsDatepickerConfig],
})
export class ServfarmaSharedModule {}
