import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CustomersListComponent } from './features/customers/customers-list/customers-list.component';
import { CustomerFormComponent } from './features/customers/customer-form/customer-form.component';
import { CustomerAccountsComponent } from './features/accounts/customer-accounts/customer-accounts.component';
import { AccountsListComponent } from './features/accounts/accounts-list/accounts-list.component';
import { AccountOperationsComponent } from './features/operations/account-operations/account-operations.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Authentication routes (accessible only when not logged in)
  { 
    path: 'auth/login', 
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'auth/register', 
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  
  // Protected routes (require authentication)
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'customers', 
    component: CustomersListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'customers/new', 
    component: CustomerFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  { 
    path: 'customers/:id/edit', 
    component: CustomerFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  { 
    path: 'customers/:id/accounts', 
    component: CustomerAccountsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'accounts', 
    component: AccountsListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'accounts/:id/operations', 
    component: AccountOperationsComponent,
    canActivate: [AuthGuard]
  },
  
  // Fallback route
  { path: '**', redirectTo: '/dashboard' }
];
