import { Component, ElementRef, HostListener } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { CompletePost, PostFeed, PostService } from '../../../service/post.service';
import { Observable, shareReplay, Subject } from 'rxjs';
import { ApiThreadService } from '../../../api/services/api-thread.service';
import { ThreadEntity } from '../../../api/models/thread-entity';
import { AliasPipePipe } from '../../shared/alias-pipe/alias.pipe';
import { URLS } from '../../../app.routes';
import { BlurDirective } from '../../shared/blur-directive/blur.directive';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { UploadPostJourneyService } from '../upload-page/upload-post-journey.service';
import { PullToRefreshComponent } from '../../shared/pull-to-refresh/pull-to-refresh.component';

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
    AliasPipePipe,
    MatProgressSpinner,
    MatIconButton,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    PullToRefreshComponent,
  ],
  templateUrl: './thread-page.component.html',
  styleUrl: './thread-page.component.css',
})
export class ThreadPageComponent {
  posts?: PostFeed;
  thread: ThreadEntity;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private uploadJourney: UploadPostJourneyService,
    private el: ElementRef,
  ) {
    this.thread = this.route.snapshot.data['thread'];
    if (this.thread) {
      this.initImages(this.thread.id);
    }
  }


  sendImage(id: number) {
    this.uploadJourney.start(id);
  }


  async initImages(threadId: number) {
    this.posts = this.postService.getAllPostsFor(threadId);
    this.posts.next();
  }

  @HostListener('window:scroll', [])
  async onScroll() {
    const element = this.el.nativeElement;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = element.offsetTop + element.clientHeight - 100;

    if (scrollPosition >= threshold) {
      if (!this.posts?.loading$ && !this.posts?.endOfFeed$) {
        this.posts?.next();
      }
    }
  }

  protected readonly URLS = URLS;

  refresh(event: Subject<any>) {
    this.posts?.reset();
    setTimeout(() => {
      this.posts?.next();
      event.next('');
    });
  }
}
