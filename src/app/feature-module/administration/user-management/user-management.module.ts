import { RolesApiService } from './services/roles.api.service';
import { UsersApiService } from './services/users.api.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './user-management.component';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { UsersComponent } from './users/users.component';
import { PermissionsComponent } from './permissions/permissions.component';


@NgModule({declarations: [
    UserManagementComponent,
    UsersComponent,
    PermissionsComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    ServfarmaSharedModule,
    CustomPaginationModule
  ]
,
  providers: [UsersApiService, RolesApiService]
})
export class UserManagementModule { }
