import { Injectable } from '@angular/core';
import { DecryptedPost, EncryptionService } from './encryption.service';
import { BehaviorSubject, map, mergeMap, Observable, OperatorFunction, shareReplay, switchMap, tap } from 'rxjs';
import { ContactService } from './contact.service';
import { DomSanitizer } from '@angular/platform-browser';
import imageCompression from 'browser-image-compression';
import { UserEntity } from '../api/models/user-entity';
import { NotificationService } from './notification.service';
import { ApiPostService } from '../api/services/api-post.service';
import { PostDto } from '../api/models/post-dto';
import { filter } from 'rxjs/operators';

export type CompletePost = PostDto & DecryptedPost & { alias: string } & { url: any };

@Injectable({
  providedIn: 'root',
})
export class PostService {

  private reloadMessages = new BehaviorSubject<void>(void 0);
  private posts = this.reloadMessages.pipe(
    switchMap(() => this.postsApi.getAllPosts({})),
    map(messages => messages.sort((a, b) => b.created_at - a.created_at)),
    this.postDecryptionPipe(),
    shareReplay(1),
  );

  constructor(
    private encryptionService: EncryptionService,
    private contactService: ContactService,
    private sanitizer: DomSanitizer,
    private postsApi: ApiPostService,
    private notificationService: NotificationService,
  ) {

    // Hack to reload messages when new ones arrive
    this.notificationService.getNotifications().subscribe(notifications => {
      if (notifications && notifications.length > 0) {
        this.reloadMessages.next();
      }
    });
    this.reloadMessages.subscribe(_ => {
      console.log('Reloading messages');
    });
  }


  getAllPosts(): Observable<CompletePost[]> {
    return this.posts.pipe();
  }

  getAllPostsFor(threadId: number): Observable<CompletePost[]> {
    return this.posts.pipe(
      map(posts => posts.filter(post => post.chat.id === threadId)),
    );
  }

  getPost(postId: number): Observable<CompletePost> {
    return this.posts.pipe(
      map(posts => posts.find(post => post.id === postId)),
      filter(post => !!post),
    );
  }

  async publishPost(file: File, chatId: number, contacts: UserEntity[], textMessage?: string, daysToLive?: number, nsfw?: boolean) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);
    const message = await this.encryptionService.encryptImage(compressedFile, textMessage ?? '', contacts);
    this.postsApi.publish({ body: { ...message, days_to_live: daysToLive, chat_id: chatId, nsfw } }).subscribe(() => {
      this.reloadMessages.next();
    });
  }

  private postDecryptionPipe(): OperatorFunction<PostDto[], CompletePost[]> {
    return (source) => {
      return source.pipe(
        mergeMap(async messages =>
          Promise.all(messages.map(async message => {
            try {
              const decryptedPost = await this.encryptionService.decryptMessage(message);
              return ({ ...message, ...decryptedPost });
            } catch (e) {
              console.error(e);
            }
            return { ...message, decryptionError: true };
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
            return ({ ...msg, url } as any);
          });
        }),
      );
    };
  }


  deletePost(id: number) {
    return this.postsApi.delete({ postId: id }).pipe(
      tap(() => this.reloadMessages.next()),
    );
  }


  likePost(id: number) {
    return this.postsApi.like({ postId: id });
  }
}
