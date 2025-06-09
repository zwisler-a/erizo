import {BehaviorSubject, map, Observable, OperatorFunction, shareReplay, tap} from 'rxjs';
import {IdsPage} from '../../../api/models/ids-page';
import {PostDto} from '../../../api/models/post-dto';
import {DecryptedPost} from '../types/decrypted-post.interface';

export class PostFeed {
  public feedIds$ = new BehaviorSubject<number[]>([]);
  public feed$: Observable<DecryptedPost[]>;
  public loading$ = new BehaviorSubject<boolean>(false);
  public endOfFeed$ = new BehaviorSubject(false);
  private currentPage = 0;

  constructor(
    private loadPage: (opts: { page: number, limit: number }) => Observable<IdsPage>,
    private idsToPostPipe: OperatorFunction<number[], PostDto[]>,
    private decryptionPipe: OperatorFunction<PostDto[], DecryptedPost[]>,
    private pageSize = 3,
  ) {
    this.feed$ = this.feedIds$.pipe(
      tap(_ => this.loading$.next(true)),
      map(ids => [...new Set(ids)]),
      this.idsToPostPipe,
      this.decryptionPipe,
      map(post => post.sort((a, b) => b.created_at - a.created_at)),
      tap(_ => this.loading$.next(false)),
      shareReplay(1),
    );
  }


  public next() {
    if (this.loading$.value) return;
    this.loading$.next(true);
    this.loadPage({ page: this.currentPage, limit: this.pageSize }).subscribe(page => {
      this.currentPage++;
      if (!page.data.length) {
        this.endOfFeed$.next(true);
      }
      this.feedIds$.next([...this.feedIds$.value, ...page.data]);
    });
  }

  addPost(id: number) {
    this.feedIds$.next([id, ...this.feedIds$.value]);
  }

  removePost(id: number) {
    this.feedIds$.next([...this.feedIds$.value.filter(a => a !== id)]);
  }

  public reload() {
    this.feedIds$.next(this.feedIds$.value);
  }

  public reset() {
    this.currentPage = 0;
    this.endOfFeed$.next(false);
    this.feedIds$.next([]);
    this.next();
  }
}
