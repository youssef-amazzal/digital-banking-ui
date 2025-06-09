import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Customer, CustomerDTO } from '../models/customer.model';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${API_BASE_URL}/customers`;

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  searchCustomers(keyword: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/search?keyword=${encodeURIComponent(keyword)}`).pipe(
      catchError(this.handleError)
    );
  }

  createCustomer(customer: CustomerDTO): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer).pipe(
      catchError(this.handleError)
    );
  }

  updateCustomer(id: number, customer: CustomerDTO): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer).pipe(
      catchError(this.handleError)
    );
  }

  deleteCustomer(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Let the HttpErrorInterceptor handle the error display
    // Just re-throw the error for component-specific handling
    return throwError(() => error);
  }
}
