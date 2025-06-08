export type AccountStatus = 'CREATED' | 'ACTIVATED' | 'SUSPENDED';

export interface Customer {
  id: number;
  name: string;
  email: string;
}

export interface BankAccount {
  id: string;
  balance: number;
  createdAt: Date;
  status: AccountStatus;
  customerDTO: Customer | null;
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
