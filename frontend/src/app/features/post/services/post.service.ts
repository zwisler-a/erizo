import {Injectable} from '@angular/core';
import {firstValueFrom, from, map, mergeMap, Observable, OperatorFunction, switchMap, tap,} from 'rxjs';
import imageCompression from 'browser-image-compression';

import {PushNotificationSchema} from '@capacitor/push-notifications';
import {PostDto} from '../../../api/models/post-dto';
import {EncryptionService} from '../../../core/crypto/encryption.service';
import {filterAsync, IndexedDBStore} from '../../../util/local-storage-record';
import {ApiPostService} from '../../../api/services/api-post.service';
import {
  NotificationPayload,
  NotificationService,
  NotificationType
} from '../../notification/services/notification.service';
import {UserEntity} from '../../../api/models/user-entity';
import {PostFeed} from './post-feed.dto';
import {PostEncryptionService} from './post-encryption.service';
import {DecryptedPost} from '../types/decrypted-post.interface';

@Injectable({
  providedIn: 'root',
})
export class PostService {

  private postCache: IndexedDBStore = new IndexedDBStore('erizo_images', 'images', 1000 * 60 * 60 * 24 * 14);
  public homeFeed: PostFeed;
  private threadFeeds: Record<string, PostFeed> = {};

  constructor(
    private encryptionService: EncryptionService,
    private postEncryptionService: PostEncryptionService,
    private postsApi: ApiPostService,
    private notificationService: NotificationService,
  ) {
    this.homeFeed = new PostFeed(
      (opts) => this.postsApi.getAllPostIds(opts),
      this.getPostsByIds(),
      this.postDecryptionPipe(),
    );
    this.notificationService.getNotifications().subscribe(
      notifications => notifications.forEach(notification => this.handleNotification(notification)),
    );
  }

  clearImageCache() {
    this.postEncryptionService.evictCache();
    return this.postCache.clear();
  }

  clearImageCacheFor(postId: number) {
    this.postEncryptionService.evictCache();
    return this.postCache.delete(postId);
  }


  private handleNotification(notification: PushNotificationSchema) {
    if (!notification.data) return;
    if (notification.data['type'] == NotificationType.NEW_POST) {
      const data = notification.data as any as NotificationPayload;
      if (!data.post_id) return;
      this.addPostToFeeds(Number.parseInt(data.post_id));
    }
    if (notification.data['type'] == NotificationType.LIKE_POST) {
      const data = notification.data as any as NotificationPayload;
      if (!data.post_id) return;
      this.postEncryptionService.evictCache(Number.parseInt(data.post_id));
      this.postCache.delete(Number.parseInt(data.post_id));
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

  private reloadPosts() {
    this.homeFeed.reload();
    Object.keys(this.threadFeeds).map(threadId => this.threadFeeds[threadId].reload());
  }

  getAllPostsFor(threadId: number): PostFeed {
    if (!!this.threadFeeds[threadId]) return this.threadFeeds[threadId];
    const feed = new PostFeed(
      (opts) => this.postsApi.getPostIdsInThread({threadId, ...opts}),
      this.getPostsByIds(),
      this.postDecryptionPipe(),
      9 * 2,
    );
    this.threadFeeds[threadId] = feed;
    return feed;
  }

  getPost(postId: number): Observable<DecryptedPost> {
    return from([[postId]]).pipe(
      this.getPostsByIds(),
      this.postDecryptionPipe(),
      map(post => post[0]),
    );
  }


  deletePost(id: number) {
    return this.postsApi.delete({postId: id}).pipe(
      tap(() => this.removePostFromFeeds(id)),
    );
  }

  likePost(id: number) {
    return this.postsApi.like({postId: id}).subscribe(() => {
      this.postCache.delete(id);
      this.postEncryptionService.evictCache(id);
    });
  }

  async publishPost(file: File, threadId: number, contacts: UserEntity[], textMessage?: string, daysToLive?: number, nsfw?: boolean, isVideo?: boolean) {
    let compressedFile;
    if(!isVideo) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      compressedFile = await imageCompression(file, options);
    } else {
      compressedFile = file;
    }

    const message = await this.postEncryptionService.encryptPost(compressedFile, textMessage ?? '', contacts);
    const response = await firstValueFrom(this.postsApi.publish({
      body: {
        ...message,
        days_to_live: daysToLive,
        thread_id: threadId,
        nsfw,
        type: isVideo ? 'video' : 'image',
      },
    }));
    this.addPostToFeeds(response.post_id);
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
              res.forEach(post => this.postCache.set(post.id, post));
            }),
          );

          return [...cachedPosts, ...(await firstValueFrom(uncachedPosts))];
        }),
      );
  }

  private postDecryptionPipe(): OperatorFunction<PostDto[], DecryptedPost[]> {
    return (source) => source.pipe(
      mergeMap(async posts =>
        Promise.all(posts.map(async post => await this.postEncryptionService.decryptPost(post))),
      ),
    );
  }

  async comment(id: number, users: UserEntity[], value: string) {
    const comment = await this.encryptionService.encryptText(value, users);
    this.postsApi.comment({
      body: {
        post_id: id,
        iv: comment.iv,
        content: comment.message,
        recipients: comment.recipients,
        sender_fingerprint: comment.sender_fingerprint,
      },
    }).subscribe(() => {
      this.postCache.delete(id);
      this.postEncryptionService.evictCache(id);
      this.reloadPosts();
    });
  }
}
