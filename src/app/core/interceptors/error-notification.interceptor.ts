import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { ErrorMessages } from '../constants/error-messages';

function extractErrorMessage(err: HttpErrorResponse): string {
  const body = err.error;
  if (!body) return err.message ?? ErrorMessages.DEFAULT.text;
  if (typeof body.message === 'string' && body.message.trim()) return body.message;
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const first = body.errors[0];
    const msg = typeof first === 'object' && first?.message ? first.message : String(first);
    return body.errors.length > 1 ? `${msg} (+${body.errors.length - 1} autre(s))` : msg;
  }
  return err.message ?? ErrorMessages.DEFAULT.text;
}

export const errorNotificationInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        notification.error(ErrorMessages.NETWORK_ERROR.title, ErrorMessages.NETWORK_ERROR.text);
        return throwError(() => err);
      }
      if (err.status === 401) {
        notification.error(ErrorMessages.SESSION_EXPIRED.title, ErrorMessages.SESSION_EXPIRED.text);
        auth.logout();
        return throwError(() => err);
      }
      if (err.status >= 500) {
        notification.error(ErrorMessages.SERVER_ERROR.title, extractErrorMessage(err));
      } else if (err.status >= 400 && err.status !== 401) {
        notification.error(ErrorMessages.GENERIC_ERROR.title, extractErrorMessage(err));
      }
      return throwError(() => err);
    })
  );
};
