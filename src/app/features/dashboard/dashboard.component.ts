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
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

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

interface BalanceRange {
  range: string;
  count: number;
  color: string;
}

interface MonthlyData {
  month: string;
  accounts: number;
  customers: number;
  balance: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, BaseChartDirective],
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

  // Chart configurations
  accountStatusChartData: ChartData<'doughnut'> = {
    labels: ['Active', 'Suspended', 'Created', 'Closed'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545'],
      borderWidth: 0
    }]
  };

  accountTypeChartData: ChartData<'pie'> = {
    labels: ['Current Accounts', 'Saving Accounts'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#007bff', '#fd7e14'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  balanceRangeChartData: ChartData<'bar'> = {
    labels: ['$0-1K', '$1K-5K', '$5K-10K', '$10K-50K', '$50K+'],
    datasets: [{
      label: 'Number of Accounts',
      data: [0, 0, 0, 0, 0],
      backgroundColor: '#007bff',
      borderColor: '#0056b3',
      borderWidth: 1
    }]
  };

  monthlyTrendsChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'New Accounts',
        data: [],
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'New Customers',
        data: [],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  balanceTrendsChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Total Balance ($)',
      data: [],
      borderColor: '#fd7e14',
      backgroundColor: 'rgba(253, 126, 20, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Chart options
  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  balanceLineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  constructor(
    private accountService: AccountService,
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {}  ngOnInit(): void {
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
        this.updateCharts(data.customers, data.accounts);
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

  private updateCharts(customers: Customer[], accounts: BankAccount[]): void {
    this.updateAccountStatusChart(accounts);
    this.updateAccountTypeChart(accounts);
    this.updateBalanceRangeChart(accounts);
    this.updateTrendCharts(customers, accounts);
  }

  private updateAccountStatusChart(accounts: BankAccount[]): void {
    const activeAccounts = accounts.filter(acc => acc.status === 'ACTIVATED').length;
    const suspendedAccounts = accounts.filter(acc => acc.status === 'SUSPENDED').length;
    const createdAccounts = accounts.filter(acc => acc.status === 'CREATED').length;
    const closedAccounts = accounts.filter(acc => acc.status === 'CLOSED').length;

    this.accountStatusChartData = {
      ...this.accountStatusChartData,
      datasets: [{
        data: [activeAccounts, suspendedAccounts, createdAccounts, closedAccounts],
        backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545'],
        borderWidth: 0
      }]
    };
  }

  private updateAccountTypeChart(accounts: BankAccount[]): void {
    const currentAccounts = accounts.filter(acc => acc.type === 'CURRENT').length;
    const savingAccounts = accounts.filter(acc => acc.type === 'SAVING').length;

    this.accountTypeChartData = {
      ...this.accountTypeChartData,
      datasets: [{
        data: [currentAccounts, savingAccounts],
        backgroundColor: ['#007bff', '#fd7e14'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  private updateBalanceRangeChart(accounts: BankAccount[]): void {
    const ranges = [
      { min: 0, max: 1000 },
      { min: 1000, max: 5000 },
      { min: 5000, max: 10000 },
      { min: 10000, max: 50000 },
      { min: 50000, max: Infinity }
    ];

    const rangeCounts = ranges.map(range => 
      accounts.filter(acc => acc.balance >= range.min && acc.balance < range.max).length
    );

    this.balanceRangeChartData = {
      ...this.balanceRangeChartData,
      datasets: [{
        label: 'Number of Accounts',
        data: rangeCounts,
        backgroundColor: '#007bff',
        borderColor: '#0056b3',
        borderWidth: 1
      }]
    };
  }

  private updateTrendCharts(customers: Customer[], accounts: BankAccount[]): void {
    // Generate last 6 months of data
    const months: MonthlyData[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Simulate monthly data based on existing data
      const accountsForMonth = Math.floor(accounts.length * (0.8 + Math.random() * 0.4) / 6);
      const customersForMonth = Math.floor(customers.length * (0.8 + Math.random() * 0.4) / 6);
      const balanceForMonth = accounts.reduce((sum, acc) => sum + acc.balance, 0) * (0.7 + Math.random() * 0.6) / 6;
      
      months.push({
        month: monthStr,
        accounts: accountsForMonth,
        customers: customersForMonth,
        balance: balanceForMonth
      });
    }

    this.monthlyTrendsChartData = {
      labels: months.map(m => m.month),
      datasets: [
        {
          label: 'New Accounts',
          data: months.map(m => m.accounts),
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'New Customers',
          data: months.map(m => m.customers),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    this.balanceTrendsChartData = {
      labels: months.map(m => m.month),
      datasets: [{
        label: 'Total Balance ($)',
        data: months.map(m => m.balance),
        borderColor: '#fd7e14',
        backgroundColor: 'rgba(253, 126, 20, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
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
