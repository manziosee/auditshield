import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  // Skip auth for public endpoints
  const publicEndpoints = ['/geo/countries', '/geo/currencies', '/auth/login', '/companies/onboard'];
  const isPublic = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  const authedReq = (token && !isPublic)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublic && !isRefreshing) {
        isRefreshing = true;
        return auth.refreshToken().pipe(
          switchMap((res) => {
            isRefreshing = false;
            const retried = req.clone({ setHeaders: { Authorization: `Bearer ${res.access}` } });
            return next(retried);
          }),
          catchError((refreshErr) => {
            isRefreshing = false;
            auth.logout();
            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
