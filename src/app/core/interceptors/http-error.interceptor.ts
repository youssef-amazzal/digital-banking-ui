import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): void {
    let errorMsg = '';
    let shouldShowNotification = true;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          this.handleUnauthorizedError();
          shouldShowNotification = false; // Don't show notification, we'll handle it
          break;
        case 403:
          errorMsg = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMsg = 'Resource not found.';
          break;
        case 409:
          errorMsg = error.error?.message || 'Conflict occurred. The resource already exists or there is a data conflict.';
          break;
        case 422:
          errorMsg = error.error?.message || 'Validation failed. Please check your input data.';
          break;
        case 500:
          errorMsg = 'Internal server error. Please try again later.';
          break;
        case 503:
          errorMsg = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMsg = error.error?.message || `Unexpected error occurred (${error.status})`;
          break;
      }
    }

    if (shouldShowNotification && errorMsg) {
      this.notificationService.showError('Operation Failed', errorMsg);
    }
  }

  private handleUnauthorizedError(): void {
    const currentUrl = this.router.url;
    
    // Only handle 401 errors if we're not already on an auth page
    if (!currentUrl.includes('/auth/')) {
      this.notificationService.showWarning(
        'Session Expired', 
        'Your session has expired. Please log in again.'
      );
      
      // Logout user and redirect to login with return URL
      this.authService.logout();
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: currentUrl } 
      });
    }
  }
}
