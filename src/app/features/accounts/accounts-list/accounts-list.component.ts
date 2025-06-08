import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BankAccount, CurrentBankAccount, SavingBankAccount } from '../../../core/models/account.model';
import { AccountService } from '../../../core/services/account.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './accounts-list.component.html',
  styleUrl: './accounts-list.component.css'
})
export class AccountsListComponent implements OnInit {
  accounts: BankAccount[] = [];
  loading: boolean = false;
  includeInactive: boolean = false;

  constructor(
    private accountService: AccountService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts(this.includeInactive).subscribe({
      next: (data) => {
        this.accounts = data;
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error', 'Failed to load accounts');
        this.loading = false;
      }
    });
  }

  toggleIncludeInactive(): void {
    this.includeInactive = !this.includeInactive;
    this.loadAccounts();
  }

  isSavingAccount(account: BankAccount): account is SavingBankAccount {
    return account.type === 'SAVING';
  }

  isCurrentAccount(account: BankAccount): account is CurrentBankAccount {
    return account.type === 'CURRENT';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'CREATED':
        return 'bg-info';
      case 'ACTIVATED':
        return 'bg-success';
      case 'SUSPENDED':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }
}