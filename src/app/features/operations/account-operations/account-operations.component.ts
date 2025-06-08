import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../../../core/services/account.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BankAccount } from '../../../core/models/account.model';
import { AccountHistory, AccountOperation } from '../../../core/models/operation.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-account-operations',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    PaginationComponent
  ],
  templateUrl: './account-operations.component.html',
  styleUrl: './account-operations.component.css'
})
export class AccountOperationsComponent implements OnInit {
  accountId: string = '';
  account: BankAccount | null = null;
  accountHistory: AccountHistory | null = null;
  operations: AccountOperation[] = [];
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  
  operationType: 'DEBIT' | 'CREDIT' | 'TRANSFER' = 'DEBIT';
  operationForm: FormGroup;
  loading: boolean = false;
  submitting: boolean = false;
  submitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.operationForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: [''],
      destinationAccountId: ['']
    });
  }

  ngOnInit(): void {
    this.accountId = this.route.snapshot.params['id'];
    this.loadAccountDetails();
    this.loadAccountOperations();
  }

  loadAccountDetails(): void {
    this.loading = true;
    this.accountService.getAccountById(this.accountId).subscribe({
      next: (data) => {
        this.account = data;
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error', 'Failed to load account details');
        this.loading = false;
      }
    });
  }
  loadAccountOperations(page: number = 0): void {
    this.loading = true;
    this.currentPage = page;
    this.accountService.getAccountPageHistory(this.accountId, page, this.pageSize).subscribe({
      next: (data) => {
        this.accountHistory = data;
        this.operations = data.accountOperationDTOS || [];
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error', 'Failed to load account operations');
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.loadAccountOperations(page - 1); // API pages are 0-based
  }

  setOperationType(type: 'DEBIT' | 'CREDIT' | 'TRANSFER'): void {
    this.operationType = type;
    
    // Reset the form
    this.operationForm.reset({
      amount: null,
      description: '',
      destinationAccountId: ''
    });
    this.submitted = false;

    // Add or remove validators based on operation type
    if (type === 'TRANSFER') {
      this.operationForm.get('destinationAccountId')?.setValidators([Validators.required]);
    } else {
      this.operationForm.get('destinationAccountId')?.clearValidators();
    }
    this.operationForm.get('destinationAccountId')?.updateValueAndValidity();
  }

  submitOperation(): void {
    this.submitted = true;
    
    if (this.operationForm.invalid) {
      return;
    }
    
    this.submitting = true;
    const { amount, description, destinationAccountId } = this.operationForm.value;
    
    if (this.operationType === 'DEBIT') {
      this.accountService.debit({
        accountId: this.accountId,
        amount: amount,
        description: description || 'Debit operation'
      }).subscribe({
        next: () => {
          this.handleOperationSuccess('Amount debited successfully');
        },
        error: (err) => {
          this.handleOperationError('Failed to debit amount');
        }
      });
    } else if (this.operationType === 'CREDIT') {
      this.accountService.credit({
        accountId: this.accountId,
        amount: amount,
        description: description || 'Credit operation'
      }).subscribe({
        next: () => {
          this.handleOperationSuccess('Amount credited successfully');
        },
        error: (err) => {
          this.handleOperationError('Failed to credit amount');
        }
      });
    } else if (this.operationType === 'TRANSFER') {
      this.accountService.transfer({
        accountSource: this.accountId,
        accountDestination: destinationAccountId,
        amount: amount,
        description: description || 'Transfer operation'
      }).subscribe({
        next: () => {
          this.handleOperationSuccess('Transfer completed successfully');
        },
        error: (err) => {
          this.handleOperationError('Failed to complete transfer');
        }
      });
    }
  }

  private handleOperationSuccess(message: string): void {
    this.notificationService.showSuccess('Success', message);
    this.operationForm.reset({
      amount: null,
      description: '',
      destinationAccountId: ''
    });
    this.submitted = false;
    this.submitting = false;
    // Reload account details and operations
    this.loadAccountDetails();
    this.loadAccountOperations(0); // Reset to first page
  }

  private handleOperationError(message: string): void {
    this.notificationService.showError('Error', message);
    this.submitting = false;
  }

  // Form getters
  get amount() { return this.operationForm.get('amount'); }
  get description() { return this.operationForm.get('description'); }
  get destinationAccountId() { return this.operationForm.get('destinationAccountId'); }
}
