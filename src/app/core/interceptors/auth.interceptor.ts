import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const toastr = inject(ToastrService);
  const isAuthUrl = req.url.includes('/users/auth/') || req.url.includes('/admin/auth/');

  // 1. Proactive check before sending the request
  if (!isAuthUrl && localStorage.getItem('token')) {
    if (!userService.isTokenValid()) {
      toastr.error('Your Session has Expired.\nLogin In Again', 'Error', {
        timeOut: 3000,
        progressBar: true,
      });
      userService.logout();
      // return an empty error observable to stop the request cold
      return throwError(() => new Error('Token expired locally'));
    }
  }

  // 2. Attach token if it exists
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthUrl) {
        toastr.error('Your Session has Expired.\nLogin In Again', 'Error', {
          timeOut: 3000,
          progressBar: true,
        });
        userService.logout();
      } else if (err.status === 403 && !isAuthUrl) {
        toastr.error('You do not have permission to perform this action.', 'Forbidden');
      }
      return throwError(() => err);
    })
  );
};