import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RolesApiService } from './services/roles.api.service';
import { UsersApiService } from './services/users.api.service';

import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { PermissionsComponent } from './permissions/permissions.component';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './user-management.component';
import { UsersComponent } from './users/users.component';

@NgModule({
  declarations: [UserManagementComponent, UsersComponent, PermissionsComponent],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    ServfarmaSharedModule,
    CustomPaginationModule,
  ],
  providers: [UsersApiService, RolesApiService],
})
export class UserManagementModule {}
