import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ErrorMessages } from '../../../../core/constants/error-messages';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  login = '';
  password = '';
  loading = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private notification: NotificationService
  ) {}

  onSubmit(): void {
    if (!this.login.trim()) {
      this.notification.warning(ErrorMessages.LOGIN_ID_REQUIRED, 'Saisissez votre identifiant.');
      return;
    }
    this.loading = true;
    this.auth.login(this.login.trim(), this.password).then((result) => {
      this.loading = false;
      if (result.success) {
        this.notification.success('Connexion réussie', '');
        this.router.navigate(['/admin']);
      } else {
        this.notification.error(
          ErrorMessages.LOGIN_FAILED.title,
          result.message ?? ErrorMessages.LOGIN_FAILED.text
        );
      }
    });
  }
}
