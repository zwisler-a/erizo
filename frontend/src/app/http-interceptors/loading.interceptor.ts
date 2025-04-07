import {Injectable} from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse
} from '@angular/common/http';
import {Observable, BehaviorSubject} from 'rxjs';
import {finalize, tap} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  public loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.activeRequests === 0) {
      this.loading$.next(true);
    }

    this.activeRequests++;

    return next.handle(req).pipe(
      finalize(() => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.loading$.next(false);
        }
      })
    );
  }
}
