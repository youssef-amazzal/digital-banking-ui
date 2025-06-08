import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { CustomerService } from '../../core/services/customer.service';
import { NotificationService } from '../../core/services/notification.service';
import { BankAccount, AccountStatus } from '../../core/models/account.model';
import { Customer } from '../../core/models/customer.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { forkJoin } from 'rxjs';

interface DashboardStats {
  totalCustomers: number;
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  currentAccounts: number;
  savingAccounts: number;
  suspendedAccounts: number;
  closedAccounts: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  loading = false;
  stats: DashboardStats = {
    totalCustomers: 0,
    totalAccounts: 0,
    activeAccounts: 0,
    totalBalance: 0,
    currentAccounts: 0,
    savingAccounts: 0,
    suspendedAccounts: 0,
    closedAccounts: 0
  };
  recentCustomers: Customer[] = [];
  recentAccounts: BankAccount[] = [];

  constructor(
    private accountService: AccountService,
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    forkJoin({
      customers: this.customerService.getCustomers(),
      accounts: this.accountService.getAccounts(true) // Include inactive accounts
    }).subscribe({
      next: (data) => {
        this.calculateStats(data.customers, data.accounts);
        this.setRecentData(data.customers, data.accounts);
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Error', 'Failed to load dashboard data');
        this.loading = false;
      }
    });
  }

  private calculateStats(customers: Customer[], accounts: BankAccount[]): void {
    this.stats.totalCustomers = customers.length;
    this.stats.totalAccounts = accounts.length;
    this.stats.activeAccounts = accounts.filter(acc => acc.status === 'ACTIVATED').length;
    this.stats.totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    this.stats.currentAccounts = accounts.filter(acc => acc.type === 'CURRENT').length;
    this.stats.savingAccounts = accounts.filter(acc => acc.type === 'SAVING').length;
    this.stats.suspendedAccounts = accounts.filter(acc => acc.status === 'SUSPENDED').length;
    this.stats.closedAccounts = accounts.filter(acc => acc.status === 'CLOSED').length;
  }

  private setRecentData(customers: Customer[], accounts: BankAccount[]): void {
    // Sort customers by ID (assuming higher ID means more recent)
    this.recentCustomers = customers
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    // Sort accounts by creation date (most recent first)
    this.recentAccounts = accounts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  getStatusBadgeClass(status: AccountStatus): string {
    switch (status) {
      case 'CREATED':
        return 'bg-info';
      case 'ACTIVATED':
        return 'bg-success';
      case 'SUSPENDED':
        return 'bg-warning';
      case 'CLOSED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getAccountTypeIcon(type: string): string {
    return type === 'CURRENT' ? 'bi-credit-card' : 'bi-piggy-bank';
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
