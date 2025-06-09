import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip authentication for auth endpoints
    if (this.isAuthEndpoint(req.url)) {
      console.log('Skipping auth for endpoint:', req.url);
      return next.handle(req);
    }

    const token = this.authService.getToken();
    const isAuthenticated = this.authService.isAuthenticated();
    
    console.log('Auth interceptor:', { 
      url: req.url, 
      hasToken: !!token, 
      isAuthenticated,
      tokenExpired: token ? this.authService.isTokenExpired(token) : 'no token'
    });
    
    if (token && isAuthenticated) {
      // Check if token is expired before making the request
      if (this.authService.isTokenExpired(token)) {
        // Token is expired, logout user
        console.log('Token expired, logging out');
        this.authService.logout();
        return throwError(() => new HttpErrorResponse({
          error: { message: 'Token expired' },
          status: 401,
          statusText: 'Unauthorized'
        }));
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Adding auth header to request:', authReq.headers.get('Authorization'));
      
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle token expiration errors from server
          if (error.status === 401 && !this.isAuthEndpoint(req.url)) {
            console.log('401 error, logging out');
            this.authService.logout();
          }
          return throwError(() => error);
        })
      );
    }
    
    console.log('No token or not authenticated, proceeding without auth header');
    return next.handle(req);
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') || url.includes('/auth/register');
  }
}
