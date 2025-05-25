export type OperationType = 'CREDIT' | 'DEBIT';

export interface AccountOperation {
  id: number;
  operationDate: Date;
  amount: number;
  description?: string;
  type: OperationType;
}

export interface AccountHistory {
  accountId: string;
  balance: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  accountOperations: AccountOperation[];
}

export interface DebitRequest {
  accountId: string;
  amount: number;
  description?: string;
}

export interface CreditRequest {
  accountId: string;
  amount: number;
  description?: string;
}

export interface TransferRequest {
  accountSource: string;
  accountDestination: string;
  amount: number;
  description?: string;
}
