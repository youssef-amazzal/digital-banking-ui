export type AccountStatus = 'CREATED' | 'ACTIVATED' | 'SUSPENDED';

export interface BankAccount {
  id: string;
  balance: number;
  createdAt: Date;
  status: AccountStatus;
  customerId: number;
  customerName?: string;
  type: string;
}

export interface CurrentBankAccount extends BankAccount {
  type: 'CURRENT';
  overDraft: number;
}

export interface SavingBankAccount extends BankAccount {
  type: 'SAVING';
  interestRate: number;
}
