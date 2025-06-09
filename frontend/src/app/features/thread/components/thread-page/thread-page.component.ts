import {Component, ElementRef, HostListener} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {Subject} from 'rxjs';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AliasPipePipe} from '../../../../shared/pipes/alias.pipe';
import {BlurDirective} from '../../../../shared/directives/blur.directive';
import {PullToRefreshComponent} from '../../../../shared/components/pull-to-refresh/pull-to-refresh.component';
import {PostFeed, PostService} from '../../../post/services/post.service';
import {ThreadEntity} from '../../../../api/models/thread-entity';
import {UploadPostJourneyService} from '../../../post/services/upload-post-journey.service';
import { URLS } from '../../../../app.routes';

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
