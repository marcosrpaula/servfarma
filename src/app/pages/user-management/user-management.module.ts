import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { SharedModule } from '../../shared/shared.module';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserListComponent } from './users/user-list.component';
import { UserFormComponent } from './users/user-form.component';
import { RoleListComponent } from './roles/role-list.component';
import { RoleFormComponent } from './roles/role-form.component';

@NgModule({
  declarations: [
    UserListComponent,
    UserFormComponent,
    RoleListComponent,
    RoleFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbTooltipModule,
    NgSelectModule,
    SharedModule,
    UserManagementRoutingModule
  ]
})
export class UserManagementModule { }
