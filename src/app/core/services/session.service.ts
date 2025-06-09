import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionTimeoutWarning = 5 * 60 * 1000; // 5 minutes before expiry
  private sessionCheckInterval = 60 * 1000; // Check every minute
  private sessionWarningShown = false;
  private sessionActive = new BehaviorSubject<boolean>(false);
  private showTimeoutModal = new BehaviorSubject<boolean>(false);
  private modalMinutesRemaining = new BehaviorSubject<number>(5);

  public sessionActive$ = this.sessionActive.asObservable();
  public showTimeoutModal$ = this.showTimeoutModal.asObservable();
  public modalMinutesRemaining$ = this.modalMinutesRemaining.asObservable();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.initSessionMonitoring();
  }  private initSessionMonitoring(): void {
    // Monitor authentication state
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.sessionActive.next(isAuth);
      this.sessionWarningShown = false; // Reset warning flag
      if (!isAuth) {
        this.hideTimeoutModal(); // Hide modal when logged out
      }
    });

    // Check session periodically
    interval(this.sessionCheckInterval).subscribe(() => {
      this.checkSessionStatus();
    });
  }

  private checkSessionStatus(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiry - now;

      // Show warning if session is about to expire
      if (timeUntilExpiry <= this.sessionTimeoutWarning && !this.sessionWarningShown) {
        this.showSessionWarning(Math.ceil(timeUntilExpiry / (60 * 1000)));
        this.sessionWarningShown = true;
      }

      // Auto logout if token is expired
      if (timeUntilExpiry <= 0) {
        this.handleSessionExpiry();
      }
    } catch (error) {
      console.error('Error checking session status:', error);
    }
  }
  private showSessionWarning(minutesLeft: number): void {
    this.modalMinutesRemaining.next(minutesLeft);
    this.showTimeoutModal.next(true);
  }

  private handleSessionExpiry(): void {
    this.hideTimeoutModal();
    this.notificationService.showError(
      'Session Expired',
      'Your session has expired. You will be redirected to login.'
    );
    
    // Small delay to show the notification
    setTimeout(() => {
      this.authService.logout();
    }, 2000);
  }

  public extendSession(): void {
    // In a real application, you might call a refresh token endpoint here
    // For now, we'll just reset the warning flag and hide modal
    this.sessionWarningShown = false;
    this.hideTimeoutModal();
    this.notificationService.showInfo('Session Extended', 'Your session has been extended.');
  }

  public hideTimeoutModal(): void {
    this.showTimeoutModal.next(false);
  }

  public forceLogout(): void {
    this.hideTimeoutModal();
    this.authService.logout();
  }

  public getSessionTimeRemaining(): number {
    const token = this.authService.getToken();
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Math.max(0, expiry - Date.now());
    } catch {
      return 0;
    }
  }

  public formatTimeRemaining(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
