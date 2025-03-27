import { Component, Input } from '@angular/core';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { CompletePost, PostService } from '../../../service/post.service';
import { RouterLink } from '@angular/router';
import { URLS } from '../../../app.routes';
import { MatIconButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { KeyService } from '../../../service/key.service';
import { ConfirmationService } from '../../../service/confirmation.service';
import { BlurDirective } from '../blur-directive/blur.directive';

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
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent {
  protected readonly URLS = URLS;
  @Input()
  post!: CompletePost;

  isOwn;
  isLiked: boolean = false;

  constructor(
    private keyService: KeyService,
    private postService: PostService,
    private confirmationService: ConfirmationService
  ) {
    this.isOwn = this.isOwnEval();
  }

  async isOwnEval() {
    return (await this.keyService.getOwnFingerprint() == this.post.sender_fingerprint);
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
    if(!this.isLiked) {
      this.isLiked = true;
      this.postService.likePost(this.post.id).subscribe()
    }
  }
}
