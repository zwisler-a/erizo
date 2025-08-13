import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatestWith, map, OperatorFunction, shareReplay, switchMap, tap} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ApiThreadService} from '../../../api/services/api-thread.service';
import {PersistenceService} from '../../../core/services/persistence.service';
import {PostDto} from '../../../api/models/post-dto';

@Injectable({providedIn: 'root'})
export class ThreadService {

  private threads$;
  private reloadThreads$ = new BehaviorSubject<void>(void 0);
  hiddenThreads$ = new BehaviorSubject<number[]>([]);

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
    this.persistence.getItem<number[]>('hidden-threads').then((threads) => {
      this.hiddenThreads$.next(threads ?? [])
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
    let threads = await this.persistence.getItem<number[]>('hidden-threads')
    if (threads === null) {
      threads = []
    }
    threads.push(id);
    this.hiddenThreads$.next(threads);
    await this.persistence.setItem('hidden-threads', threads);
  }

  async showThreadInFeed(id: number) {
    let threads = await this.persistence.getItem<number[]>('hidden-threads')
    if (threads === null) return;
    const i = threads.indexOf(id);
    if (i !== -1) threads.splice(i, 1);
    this.hiddenThreads$.next(threads);
    await this.persistence.setItem('hidden-threads', threads);
  }

  filterPostsByHiddenThreads(): OperatorFunction<PostDto[], PostDto[]> {
    return source => {
      return source.pipe(
        combineLatestWith(this.hiddenThreads$),
        map(([posts, hidden]) => posts.filter(post => !hidden.includes(post.thread.id)))
      )
    }
  }
}
