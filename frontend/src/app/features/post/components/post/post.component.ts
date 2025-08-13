import {Component, Input} from '@angular/core';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatIconButton} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatBadge} from '@angular/material/badge';
import {ReactiveFormsModule} from '@angular/forms';
import {BlurDirective} from '../../../../shared/directives/blur.directive';
import {LinkPipe} from '../../../../shared/pipes/link.pipe';
import {AliasPipePipe} from '../../../../shared/pipes/alias.pipe';
import {PostService} from '../../services/post.service';
import {KeyService} from '../../../../core/crypto/key.service';
import {ConfirmationService} from '../../../../shared/services/confirmation.service';
import {URLS} from '../../../../app.routes';
import {DecryptedPost} from '../../types/decrypted-post.interface';
import {CommentsViewComponent} from '../comments-view/comments-view.component';
import {MatBottomSheet, MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {ContactService} from '../../../connection/services/contact.service';
import {BehaviorSubject, from, Observable} from 'rxjs';

@Component({
  selector: 'app-post',
  imports: [
    DatePipe,
    MatIcon,
    NgIf,
    RouterLink,
    MatMenuModule,
    AsyncPipe,
    BlurDirective,
    MatIconButton,
    LinkPipe,
    NgForOf,
    AliasPipePipe,
    MatBadge,
    ReactiveFormsModule,
    CommentsViewComponent,
    MatBottomSheetModule
  ],
  providers: [AliasPipePipe],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent {
  protected readonly URLS = URLS;

  @Input() set post(value: DecryptedPost) {
    this._post = value;
    this.updatePostTitle();
  }

  get post(): DecryptedPost {
    return this._post;
  }

  private _post: any;
  postTitle$ = new BehaviorSubject<string>('');

  isOwn;
  isLiked;

  constructor(
    private keyService: KeyService,
    private postService: PostService,
    private confirmationService: ConfirmationService,
    private bottomSheet: MatBottomSheet,
    private contactService: ContactService
  ) {
    this.isOwn = this.isOwnEval();
    this.isLiked = this.isLikedByUser();
  }

  async isOwnEval() {
    return (await this.keyService.getOwnFingerprint() == this.post.sender_fingerprint);
  }

  async isLikedByUser() {
    const ownFp = await this.keyService.getOwnFingerprint();
    return !!this.post.likes?.find((like: any) => like.userFingerprint == ownFp);
  }

  deletePost() {
    if (!this.isOwn) return;
    this.confirmationService.confirm('Delete this post?').subscribe(
      result => {
        if (result) {
          this.postService.deletePost(this.post.id).subscribe();
        }
      },
    );
  }

  async likePost() {
    if (!(await this.isLiked)) {
      this.isLiked = Promise.resolve(true);
      this.postService.likePost(this.post.id);
    }
  }

  openComments() {
    const bottomSheetRef = this.bottomSheet.open(CommentsViewComponent, {
      data: {post: this.post},
      ariaLabel: 'Comments',
      panelClass: 'bottomsheet-comments',
    });
  }

  private async updatePostTitle() {
    if (this.post?.thread?.name) {
      const alias = await this.contactService.getAlias(this.post.sender_fingerprint);
      this.postTitle$.next(`${alias} @ ${this.post.thread.name}`);
      return;
    }

    if (this.post?.thread?.participants?.length === 2) {
      const ownFp = await this.keyService.getOwnFingerprint();
      if (!ownFp) throw new Error(`${this.post.thread.name} not found`);


      const recps = this.post.thread.participants.filter(
        (participant: any) => participant.fingerprint !== this.post.sender_fingerprint
      );
      if (recps.length !== 1) return;
      const recp = recps[0];
      if (!recp?.fingerprint) {
        this.postTitle$.next('Unknown');
        return;
      }

      const senderAlias = await this.contactService.getAlias(this.post.sender_fingerprint);
      const recpAlias = await this.contactService.getAlias(recp.fingerprint);
      this.postTitle$.next(`${senderAlias} to ${recpAlias}`);
      return;
    }

    this.postTitle$.next('');
  }


  setNsfw() {
    this.postService.update({
      id: this.post.id,
      nsfw: true
    });
  }
  unsetNsfw() {
    this.postService.update({
      id: this.post.id,
      nsfw: false
    })
  }
}
