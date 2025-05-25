import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccount } from '../models/account.model';
import { AccountHistory, CreditRequest, DebitRequest, TransferRequest } from '../models/operation.model';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${API_BASE_URL}`;

  constructor(private http: HttpClient) {}

  getAccounts(includeInactive: boolean = false): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiUrl}/accounts?includeInactive=${includeInactive}`);
  }

  getAccountById(accountId: string): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.apiUrl}/accounts/${accountId}`);
  }

  getCustomerAccounts(customerId: number): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiUrl}/customers/${customerId}/accounts`);
  }

  getAccountHistory(accountId: string): Observable<AccountHistory> {
    return this.http.get<AccountHistory>(`${this.apiUrl}/accounts/${accountId}/history`);
  }

  getAccountPageHistory(accountId: string, page: number, size: number): Observable<AccountHistory> {
    return this.http.get<AccountHistory>(
      `${this.apiUrl}/accounts/${accountId}/pageHistory?page=${page}&size=${size}`
    );
  }

  createCurrentAccount(customerId: number, initialBalance: number, overDraft: number): Observable<BankAccount> {
    return this.http.post<BankAccount>(
      `${this.apiUrl}/accounts/current?initialBalance=${initialBalance}&overDraft=${overDraft}&customerId=${customerId}`,
      {}
    );
  }

  createSavingAccount(customerId: number, initialBalance: number, interestRate: number): Observable<BankAccount> {
    return this.http.post<BankAccount>(
      `${this.apiUrl}/accounts/saving?initialBalance=${initialBalance}&interestRate=${interestRate}&customerId=${customerId}`,
      {}
    );
  }

  debit(request: DebitRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accounts/debit`, request);
  }

  credit(request: CreditRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accounts/credit`, request);
  }

  transfer(request: TransferRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accounts/transfer`, request);
  }
}
