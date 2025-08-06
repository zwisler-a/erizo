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
import { PostService} from '../../services/post.service';
import {KeyService} from '../../../../core/crypto/key.service';
import {ConfirmationService} from '../../../../shared/services/confirmation.service';
import {URLS} from '../../../../app.routes';
import {DecryptedPost} from '../../types/decrypted-post.interface';
import {CommentsViewComponent} from '../comments-view/comments-view.component';
import {MatBottomSheet, MatBottomSheetModule} from '@angular/material/bottom-sheet';

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
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent {
  protected readonly URLS = URLS;
  @Input()
  post!: DecryptedPost;

  isOwn;
  isLiked;
  showNewComment = false;

  constructor(
    private keyService: KeyService,
    private postService: PostService,
    private confirmationService: ConfirmationService,
    private bottomSheet: MatBottomSheet
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
}
