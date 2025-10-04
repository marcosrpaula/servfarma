import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LightboxModule } from 'ngx-lightbox';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { LightgalleryModule } from 'lightgallery/angular';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { NgxEditorModule } from 'ngx-editor';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { CollapseHeaderModule } from '../feature-module/common/collapse-header/collapse-header.module';
import { DateRangePickerModule } from '../feature-module/common/date-range-picker/date-range-picker.module';
import { BreadcrumbsComponent } from '../feature-module/common/breadcrumbs/breadcrumbs.component';
import { FooterComponent } from '../feature-module/common/footer/footer.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { HasPermissionDirective } from '../core/access-control/has-permission.directive';
import { HasReadOnlyPermissionDirective } from '../core/access-control/has-read-only-permission.directive';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    FooterComponent,
  ],
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
  providers: [
    provideNgxMask(),
    DatePipe,
    BsDatepickerConfig,
  ],
})
export class ServfarmaSharedModule {}



