import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, JwtResponse, MessageResponse, User } from '../models/auth.model';
import { AUTH_API_BASE_URL } from './api.config';

const TOKEN_KEY = 'jwt-token';
const REFRESH_TOKEN_KEY = 'refresh-token';
const USER_KEY = 'current-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${AUTH_API_BASE_URL}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }  private loadStoredUser(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    console.log('Loading stored user:', { 
      hasToken: !!token, 
      hasUser: !!user, 
      isTokenExpired: token ? this.isTokenExpired(token) : 'no token' 
    });
    
    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      console.log('User authenticated successfully');
    } else {
      console.log('Authentication failed, logging out');
      this.logout();
    }
  }login(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.saveToken(response.token);
          // Save refresh token if available (for future implementation)
          if (response.refreshToken) {
            this.saveRefreshToken(response.refreshToken);
          }
          const user: User = {
            username: response.username,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            role: response.role
          };
          this.saveUser(user);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  register(userInfo: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/register`, userInfo);
  }  logout(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
    // Clear remember me credentials on explicit logout
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('rememberMe');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }
  private removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private saveRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private saveUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  private removeUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;
    
    try {
      // Parse the JWT token to extract payload
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return true;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (exp claim is in seconds)
      return payload.exp ? payload.exp < currentTime : true;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Refresh token method (for future backend implementation)
  refreshToken(): Observable<JwtResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    return this.http.post<JwtResponse>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          this.saveToken(response.token);
          if (response.refreshToken) {
            this.saveRefreshToken(response.refreshToken);
          }
        })
      );
  }

  // Check if refresh token is available and valid
  canRefreshToken(): boolean {
    const refreshToken = this.getRefreshToken();
    return !!refreshToken && !this.isTokenExpired(refreshToken);
  }
}
