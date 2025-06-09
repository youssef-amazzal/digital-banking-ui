import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  showPassword = false;
  returnUrl = '/dashboard';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }
  ngOnInit(): void {
    // Get return url from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }

    // Check for saved credentials
    this.loadSavedCredentials();
  }

  private loadSavedCredentials(): void {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const rememberMeEnabled = localStorage.getItem('rememberMe') === 'true';
    
    if (savedUsername && rememberMeEnabled) {
      this.loginForm.patchValue({
        username: savedUsername,
        rememberMe: true
      });
    }
  }

  get username() { 
    return this.loginForm.get('username'); 
  }
    get password() { 
    return this.loginForm.get('password'); 
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const credentials = this.loginForm.value;

    // Handle Remember Me functionality
    if (credentials.rememberMe) {
      localStorage.setItem('rememberedUsername', credentials.username);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberMe');
    }

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Success', `Welcome back, ${response.firstName}!`);
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.notificationService.showError('Authentication Failed', errorMessage);
        this.loading = false;
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
