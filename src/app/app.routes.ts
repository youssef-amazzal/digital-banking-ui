import { Routes } from '@angular/router';
import { CustomersListComponent } from './features/customers/customers-list/customers-list.component';
import { CustomerFormComponent } from './features/customers/customer-form/customer-form.component';
import { CustomerAccountsComponent } from './features/accounts/customer-accounts/customer-accounts.component';
import { AccountsListComponent } from './features/accounts/accounts-list/accounts-list.component';
import { AccountOperationsComponent } from './features/operations/account-operations/account-operations.component';

export const routes: Routes = [
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
  { path: 'customers', component: CustomersListComponent },
  { path: 'customers/new', component: CustomerFormComponent },
  { path: 'customers/:id/edit', component: CustomerFormComponent },
  { path: 'customers/:id/accounts', component: CustomerAccountsComponent },
  { path: 'accounts', component: AccountsListComponent },
  { path: 'accounts/:id/operations', component: AccountOperationsComponent },
  { path: '**', redirectTo: '/customers' }
];
