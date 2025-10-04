import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeatureModuleComponent } from './feature-module.component';
import { PermissionGuard } from '../core/access-control/permission.guard';
import { SigninComponent } from '../auth/signin/signin.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { OtpComponent } from '../auth/otp/otp.component';
import { ForgotPasswordComponent } from '../auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../auth/reset-password/reset-password.component';
import { SuccessComponent } from '../auth/success/success.component';
import { Login2Component } from '../auth/login-2/login-2.component';
import { Login3Component } from '../auth/login-3/login-3.component';
import { ForgotPassword2Component } from '../auth/forgot-password-2/forgot-password-2.component';
import { ForgotPassword3Component } from '../auth/forgot-password-3/forgot-password-3.component';
import { ResetPassword2Component } from '../auth/reset-password-2/reset-password-2.component';
import { ResetPassword3Component } from '../auth/reset-password-3/reset-password-3.component';
import { RegisterComponent } from '../auth/register/register.component';
import { Register2Component } from '../auth/register-2/register-2.component';
import { Register3Component } from '../auth/register-3/register-3.component';
import { EmailVerificationComponent } from '../auth/email-verification/email-verification.component';
import { EmailVerification2Component } from '../auth/email-verification-2/email-verification-2.component';
import { EmailVerification3Component } from '../auth/email-verification-3/email-verification-3.component';
import { TwoStepVerificationComponent } from '../auth/two-step-verification/two-step-verification.component';
import { TwoStepVerification2Component } from '../auth/two-step-verification-2/two-step-verification-2.component';
import { TwoStepVerification3Component } from '../auth/two-step-verification-3/two-step-verification-3.component';
import { PasswordStrengthComponent } from '../auth/password-strength/password-strength.component';
import { Success3Component } from '../auth/success-3/success-3.component';
import { Success2Component } from '../auth/success-2/success-2.component';
import { LockScreenComponent } from '../auth/lock-screen/lock-screen.component';
import { Error404Component } from '../auth/error-404/error-404.component';
import { Error500Component } from '../auth/error-500/error-500.component';
import { ModalDashboardComponent } from './dashboard/modal-dashboard/modal-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: FeatureModuleComponent,
    children: [
      {
        path: 'signin',
        component: SigninComponent,
      },

      {
        path: 'login-2',
        component: Login2Component,
      },
      {
        path: 'login-3',
        component: Login3Component,
      },
      {
        path: 'signup',
        component: SignupComponent,
      },
      {
        path: 'otp',
        component: OtpComponent,
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
      },
      {
        path: 'forgot-password-2',
        component: ForgotPassword2Component,
      },
      {
        path: 'forgot-password-3',
        component: ForgotPassword3Component,
      },
      {
        path: 'password-strength',
        component: PasswordStrengthComponent,
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
      },
      {
        path: 'reset-password-2',
        component: ResetPassword2Component,
      },
      {
        path: 'reset-password-3',
        component: ResetPassword3Component,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'register-2',
        component: Register2Component,
      },
      {
        path: 'register-3',
        component: Register3Component,
      },
      {
        path: 'email-verification',
        component: EmailVerificationComponent,
      },
      {
        path: 'email-verification-2',
        component: EmailVerification2Component,
      },
      {
        path: 'email-verification-3',
        component: EmailVerification3Component,
      },
      {
        path: 'two-step-verification',
        component: TwoStepVerificationComponent,
      },
      {
        path: 'two-step-verification-2',
        component: TwoStepVerification2Component,
      },
      {
        path: 'two-step-verification-3',
        component: TwoStepVerification3Component,
      },
      {
        path: 'success',
        component: SuccessComponent,
      },
      {
        path: 'success-2',
        component: Success2Component,
      },
      {
        path: 'success-3',
        component: Success3Component,
      },
      {
        path: 'lock-screen',
        component: LockScreenComponent,
      },

      {
        path: 'error-404',
        component: Error404Component,
      },

      {
        path: 'error-500',
        component: Error500Component,
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      { path: 'layout-horizontal', component: ModalDashboardComponent },
      { path: 'layout-detached', component: ModalDashboardComponent },
      { path: 'layout-modern', component: ModalDashboardComponent },
      { path: 'layout-two-column', component: ModalDashboardComponent },
      { path: 'layout-hovered', component: ModalDashboardComponent },
      { path: 'layout-boxed', component: ModalDashboardComponent },
      { path: 'layout-horizontal-single', component: ModalDashboardComponent },
      { path: 'layout-horizontal-overlay', component: ModalDashboardComponent },
      { path: 'layout-horizontal-box', component: ModalDashboardComponent },
      {
        path: 'layout-horizontal-sidemenu',
        component: ModalDashboardComponent,
      },
      {
        path: 'layout-vertical-transparent',
        component: ModalDashboardComponent,
      },
      { path: 'layout-without-header', component: ModalDashboardComponent },
      { path: 'layout-default', component: ModalDashboardComponent },
      { path: 'layout-rtl', component: ModalDashboardComponent },
      { path: 'layout-dark', component: ModalDashboardComponent },
      {
        path: 'banks',
        canMatch: [PermissionGuard],
        data: { permission: { module: 'banks', level: 'read' } },
        loadChildren: () =>
          import('./administration/banks/banks.module').then(
            (m) => m.BanksModule
          ),
      },
      {
        path: 'laboratories',
        canMatch: [PermissionGuard],
        data: { permission: { module: 'laboratories', level: 'read' } },
        loadChildren: () =>
          import('./administration/laboratories/laboratories.module').then(
            (m) => m.LaboratoriesModule
          ),
      },
      {
        path: 'courier-companies',
        canMatch: [PermissionGuard],
        data: { permission: { module: 'couriers', level: 'read' } },
        loadChildren: () =>
          import('./administration/courier-companies/courier-companies.module').then(
            (m) => m.CourierCompaniesModule
          ),
      },
      {
        path: 'couriers',
        canMatch: [PermissionGuard],
        data: { permission: { module: 'couriers', level: 'read' } },
        loadChildren: () =>
          import('./administration/couriers/couriers.module').then(
            (m) => m.CouriersModule
          ),
      },
      {
        path: 'return-units',
        canMatch: [PermissionGuard],
        data: { permission: { module: 'return-units', level: 'read' } },
        loadChildren: () =>
          import('./administration/return-units/return-units.module').then(
            (m) => m.ReturnUnitsModule
          ),
      },
      {
        path: 'projects',
        canMatch: [PermissionGuard],
        data: { permission: { module: 'projects', level: 'read' } },
        loadChildren: () =>
          import('./administration/projects/projects.module').then(
            (m) => m.ProjectsModule
          ),
      },
      {
        path: 'supplies',
        canMatch: [PermissionGuard],
        data: { permission: { module: 'supplies', level: 'read' } },
        loadChildren: () =>
          import('./administration/supplies/supplies.module').then(
            (m) => m.SuppliesModule
          ),
      },
      {
        path: 'user-management',
        canMatch: [PermissionGuard],
        data: { permission: ['users:read', 'roles:read'], permissionMode: 'any' },
        loadChildren: () =>
          import('./administration/user-management/user-management.module').then((m) => m.UserManagementModule),
      },
      {
        path: 'pharmaceutical-forms',
        canMatch: [PermissionGuard],
        data: { permission: { module: 'pharmaceutical-forms', level: 'read' } },
        loadChildren: () =>
          import('./administration/pharmaceutical-forms/pharmaceutical-forms.module').then((m) => m.PharmaceuticalFormsModule),
      },
      {
        path: 'units',
        canMatch: [PermissionGuard],
        data: { permission: { module: 'units', level: 'read' } },
        loadChildren: () =>
          import('./administration/units/units.module').then((m) => m.UnitsModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeatureModuleRoutingModule {}

