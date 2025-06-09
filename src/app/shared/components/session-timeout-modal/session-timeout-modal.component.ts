import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-timeout-modal',
  templateUrl: './session-timeout-modal.component.html',
  styleUrl: './session-timeout-modal.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class SessionTimeoutModalComponent {
  @Input() minutesRemaining = 5;
  @Input() isVisible = false;
  
  @Output() extendSession = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  
  onExtendSession() {
    this.extendSession.emit();
  }
  
  onLogout() {
    this.logout.emit();
  }
  
  onClose() {
    this.close.emit();
  }
}
