import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {EMPTY, map, Observable} from 'rxjs';
import {ThreadEntity} from '../../../api/models/thread-entity';
import {ApiThreadService} from '../../../api/services/api-thread.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {URLS} from '../../../app.routes';
import {catchError} from 'rxjs/operators';
import {ERROR_SNACKBAR} from '../../../util/snackbar-consts';

@Injectable({providedIn: 'root'})
export class ThreadDataResolver implements Resolve<ThreadEntity> {
  constructor(private threadApi: ApiThreadService,
              private router: Router,
              private snackBar: MatSnackBar) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ThreadEntity> {
    const threadId = route.paramMap.get('id');

    if (!threadId) {
      this.router.navigateByUrl(URLS.HOME);
      this.snackBar.open("Unsure which thread you wanted to open...", "Ok", ERROR_SNACKBAR);
      return EMPTY;
    }

    return this.threadApi.getThread({threadId: threadId}).pipe(
      map((res: ThreadEntity) => {
        if (!res) throw new Error('Thread does not exist');
        return res;
      }),
      catchError(err => {
        this.snackBar.open("There is no such thread with this id.", "Ok", ERROR_SNACKBAR);
        return EMPTY
      })
    );
  }
}
