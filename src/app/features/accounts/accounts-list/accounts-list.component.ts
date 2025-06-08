import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BankAccount, CurrentBankAccount, SavingBankAccount, AccountStatus } from '../../../core/models/account.model';
import { AccountService } from '../../../core/services/account.service';
import { AccountStatusService, StatusTransition } from '../../../core/services/account-status.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ConfirmationModalComponent],
  templateUrl: './accounts-list.component.html',
  styleUrl: './accounts-list.component.css'
})
export class AccountsListComponent implements OnInit {
  @ViewChild('statusConfirmModal') statusConfirmModal!: ConfirmationModalComponent;
  
  accounts: BankAccount[] = [];
  loading: boolean = false;
  includeInactive: boolean = false;
  
  // Status change confirmation properties
  confirmationTitle = '';
  confirmationMessage = '';
  pendingStatusChange: { account: BankAccount; newStatus: AccountStatus } | null = null;

  constructor(
    private accountService: AccountService,
    private accountStatusService: AccountStatusService,
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
      case 'CLOSED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
  /**
   * Get valid status transitions for an account
   */
  getValidTransitions(account: BankAccount): StatusTransition[] {
    return this.accountStatusService.getValidTransitions(account.status);
  }

  /**
   * Get status display information
   */
  getStatusInfo(status: AccountStatus): StatusTransition {
    return this.accountStatusService.getStatusInfo(status);
  }

  /**
   * Initiate status change with confirmation
   */
  initiateStatusChange(account: BankAccount, newStatus: AccountStatus): void {
    this.pendingStatusChange = { account, newStatus };
    this.confirmationTitle = 'Change Account Status';
    this.confirmationMessage = this.accountStatusService.getTransitionMessage(
      account.status, 
      newStatus, 
      account.id
    );
    
    // Show the modal using Bootstrap's modal API
    const modalElement = document.getElementById('statusConfirmModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  /**
   * Handle status change confirmation
   */
  onStatusChangeConfirmed(): void {
    if (!this.pendingStatusChange) return;

    const { account, newStatus } = this.pendingStatusChange;
    
    this.accountService.changeAccountStatus(account.id, newStatus).subscribe({
      next: (updatedAccount) => {
        // Update the account in the local array
        const accountIndex = this.accounts.findIndex(acc => acc.id === account.id);
        if (accountIndex !== -1) {
          this.accounts[accountIndex] = updatedAccount;
        }
        this.notificationService.showSuccess('Success', `Account status changed to ${newStatus}`);
        this.pendingStatusChange = null;
      },
      error: (error) => {
        console.error('Error changing account status:', error);
        const errorMessage = error.error?.message || `Failed to change account status to ${newStatus}`;
        this.notificationService.showError('Error', errorMessage);
        this.pendingStatusChange = null;
      }
    });
  }
  /**
   * Handle status change cancellation
   */
  onStatusChangeCancelled(): void {
    this.pendingStatusChange = null;
  }

  changeAccountStatus(accountId: string, newStatus: AccountStatus): void {
    // This method is deprecated - use initiateStatusChange instead
    const account = this.accounts.find(acc => acc.id === accountId);
    if (account) {
      this.initiateStatusChange(account, newStatus);
    }
  }
}