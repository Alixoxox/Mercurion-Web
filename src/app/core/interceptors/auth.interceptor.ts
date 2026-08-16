import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  const toastr = inject(ToastrService);
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/users/auth/') && !req.url.includes('/admin/auth/')) {
        toastr.error('Your Session has Expired.\nLogin In Again', 'Error', {
          timeOut: 3000,
          progressBar: true,
        });
        injector.get(UserService).logout();
      } else if (err.status === 403 && !req.url.includes('/users/auth/') && !req.url.includes('/admin/auth/')) {
        toastr.error('You do not have permission to perform this action.', 'Forbidden');
      }
      return throwError(() => err);
    })
  );
};
