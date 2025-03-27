import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { CompletePost, PostService } from '../../../service/post.service';
import { Observable } from 'rxjs';
import { ApiThreadService } from '../../../api/services/api-thread.service';
import { ThreadEntity } from '../../../api/models/thread-entity';
import { AliasPipePipe } from '../../shared/alias-pipe/alias.pipe';
import { URLS } from '../../../app.routes';
import { BlurDirective } from '../../shared/blur-directive/blur.directive';

@Component({
  selector: 'app-thread-page',
  imports: [
    MatButton,
    MatIcon,
    AsyncPipe,
    NgIf,
    NgForOf,
    AliasPipePipe,
    BlurDirective,
    RouterLink,
  ],
  templateUrl: './thread-page.component.html',
  styleUrl: './thread-page.component.css',
})
export class ThreadPageComponent {
  posts$?: Observable<CompletePost[]>;
  thread$?: Observable<ThreadEntity>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private threadApi: ApiThreadService,
  ) {
    const threadId = this.route.snapshot.paramMap.get('id');
    if (!threadId) {
      this.router.navigateByUrl('/');
    } else {
      this.initImages(Number.parseInt(threadId));
    }
  }


  sendImage(id: number) {
    this.router.navigateByUrl(URLS.UPLOAD_IMAGE_FN(id.toString()));
  }


  async initImages(threadId: number) {
    this.thread$ = this.threadApi.getThread({ threadId: threadId.toString() });
    this.posts$ = this.postService.getAllPostsFor(threadId);
  }

  protected readonly URLS = URLS;
}
