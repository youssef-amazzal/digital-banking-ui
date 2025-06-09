import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SideNavbarComponent } from './shared/components/side-navbar/side-navbar.component';
import { SessionTimeoutModalComponent } from './shared/components/session-timeout-modal/session-timeout-modal.component';
import { AuthService } from './core/services/auth.service';
import { SessionService } from './core/services/session.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideNavbarComponent, SessionTimeoutModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Digital Banking System';
  isAuthenticated = false;
  isAuthPage = false;
  showSessionModal = false;
  sessionMinutesRemaining = 5;
  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router
  ) {}
  ngOnInit(): void {
    // Subscribe to authentication state
    this.authSubscription.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        
        // Redirect to login if not authenticated and trying to access protected route
        if (!isAuth && !this.isAuthPage) {
          this.router.navigate(['/auth/login']);
        }
      })
    );

    // Subscribe to route changes to detect auth pages
    this.authSubscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.isAuthPage = event.url.includes('/auth/');
      })
    );

    // Subscribe to session timeout modal state
    this.authSubscription.add(
      this.sessionService.showTimeoutModal$.subscribe(show => {
        this.showSessionModal = show;
      })
    );

    // Subscribe to session minutes remaining
    this.authSubscription.add(
      this.sessionService.modalMinutesRemaining$.subscribe(minutes => {
        this.sessionMinutesRemaining = minutes;
      })
    );
  }

  onExtendSession(): void {
    this.sessionService.extendSession();
  }

  onForceLogout(): void {
    this.sessionService.forceLogout();
  }

  onCloseModal(): void {
    this.sessionService.hideTimeoutModal();
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }
}
