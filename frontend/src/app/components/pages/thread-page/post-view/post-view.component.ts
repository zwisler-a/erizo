import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompletePost, PostService } from '../../../../service/post.service';
import { Observable } from 'rxjs';
import { PostComponent } from '../../../shared/post/post.component';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-post-view',
  imports: [
    PostComponent,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: './post-view.component.html',
  styleUrl: './post-view.component.css',
})
export class PostViewComponent {
  post$!: Observable<CompletePost>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
  ) {
    const postId = this.route.snapshot.paramMap.get('postId');
    if (!postId) {
      this.router.navigateByUrl('/');
    } else {
      this.post$ = postService.getPost(Number.parseInt(postId)).pipe();
    }
  }

}
