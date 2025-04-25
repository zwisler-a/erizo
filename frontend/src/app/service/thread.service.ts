import {Injectable} from '@angular/core';
import {BehaviorSubject, interval, map, shareReplay, switchMap} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ApiThreadService} from '../api/services/api-thread.service';

@Injectable({providedIn: 'root'})
export class ThreadService {

  private threads$;
  private reloadThreads$ = new BehaviorSubject<void>(void 0);

  constructor(
    private snackBar: MatSnackBar,
    private threadApi: ApiThreadService,
  ) {
    this.threads$ = this.reloadThreads$.pipe(
      switchMap(_ => this.threadApi.getThreads()),
      map(threads => threads.filter(t => !!t.owner)),
      shareReplay(1)
    )
  }

  getThreads() {
    return this.threads$.pipe();
  }

  deleteThread(id: number) {
    this.reloadThreads$.next();
    return this.threadApi.deleteThread({threadId: id});
  }
}
