import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected network error occurred.';

      if (error.error && typeof error.error === 'object' && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status === 0) {
        errorMessage = 'Cannot reach backend server. Please verify your backend API URL and ensure it is running.';
      }

      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        authService.logout('Your session has expired. Please log in again.');
      } else if (error.status === 403) {
        toast.error('Access Restricted', errorMessage);
      } else if (error.status >= 500) {
        toast.error('Server Error', errorMessage);
      }

      return throwError(() => error);
    })
  );
};
