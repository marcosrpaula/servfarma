import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from '../auth/forgot-password/forgot-password.component';
import { OtpComponent } from '../auth/otp/otp.component';
import { PasswordStrengthComponent } from '../auth/password-strength/password-strength.component';
import { ResetPasswordComponent } from '../auth/reset-password/reset-password.component';
import { SigninComponent } from '../auth/signin/signin.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { SuccessComponent } from '../auth/success/success.component';
import { ServfarmaSharedModule } from '../shared/servfarma-shared.module';
import { DefaultHeaderComponent } from './common/default-header/default-header.component';
import { DefaultSidebarComponent } from './common/default-sidebar/default-sidebar.component';
import { HorizontalSidebarComponent } from './common/horizontal-sidebar/horizontal-sidebar.component';
import { StackedSidebarComponent } from './common/stacked-sidebar/stacked-sidebar.component';
import { TwoColSidebarComponent } from './common/two-col-sidebar/two-col-sidebar.component';
import { FeatureModuleRoutingModule } from './feature-module-routing.module';
import { FeatureModuleComponent } from './feature-module.component';

@NgModule({
  declarations: [
    FeatureModuleComponent,
    OtpComponent,
    SigninComponent,
    ResetPasswordComponent,
    SignupComponent,
    ForgotPasswordComponent,
    DefaultSidebarComponent,
    DefaultHeaderComponent,
    HorizontalSidebarComponent,
    TwoColSidebarComponent,
    StackedSidebarComponent,
    PasswordStrengthComponent,
    SuccessComponent,
  ],
  imports: [CommonModule, FeatureModuleRoutingModule, ServfarmaSharedModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FeatureModuleModule {}
