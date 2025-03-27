import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CompletePost, PostService } from '../../../service/post.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { PostComponent } from '../../shared/post/post.component';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatProgressSpinnerModule, NgIf, MatIconModule, AsyncPipe, PostComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  posts$: Observable<CompletePost[]>;

  constructor(
    private postService: PostService
  ) {
    this.posts$ = this.postService.getAllPosts();
  }

}
