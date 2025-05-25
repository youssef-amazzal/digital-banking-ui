import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Customer } from '../../../core/models/customer.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.css'
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode: boolean = false;
  customerId: number | null = null;
  loading: boolean = false;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    
    if (id) {
      this.isEditMode = true;
      this.customerId = +id;
      this.loadCustomerData(this.customerId);
    }
  }

  loadCustomerData(id: number): void {
    this.loading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue({
          name: customer.name,
          email: customer.email
        });
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Error', 'Failed to load customer data');
        this.loading = false;
        this.router.navigate(['/customers']);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.customerForm.invalid) {
      return;
    }
    
    this.loading = true;
    const customerData = this.customerForm.value;
    
    if (this.isEditMode && this.customerId) {
      this.customerService.updateCustomer(this.customerId, customerData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Success', 'Customer updated successfully');
          this.router.navigate(['/customers']);
        },
        error: (error) => {
          this.notificationService.showError('Error', 'Failed to update customer');
          this.loading = false;
        }
      });
    } else {
      this.customerService.createCustomer(customerData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Success', 'Customer created successfully');
          this.router.navigate(['/customers']);
        },
        error: (error) => {
          this.notificationService.showError('Error', 'Failed to create customer');
          this.loading = false;
        }
      });
    }
  }

  get name() { return this.customerForm.get('name'); }
  get email() { return this.customerForm.get('email'); }
}
