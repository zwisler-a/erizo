import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {finalize} from 'rxjs/operators';

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
        this.activeRequests = this.activeRequests-1;
        if (this.activeRequests === 0) {
          this.loading$.next(false);
        }
      })
    );
  }
}
