import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component pages
import { CompaniesComponent } from './companies/companies.component';
import { ContactsComponent } from './contacts/contacts.component';
import { DealsComponent } from './deals/deals.component';
import { LeadsComponent } from './leads/leads.component';

const routes: Routes = [
  {
    path: 'contacts',
    component: ContactsComponent,
  },
  {
    path: 'companies',
    component: CompaniesComponent,
  },
  {
    path: 'deals',
    component: DealsComponent,
  },
  {
    path: 'leads',
    component: LeadsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CRMRoutingModule {}
