import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { AsyncPipe, Location, NgIf } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {PostComponent} from '../post/post.component';
import {PullToRefreshComponent} from '../../../../shared/components/pull-to-refresh/pull-to-refresh.component';
import {PostService} from '../../services/post.service';
import {DecryptedPost} from '../../types/decrypted-post.interface';

@Component({
  selector: 'app-post-view',
  imports: [
    PostComponent,
    AsyncPipe,
    NgIf,
    MatIconButton,
    MatIcon,
    PullToRefreshComponent,
  ],
  templateUrl: './post-view.component.html',
  styleUrl: './post-view.component.css',
})
export class PostViewComponent {
  post$!: Observable<DecryptedPost>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private postService: PostService,
  ) {
    this.loadPost();
  }

  navigateBack() {
    this.location.back();
  }

  async refresh(event: Subject<any>) {
    const postId = this.route.snapshot.paramMap.get('postId');
    if (!postId) return;
    await this.postService.clearImageCacheFor(Number.parseInt(postId));
    this.loadPost();
    setTimeout(()=>{
      event.next('')
    },100)
  }

  private loadPost() {
    const postId = this.route.snapshot.paramMap.get('postId');
    if (!postId) {
      this.router.navigateByUrl('/');
    } else {
      this.post$ = this.postService.getPost(Number.parseInt(postId)).pipe();
    }
  }
}
