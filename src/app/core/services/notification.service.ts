import { Injectable } from '@angular/core';

declare global {
  interface Window {
    bootstrap: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  constructor() {}

  showSuccess(title: string, message: string): void {
    this.showToast(title, message, 'success');
  }

  showError(title: string, message: string): void {
    this.showToast(title, message, 'danger');
  }

  showInfo(title: string, message: string): void {
    this.showToast(title, message, 'info');
  }

  showWarning(title: string, message: string): void {
    this.showToast(title, message, 'warning');
  }

  private showToast(title: string, message: string, type: string): void {
    // Create a div element for the toast
    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-bg-${type} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    
    // Create the toast content
    toastElement.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <strong>${title}</strong>
          <div>${message}</div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    // Create a toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Add the toast to the container
    toastContainer.appendChild(toastElement);
    
    // Initialize toast with Bootstrap
    const bootstrap = window.bootstrap;
    if (bootstrap && bootstrap.Toast) {
      const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
      });
      toast.show();
    }
    
    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }
}
