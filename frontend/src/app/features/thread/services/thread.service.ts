import {Injectable} from '@angular/core';
import {BehaviorSubject, map, shareReplay, switchMap, tap} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ApiThreadService} from '../../../api/services/api-thread.service';
import {PersistenceService} from '../../../core/services/persistence.service';

@Injectable({providedIn: 'root'})
export class ThreadService {

  private threads$;
  private reloadThreads$ = new BehaviorSubject<void>(void 0);
  hiddenThreads$ = new BehaviorSubject<Set<number>>(new Set());

  constructor(
    private snackBar: MatSnackBar,
    private threadApi: ApiThreadService,
    private persistence: PersistenceService,
  ) {
    this.threads$ = this.reloadThreads$.pipe(
      switchMap(_ => this.threadApi.getThreads()),
      map(threads => threads.filter(t => !!t.owner)),
      shareReplay(1)
    )
    this.persistence.getItem<Set<number>>('hidden-threads').then((threads) => {
      this.hiddenThreads$.next(new Set(threads ?? []) ?? new Set())
    })
  }

  getThreads() {
    return this.threads$.pipe();
  }

  deleteThread(id: number) {
    return this.threadApi.deleteThread({threadId: id}).pipe(
      tap(() => this.reloadThreads$.next())
    );
  }

  createThread(param: { body: { participants: string[]; name: string } }) {
    return this.threadApi.createThread(param).pipe(
      tap(() => this.reloadThreads$.next())
    );
  }

  getThread(threadId: number) {
    return this.threadApi.getThread({threadId})
  }

  refresh() {
    this.reloadThreads$.next(void 0);
  }

  async hideThreadInFeed(id: number) {
    let threads = new Set(await this.persistence.getItem<Set<number>>('hidden-threads'));
    if (threads === null) {
      threads = new Set<number>();
    }
    threads.add(id);
    this.hiddenThreads$.next(threads);
    await this.persistence.setItem('hidden-threads', threads);
  }

  async showThreadInFeed(id: number) {
    let threads = new Set(await this.persistence.getItem<Set<number>>('hidden-threads') ?? [])
    if (threads === null) return;
    threads.delete(id);
    this.hiddenThreads$.next(threads);
    await this.persistence.setItem('hidden-threads', threads);
  }

}
