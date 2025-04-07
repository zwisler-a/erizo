import {Injectable} from '@angular/core';
import {DecryptedPost, EncryptionService} from './encryption.service';
import {
  BehaviorSubject,
  firstValueFrom,
  from,
  map,
  mergeMap,
  Observable,
  OperatorFunction,
  shareReplay,
  switchMap,
  tap
} from 'rxjs';
import {ContactService} from './contact.service';
import {DomSanitizer} from '@angular/platform-browser';
import imageCompression from 'browser-image-compression';
import {UserEntity} from '../api/models/user-entity';
import {ApiPostService} from '../api/services/api-post.service';
import {PostDto} from '../api/models/post-dto';
import {IdsPage} from '../api/models/ids-page';
import {filterAsync, IndexedDBStore} from '../util/local-storage-record';
import {NotificationPayload, NotificationService, NotificationType} from './notification.service';
import {MessagePayload} from '@angular/fire/messaging';

export type CompletePost = PostDto & DecryptedPost & { alias: string } & { url: any };

export class PostFeed {
  public feedIds$ = new BehaviorSubject<number[]>([]);
  public feed$: Observable<CompletePost[]>;
  public loading$ = new BehaviorSubject<boolean>(false);
  public endOfFeed$ = new BehaviorSubject(false);
  private currentPage = 0;

  constructor(
    private loadPage: (opts: { page: number, limit: number }) => Observable<IdsPage>,
    private idsToPostPipe: OperatorFunction<number[], PostDto[]>,
    private decryptionPipe: OperatorFunction<PostDto[], CompletePost[]>,
    private pageSize = 3
  ) {
    this.feed$ = this.feedIds$.pipe(
      this.idsToPostPipe,
      this.decryptionPipe,
      map(post => post.sort((a, b) => b.created_at - a.created_at)),
      tap(res => {
        this.loading$.next(false);
      }),
      shareReplay(1)
    );
  }


  public next() {
    if (this.loading$.value) return;
    this.loading$.next(true);
    this.loadPage({page: this.currentPage, limit: this.pageSize}).subscribe(page => {
      this.currentPage++;
      if (!page.data.length) {
        this.endOfFeed$.next(true);
      }
      this.feedIds$.next([...this.feedIds$.value, ...page.data])
    })
  }

  addPost(id: number) {
    this.feedIds$.next([id, ...this.feedIds$.value]);
  }

  removePost(id: number) {
    this.feedIds$.next([...this.feedIds$.value.filter(a => a !== id)]);
  }

  public reset() {
    this.currentPage = 0;
    this.endOfFeed$.next(false);
    this.feedIds$.next([]);
    this.next();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PostService {

  private postCache: IndexedDBStore = new IndexedDBStore("erizo_images", "images", 1000 * 60 * 60 * 24 * 14);
  public homeFeed: PostFeed;
  private threadFeeds: Record<string, PostFeed> = {};

  constructor(
    private encryptionService: EncryptionService,
    private contactService: ContactService,
    private sanitizer: DomSanitizer,
    private postsApi: ApiPostService,
    private notificationService: NotificationService
  ) {
    this.homeFeed = new PostFeed(
      (opts) => this.postsApi.getAllPostIds(opts),
      this.getPostsByIds(),
      this.postDecryptionPipe()
    );
    this.notificationService.getNotifications().subscribe(
      notifications => notifications.forEach(notification => this.handleNotification(notification))
    )
  }


  private handleNotification(notification: MessagePayload) {
    if (!notification.data) return;
    if (notification.data["type"] == NotificationType.NEW_POST) {
      const data = notification.data as any as NotificationPayload;
      if (!data.post_id) return;
      this.addPostToFeeds(Number.parseInt(data.post_id));
    }
  }

  private addPostToFeeds(id: number) {
    this.homeFeed.addPost(id);
    Object.keys(this.threadFeeds).map(threadId => this.threadFeeds[threadId].addPost(id));
  }

  private removePostFromFeeds(id: number) {
    this.homeFeed.removePost(id);
    Object.keys(this.threadFeeds).map(threadId => this.threadFeeds[threadId].removePost(id));
  }

  getAllPostsFor(threadId: number): PostFeed {
    if (!!this.threadFeeds[threadId]) return this.threadFeeds[threadId];
    const feed = new PostFeed(
      (opts) => this.postsApi.getPostIdsInThread({threadId, ...opts}),
      this.getPostsByIds(),
      this.postDecryptionPipe(),
      9 * 2
    )
    this.threadFeeds[threadId] = feed;
    return feed;
  }

  getPost(postId: number): Observable<CompletePost> {
    return from([[postId]]).pipe(
      this.getPostsByIds(),
      this.postDecryptionPipe(),
      map(post => post[0])
    )
  }


  deletePost(id: number) {
    return this.postsApi.delete({postId: id}).pipe(
      tap(() => this.removePostFromFeeds(id)),
    );
  }

  likePost(id: number) {
    return this.postsApi.like({postId: id});
  }

  async publishPost(file: File, chatId: number, contacts: UserEntity[], textMessage?: string, daysToLive?: number, nsfw?: boolean) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);
    const message = await this.encryptionService.encryptImage(compressedFile, textMessage ?? '', contacts);
    this.postsApi.publish({
      body: {
        ...message,
        days_to_live: daysToLive,
        chat_id: chatId,
        nsfw
      }
    }).subscribe((response) => {
      this.addPostToFeeds(response.post_id);
    });
  }

  private getPostsByIds(): OperatorFunction<number[], PostDto[]> {
    return source$ =>
      source$.pipe(
        switchMap(async ids => {
          const cachedIds = await filterAsync(ids, id => this.postCache.has(id));
          const uncachedIds = await filterAsync(ids, async id => !(await this.postCache.has(id)));
          const cachedPosts: PostDto[] = await Promise.all(cachedIds.map(id => this.postCache.get<PostDto>(id))) as any;
          if (!uncachedIds.length) return cachedPosts;
          const uncachedPosts = this.postsApi.getPosts({ids: uncachedIds}).pipe(
            tap(res => {
              res.forEach(post => this.postCache.set(post.id, post))
            })
          )

          return [...cachedPosts, ...(await firstValueFrom(uncachedPosts))]
        })
      )
  }

  private postDecryptionPipe(): OperatorFunction<PostDto[], CompletePost[]> {
    return (source) => {
      return source.pipe(
        mergeMap(async messages =>
          Promise.all(messages.map(async message => {
            try {
              const decryptedPost = await this.encryptionService.decryptMessage(message);
              return ({...message, ...decryptedPost});
            } catch (e) {
              console.error(e);
            }
            return {...message, decryptionError: true};
          })),
        ),
        mergeMap(async messages => {
          const mapped = messages.map(async message => ({
              ...message,
              alias: await this.contactService.getAlias(message.sender_fingerprint) ?? message.sender_fingerprint,
            }),
          );
          return Promise.all(mapped);
        }),
        this.createUrlPipe(),
      );
    };
  }

  private createUrlPipe(): OperatorFunction<any[], CompletePost[]> {
    return source => {
      return source.pipe(
        map(messages => {
          return messages.map(msg => {
            const uint8Array = new Uint8Array(msg.data);
            const binary = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '');
            const base64String = window.btoa(binary);
            const url = this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${base64String}`);
            return ({...msg, url} as any);
          });
        }),
      );
    };
  }


}
