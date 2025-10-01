import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModalModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeatherIconsModule } from 'src/app/shared-modules/feather-icons.module';
import { AdministrationRoutingModule } from './administration-routing.module';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserFormComponent } from './users/user-form/user-form.component';
import { PermissionGridComponent } from './users/permission-grid/permission-grid.component';

@NgModule({
  declarations: [UserListComponent, UserFormComponent, PermissionGridComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbPaginationModule,
    NgbModalModule,
    NgbTooltipModule,
    NgSelectModule,
    SharedModule,
    FeatherIconsModule,
    AdministrationRoutingModule,
  ],
})
export class AdministrationModule {}
