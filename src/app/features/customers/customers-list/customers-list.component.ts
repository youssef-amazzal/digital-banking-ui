import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../../core/models/customer.model';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-customers-list',
  standalone: true,  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    LoadingSpinnerComponent, 
    ConfirmationModalComponent,
    PaginationComponent
  ],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.css'
})
export class CustomersListComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;
  searchKeyword = '';
  customerToDelete: Customer | null = null;
  
  // Pagination properties
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  
  constructor(
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.loadCustomers();
  }
  
  loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to load customers');
        this.loading = false;
      }
    });
  }
  
  onSearch(): void {
    if (!this.searchKeyword.trim()) {
      this.loadCustomers();
      return;
    }
    
    this.loading = true;
    this.customerService.searchCustomers(this.searchKeyword).subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to search customers');
        this.loading = false;
      }
    });
  }
  
  confirmDelete(customer: Customer): void {
    this.customerToDelete = customer;
  }
    deleteCustomer(): void {
    if (!this.customerToDelete) return;
    
    this.loading = true;
    this.customerService.deleteCustomer(this.customerToDelete.id).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          'Success', 
          `Customer ${this.customerToDelete!.name} deleted successfully`
        );
        this.loadCustomers();
        this.customerToDelete = null;
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to delete customer');
        this.loading = false;
        this.customerToDelete = null;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page - 1;
    this.loadCustomers();
  }
}
