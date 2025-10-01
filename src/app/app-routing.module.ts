import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layouts/layout.component';

// Auth
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'starter', pathMatch: 'full' },
      {
        path: '',
        loadChildren: () => import('./pages/extrapages/extraspages.module').then(m => m.ExtraspagesModule)
      },
      {
        path: 'gestao',
        loadChildren: () => import('./pages/user-management/user-management.module').then(m => m.UserManagementModule)
      }
    ]
  },
  { path: 'auth', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: '**', redirectTo: 'starter' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
