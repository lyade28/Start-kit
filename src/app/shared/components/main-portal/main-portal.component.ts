import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-portal',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './main-portal.component.html',
  styleUrl: './main-portal.component.css'
})
export class MainPortalComponent {
  constructor(public auth: AuthService) {}

  onLogout(): void {
    this.auth.logout();
  }
}
