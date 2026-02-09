import { Injectable } from '@angular/core';

/** Service de notification minimal (à remplacer par SweetAlert2, toast, etc. selon le projet). */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  success(title: string, _text?: string): void {
    console.info('[Notification]', title);
  }

  error(title: string, text?: string): void {
    console.error('[Notification]', title, text ?? '');
    if (typeof window !== 'undefined') {
      window.alert(`${title}${text ? '\n' + text : ''}`);
    }
  }

  warning(title: string, _text?: string): void {
    console.warn('[Notification]', title);
  }
}
