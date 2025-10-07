import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdownModule,
  NgbPaginationModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';

// FlatPicker
import { FlatpickrModule } from 'angularx-flatpickr';

// Simplebar
import { SimplebarAngularModule } from 'simplebar-angular';

// Load Icon
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

// Component pages
import { SharedModule } from '../../shared/shared.module';
import { BasicComponent } from './basic/basic.component';
import { GridjsComponent } from './gridjs/gridjs.component';
import { ListjsComponent } from './listjs/listjs.component';
import { TablesRoutingModule } from './tables-routing.module';

// Ng Search
import { NgPipesModule } from 'ngx-pipes';

// Sorting page
import { NgbdListSortableHeader } from './listjs/listjs-sortable.directive';

@NgModule({
  declarations: [BasicComponent, GridjsComponent, ListjsComponent, NgbdListSortableHeader],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    FlatpickrModule,
    TablesRoutingModule,
    SharedModule,
    SimplebarAngularModule,
    NgPipesModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class TablesModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
