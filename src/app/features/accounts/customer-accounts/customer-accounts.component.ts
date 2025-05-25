import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../../core/services/account.service';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BankAccount, CurrentBankAccount, SavingBankAccount } from '../../../core/models/account.model';
import { Customer } from '../../../core/models/customer.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-customer-accounts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
],
  templateUrl: './customer-accounts.component.html',
  styleUrl: './customer-accounts.component.css'
})
export class CustomerAccountsComponent implements OnInit {
  customerId: number = 0;
  customer: Customer | null = null;
  accounts: BankAccount[] = [];
  loading: boolean = false;
  showNewAccountForm: boolean = false;
  newAccountForm: FormGroup;
  accountType: 'CURRENT' | 'SAVING' = 'CURRENT';
  submitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private customerService: CustomerService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.newAccountForm = this.fb.group({
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      accountTypeValue: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.customerId = +this.route.snapshot.params['id'];
    this.loadCustomerData();
    this.loadCustomerAccounts();
  }

  loadCustomerData(): void {
    this.loading = true;
    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (data) => {
        this.customer = data;
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error', 'Failed to load customer data');
        this.loading = false;
      }
    });
  }

  loadCustomerAccounts(): void {
    this.loading = true;
    this.accountService.getCustomerAccounts(this.customerId).subscribe({
      next: (data) => {
        this.accounts = data;
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error', 'Failed to load customer accounts');
        this.loading = false;
      }
    });
  }

  toggleNewAccountForm(): void {
    this.showNewAccountForm = !this.showNewAccountForm;
    if (this.showNewAccountForm) {
      // Reset form when opening
      this.newAccountForm.reset({
        initialBalance: 0,
        accountTypeValue: 0
      });
      this.submitted = false;
    }
  }

  setAccountType(type: 'CURRENT' | 'SAVING'): void {
    this.accountType = type;
  }

  getAccountTypeValueLabel(): string {
    return this.accountType === 'CURRENT' ? 'Overdraft Limit' : 'Interest Rate (%)';
  }

  createAccount(): void {
    this.submitted = true;

    if (this.newAccountForm.invalid) {
      return;
    }

    const { initialBalance, accountTypeValue } = this.newAccountForm.value;
    this.loading = true;

    if (this.accountType === 'CURRENT') {
      this.accountService.createCurrentAccount(
        this.customerId, 
        initialBalance, 
        accountTypeValue
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess('Success', 'Current account created successfully');
          this.loadCustomerAccounts();
          this.toggleNewAccountForm();
        },
        error: (err) => {
          this.notificationService.showError('Error', 'Failed to create current account');
          this.loading = false;
        }
      });
    } else {
      this.accountService.createSavingAccount(
        this.customerId, 
        initialBalance, 
        accountTypeValue
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess('Success', 'Saving account created successfully');
          this.loadCustomerAccounts();
          this.toggleNewAccountForm();
        },
        error: (err) => {
          this.notificationService.showError('Error', 'Failed to create saving account');
          this.loading = false;
        }
      });
    }
  }
  
  isSavingAccount(account: BankAccount): account is SavingBankAccount {
    return account.type === 'SAVING';
  }
  
  isCurrentAccount(account: BankAccount): account is CurrentBankAccount {
    return account.type === 'CURRENT';
  }

  // Form getters
  get initialBalance() { return this.newAccountForm.get('initialBalance'); }
  get accountTypeValue() { return this.newAccountForm.get('accountTypeValue'); }
}
