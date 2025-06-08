import { Injectable } from '@angular/core';
import { AccountStatus } from '../models/account.model';

export interface StatusTransition {
  status: AccountStatus;
  label: string;
  icon: string;
  description: string;
  buttonClass: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountStatusService {

  /**
   * Get valid status transitions based on current account status
   * Following banking business rules:
   * - CREATED → ACTIVATED, CLOSED
   * - ACTIVATED → SUSPENDED, CLOSED  
   * - SUSPENDED → ACTIVATED, CLOSED
   * - CLOSED → (no transitions - permanent state)
   */
  getValidTransitions(currentStatus: AccountStatus): StatusTransition[] {
    const allTransitions: Record<AccountStatus, StatusTransition> = {
      'CREATED': {
        status: 'CREATED',
        label: 'Created',
        icon: 'bi-plus-circle',
        description: 'Account has been created but not yet activated',
        buttonClass: 'btn-outline-secondary'
      },
      'ACTIVATED': {
        status: 'ACTIVATED',
        label: 'Activate',
        icon: 'bi-check-circle',
        description: 'Account is active and operational',
        buttonClass: 'btn-outline-success'
      },
      'SUSPENDED': {
        status: 'SUSPENDED',
        label: 'Suspend',
        icon: 'bi-pause-circle',
        description: 'Account is temporarily suspended',
        buttonClass: 'btn-outline-warning'
      },
      'CLOSED': {
        status: 'CLOSED',
        label: 'Close',
        icon: 'bi-x-circle',
        description: 'Account is permanently closed',
        buttonClass: 'btn-outline-danger'
      }
    };

    switch (currentStatus) {
      case 'CREATED':
        return [allTransitions.ACTIVATED, allTransitions.CLOSED];
      case 'ACTIVATED':
        return [allTransitions.SUSPENDED, allTransitions.CLOSED];
      case 'SUSPENDED':
        return [allTransitions.ACTIVATED, allTransitions.CLOSED];
      case 'CLOSED':
        return []; // No transitions allowed from closed state
      default:
        return [];
    }
  }

  /**
   * Get status display information
   */
  getStatusInfo(status: AccountStatus): StatusTransition {
    const statusInfo: Record<AccountStatus, StatusTransition> = {
      'CREATED': {
        status: 'CREATED',
        label: 'Created',
        icon: 'bi-plus-circle',
        description: 'Account created but not activated',
        buttonClass: 'btn-outline-secondary'
      },
      'ACTIVATED': {
        status: 'ACTIVATED',
        label: 'Active',
        icon: 'bi-check-circle',
        description: 'Account is active and operational',
        buttonClass: 'btn-outline-success'
      },
      'SUSPENDED': {
        status: 'SUSPENDED',
        label: 'Suspended',
        icon: 'bi-pause-circle',
        description: 'Account is temporarily suspended',
        buttonClass: 'btn-outline-warning'
      },
      'CLOSED': {
        status: 'CLOSED',
        label: 'Closed',
        icon: 'bi-x-circle',
        description: 'Account is permanently closed',
        buttonClass: 'btn-outline-danger'
      }
    };

    return statusInfo[status];
  }

  /**
   * Get transition confirmation message
   */
  getTransitionMessage(currentStatus: AccountStatus, newStatus: AccountStatus, accountId: string): string {
    const statusLabels = {
      'CREATED': 'Created',
      'ACTIVATED': 'Active',
      'SUSPENDED': 'Suspended',
      'CLOSED': 'Closed'
    };

    return `Are you sure you want to change account ${accountId} status from "${statusLabels[currentStatus]}" to "${statusLabels[newStatus]}"?`;
  }
}
