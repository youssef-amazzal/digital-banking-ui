import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { User } from '../../../core/models/auth.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-side-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.css']
})
export class SideNavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAuthenticated = false;
  sessionTimeRemaining = '';
  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.authSubscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
    
    this.authSubscription.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );

    // Update session time every 30 seconds
    this.authSubscription.add(
      interval(30000).subscribe(() => {
        if (this.isAuthenticated) {
          const timeLeft = this.sessionService.getSessionTimeRemaining();
          this.sessionTimeRemaining = this.sessionService.formatTimeRemaining(timeLeft);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  getInitials(): string {
    if (!this.currentUser) return '';
    const firstName = this.currentUser.firstName || '';
    const lastName = this.currentUser.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    switch (this.currentUser.role) {
      case 'ADMIN': return 'Administrator';
      case 'MANAGER': return 'Manager';
      case 'USER': return 'User';
      default: return this.currentUser.role;
    }
  }
}
