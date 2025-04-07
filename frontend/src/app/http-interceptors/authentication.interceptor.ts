import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { PersistenceService } from '../service/persistence.service';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private store: PersistenceService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.store.getItem<string>('jwtToken')).pipe(
      switchMap(token => {
        if (token) {
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          });
        }
        return next.handle(req);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          return this.authService.getAuthToken().pipe(
            catchError(err => {
              throw new Error('Could not authenticate user ...')
            }),
            switchMap(newToken => {
              return from(this.store.setItem('jwtToken', newToken)).pipe(
                switchMap(() => {
                  req = req.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` },
                  });
                  return next.handle(req);
                })
              );
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
