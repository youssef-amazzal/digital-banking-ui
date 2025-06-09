import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { BankAccount, AccountStatus } from '../models/account.model';
import { AccountHistory, CreditRequest, DebitRequest, TransferRequest } from '../models/operation.model';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${API_BASE_URL}`;

  constructor(private http: HttpClient) {}

  getAccounts(includeInactive: boolean = false): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiUrl}/accounts?includeInactive=${includeInactive}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getAccountById(accountId: string): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.apiUrl}/accounts/${accountId}`).pipe(
      catchError(this.handleError)
    );
  }

  getCustomerAccounts(customerId: number): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiUrl}/customers/${customerId}/accounts`).pipe(
      catchError(this.handleError)
    );
  }

  getAccountHistory(accountId: string): Observable<AccountHistory> {
    return this.http.get<AccountHistory>(`${this.apiUrl}/accounts/${accountId}/history`).pipe(
      catchError(this.handleError)
    );
  }

  getAccountPageHistory(accountId: string, page: number, size: number): Observable<AccountHistory> {
    return this.http.get<AccountHistory>(
      `${this.apiUrl}/accounts/${accountId}/pageHistory?page=${page}&size=${size}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  createCurrentAccount(customerId: number, initialBalance: number, overDraft: number): Observable<BankAccount> {
    return this.http.post<BankAccount>(
      `${this.apiUrl}/accounts/current?initialBalance=${initialBalance}&overDraft=${overDraft}&customerId=${customerId}`,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  createSavingAccount(customerId: number, initialBalance: number, interestRate: number): Observable<BankAccount> {
    return this.http.post<BankAccount>(
      `${this.apiUrl}/accounts/saving?initialBalance=${initialBalance}&interestRate=${interestRate}&customerId=${customerId}`,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  debit(request: DebitRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accounts/debit`, request).pipe(
      catchError(this.handleError)
    );
  }

  credit(request: CreditRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accounts/credit`, request).pipe(
      catchError(this.handleError)
    );
  }

  transfer(request: TransferRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accounts/transfer`, request).pipe(
      catchError(this.handleError)
    );
  }

  changeAccountStatus(accountId: string, status: AccountStatus): Observable<BankAccount> {
    return this.http.put<BankAccount>(`${this.apiUrl}/accounts/${accountId}/status?status=${status}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Let the HttpErrorInterceptor handle the error display
    // Just re-throw the error for component-specific handling
    return throwError(() => error);
  }
}
