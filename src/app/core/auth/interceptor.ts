import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_URL } from '../config';
import { AuthService } from './service';

/** Ajoute le JWT aux appels admin et le renouvelle une fois après une réponse 401. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(`${API_URL}/admin`)) return next(request);

  const auth = inject(AuthService);
  const withToken = (token: string | null) =>
    token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

  return next(withToken(auth.token())).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error);

      return auth.refresh().pipe(
        catchError((refreshError: HttpErrorResponse) => {
          auth.expire();
          return throwError(() => refreshError);
        }),
        switchMap(() => {
          const token = auth.token();
          if (!token) {
            auth.expire();
            return throwError(() => error);
          }
          return next(withToken(token)).pipe(
            catchError((retryError: HttpErrorResponse) => {
              if (retryError.status === 401) auth.expire();
              return throwError(() => retryError);
            }),
          );
        }),
      );
    }),
  );
};
